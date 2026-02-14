import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth, { type NextAuthOptions } from "next-auth"
import type { Adapter } from "next-auth/adapters"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "./db"
import { logger } from "@/lib/logger"

export const authOptions: NextAuthOptions = {
  // Use PrismaAdapter for user/account creation, but JWT for sessions
  adapter: PrismaAdapter(db) as Adapter,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    // Google OAuth - requires credentials
    ...(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim() ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID.trim(),
        clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      })
    ] : []),
    // Email magic link - requires Resend API key
    ...(process.env.RESEND_API_KEY?.trim() ? [
      EmailProvider({
        server: {
          host: 'smtp.resend.com',
          port: 465,
          auth: {
            user: 'resend',
            pass: process.env.RESEND_API_KEY.trim(),
          },
        },
        from: process.env.EMAIL_FROM?.trim() || 'noreply@avisionforyou.org',
      })
    ] : []),
    // Credentials provider - proper password validation
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        try {
          // Find user in database
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            throw new Error('Invalid credentials')
          }

          if (!user.passwordHash) {
            throw new Error('Invalid credentials')
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash)
          
          if (!isValidPassword) {
            throw new Error('Invalid credentials')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          logger.error({ err: error }, 'Auth credentials error')
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        // Handle redirects after OAuth
        // If url is relative, make it absolute
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`
        }
        
        // Try to parse URL to check origin
        try {
          const urlObj = new URL(url)
          if (urlObj.origin === baseUrl) {
            return url
          }
        } catch (urlError) {
          // If URL parsing fails, treat as relative
          logger.error({ err: urlError }, 'Error parsing redirect URL')
        }
        
        // Default to dashboard
        return `${baseUrl}/dashboard`
      } catch (error) {
        logger.error({ err: error }, 'Error in redirect callback')
        // Always return a valid URL
        return `${baseUrl}/dashboard`
      }
    },
    async jwt({ token, user, account, trigger }) {
      try {
        // Initial sign in - user object is available
        if (user) {
          try {
            // Ensure user object exists and has required fields
            if (!user || (!user.id && !user.email)) {
              logger.error({ user }, 'Invalid user object in JWT callback')
              // Return token with minimal data
              return token
            }
            
            // Set basic token properties from user object
            if (user.id) {
              token.id = user.id
              token.sub = user.id
            }
            if (user.email) {
              token.email = user.email
            }
            
            // Set default role first to ensure token is always valid
            token.role = user.role || 'USER'
            
            // Try to fetch user role from database (non-blocking)
            // Only if we have either an ID or email
            if (user.id || user.email) {
              try {
                const dbUser = user.id 
                  ? await db.user.findUnique({
                      where: { id: user.id },
                      select: { role: true }
                    })
                  : user.email
                  ? await db.user.findUnique({
                      where: { email: user.email },
                      select: { id: true, role: true }
                    })
                  : null
                
                if (dbUser) {
                  token.role = dbUser.role
                  // If we found user by email, update the ID
                  const dbUserId = 'id' in dbUser ? (dbUser as { id: string }).id : undefined
                  if (!token.id && dbUserId) {
                    token.id = dbUserId
                    token.sub = dbUserId
                  }
                }
              } catch (dbError) {
                // Non-blocking: use default role if DB query fails
                logger.error({ err: dbError }, 'Error fetching user role (non-blocking)')
                // Ensure token still has a role
                if (!token.role) token.role = 'USER'
              }
            }
          } catch (error) {
            // Ensure we always return a valid token even if something fails
            logger.error({ err: error }, 'Error in JWT callback (user block)')
            // Set minimal required fields
            if (user) {
              if (!token.id && user.id) token.id = user.id
              if (!token.sub && user.id) token.sub = user.id
              if (!token.email && user.email) token.email = user.email
            }
            if (!token.role) token.role = 'USER'
          }
        } else if (token.sub) {
          // Subsequent requests - refresh user role from database (non-blocking)
          try {
            const dbUser = await db.user.findUnique({
              where: { id: token.sub as string },
              select: { role: true }
            })
            
            if (dbUser) {
              token.role = dbUser.role
            }
          } catch (error) {
            // Silently fail - keep existing role from token
            if (process.env.NODE_ENV === 'development') {
              logger.debug({ err: error }, 'Could not refresh user role (non-blocking)')
            }
          }
        }
      } catch (outerError) {
        // Catch-all to ensure we never throw
        logger.error({ err: outerError }, 'Critical error in JWT callback')
        // Ensure token has minimum required fields
        if (!token.role) token.role = 'USER'
        if (!token.sub && token.id) token.sub = String(token.id)
      }
      
      // Always return token - never throw or return null/undefined
      return token || { role: 'USER' }
    },
    async session({ session, token }) {
      try {
        if (session.user && token) {
          session.user.id = token.sub || token.id || '';
          session.user.role = token.role || 'USER';
        }
      } catch (error) {
        logger.error({ err: error }, 'Error in session callback')
        // Ensure session is still returned even on error
        if (session.user && token) {
          session.user.id = token.sub || token.id || '';
          session.user.role = token.role || 'USER';
        }
      }
      // Always return session - never throw
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        // Always allow sign-in - PrismaAdapter will handle user creation
        // Only do non-blocking role updates if user exists
        if (user?.email && account) {
          try {
            // Check if user exists (non-blocking)
            const existingUser = await db.user.findUnique({
              where: { email: user.email },
              select: { id: true, role: true }
            })
            
            if (existingUser) {
              // Auto-promote admin email on Google signin (non-blocking)
              if (user.email === process.env.ADMIN_EMAIL && 
                  account.provider === 'google' && 
                  existingUser.role !== 'ADMIN') {
                try {
                  await db.user.update({
                    where: { email: user.email },
                    data: { role: 'ADMIN' },
                  })
                } catch (updateError) {
                  logger.error({ err: updateError }, 'Error promoting user (non-blocking)')
                }
              }
            }
          } catch (error) {
            // Don't block sign-in on errors
            logger.error({ err: error }, 'Error in signIn callback (non-blocking)')
          }
        }
      } catch (error) {
        // Never block sign-in - log and continue
        logger.error({ err: error }, 'Unexpected error in signIn callback')
      }
      
      // Always return true to allow sign-in
      return true
    }
  }
}

export const handler = NextAuth(authOptions)
