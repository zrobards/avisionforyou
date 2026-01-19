import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "./db"

export const authOptions: NextAuthOptions = {
  // Use PrismaAdapter for user/account creation, but JWT for sessions
  adapter: PrismaAdapter(db),
  debug: process.env.NODE_ENV === 'development',
  providers: [
    // Google OAuth - requires credentials
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
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
    ...(process.env.RESEND_API_KEY ? [
      EmailProvider({
        server: {
          host: 'smtp.resend.com',
          port: 465,
          auth: {
            user: 'resend',
            pass: process.env.RESEND_API_KEY,
          },
        },
        from: process.env.EMAIL_FROM || 'noreply@avisionforyou.org',
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
          console.error('Missing email or password')
          throw new Error('Email and password required')
        }

        try {
          // Find user in database
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            console.error('User not found:', credentials.email)
            throw new Error('Invalid credentials')
          }

          if (!user.passwordHash) {
            console.error('User has no password hash:', credentials.email)
            throw new Error('Invalid credentials')
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash)
          
          if (!isValidPassword) {
            console.error('Invalid password for user:', credentials.email)
            throw new Error('Invalid credentials')
          }

          console.log('User authenticated successfully:', credentials.email, 'Role:', user.role)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error instanceof Error ? error.message : String(error))
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
          console.error('Error parsing redirect URL:', urlError)
        }
        
        // Default to dashboard
        return `${baseUrl}/dashboard`
      } catch (error) {
        console.error('Error in redirect callback:', error)
        // Always return a valid URL
        return `${baseUrl}/dashboard`
      }
    },
    async jwt({ token, user, account, trigger }) {
      try {
        // Initial sign in - user object is available
        if (user) {
          try {
            console.log('JWT callback - Initial sign in:', { userId: user?.id, email: user?.email })
            
            // Ensure user object exists and has required fields
            if (!user || (!user.id && !user.email)) {
              console.error('Invalid user object in JWT callback:', user)
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
            token.role = (user as any)?.role || 'USER'
            
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
                  if (!token.id && (dbUser as any).id) {
                    token.id = (dbUser as any).id
                    token.sub = (dbUser as any).id
                  }
                  console.log('Set role from database:', dbUser.role)
                } else {
                  console.log('User not found in database yet - using default role')
                }
              } catch (dbError) {
                // Non-blocking: use default role if DB query fails
                console.error('Error fetching user role (non-blocking):', dbError)
                // Ensure token still has a role
                if (!token.role) token.role = 'USER'
              }
            }
          } catch (error) {
            // Ensure we always return a valid token even if something fails
            console.error('Error in JWT callback (user block):', error)
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
              console.debug('Could not refresh user role (non-blocking):', error)
            }
          }
        }
      } catch (outerError) {
        // Catch-all to ensure we never throw
        console.error('Critical error in JWT callback:', outerError)
        // Ensure token has minimum required fields
        if (!token.role) token.role = 'USER'
        if (!token.sub && token.id) token.sub = token.id
      }
      
      // Always return token - never throw or return null/undefined
      return token || { role: 'USER' }
    },
    async session({ session, token }) {
      try {
        if (session.user && token) {
          (session.user as any).id = token.sub || token.id;
          (session.user as any).role = token.role || 'USER';
          
          // Log session creation for debugging
          if (process.env.NODE_ENV === 'development') {
            console.log('Session callback:', { 
              userId: token.sub || token.id, 
              email: token.email, 
              role: token.role 
            })
          }
        }
      } catch (error) {
        console.error('Error in session callback:', error)
        // Ensure session is still returned even on error
        if (session.user && token) {
          (session.user as any).id = token.sub || token.id || '';
          (session.user as any).role = token.role || 'USER';
        }
      }
      // Always return session - never throw
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        console.log('SignIn callback triggered:', { 
          email: user?.email, 
          userId: user?.id, 
          provider: account?.provider 
        })
        
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
              console.log('User exists in database:', existingUser.id)
              // Auto-promote admin email on Google signin (non-blocking)
              if (user.email === process.env.ADMIN_EMAIL && 
                  account.provider === 'google' && 
                  existingUser.role !== 'ADMIN') {
                try {
                  await db.user.update({
                    where: { email: user.email },
                    data: { role: 'ADMIN' },
                  })
                  console.log('Promoted user to ADMIN')
                } catch (updateError) {
                  console.error('Error promoting user (non-blocking):', updateError)
                }
              }
            } else {
              console.log('User not found - PrismaAdapter will create it')
            }
          } catch (error) {
            // Don't block sign-in on errors
            console.error('Error in signIn callback (non-blocking):', error)
          }
        }
      } catch (error) {
        // Never block sign-in - log and continue
        console.error('Unexpected error in signIn callback:', error)
      }
      
      // Always return true to allow sign-in
      return true
    }
  }
}

export const handler = NextAuth(authOptions)
