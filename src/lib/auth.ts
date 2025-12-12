import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    // Google OAuth - requires credentials
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true
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
          throw new Error('Email and password required')
        }

        try {
          const bcrypt = require('bcryptjs')
          
          // Find user in database
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.passwordHash) {
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
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.sub = user.id
        token.email = user.email
        // Use role from user object directly
        token.role = (user as any).role || 'USER'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.sub || token.id;
        (session.user as any).role = token.role || 'USER';
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Auto-promote admin email on Google signin
      if (user?.email === process.env.ADMIN_EMAIL && account?.provider === 'google') {
        await db.user.update({
          where: { email: user.email },
          data: { role: 'ADMIN' },
        })
      }
      return true
    }
  }
}

export const handler = NextAuth(authOptions)
