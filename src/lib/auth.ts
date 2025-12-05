import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
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
    // Development/Testing credentials provider - only in dev mode
    ...(process.env.NODE_ENV === 'development' ? [
      CredentialsProvider({
        name: 'Development',
        credentials: {
          email: { label: 'Email', type: 'email', placeholder: 'test@example.com' },
          password: { label: 'Password', type: 'password' }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password required')
          }

          // In development, accept any email/password combo
          // In production, this would validate against your database
          if (process.env.NODE_ENV === 'development') {
            const user = await db.user.upsert({
              where: { email: credentials.email },
              update: { name: credentials.email.split('@')[0] },
              create: {
                email: credentials.email,
                name: credentials.email.split('@')[0],
                role: credentials.email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'USER'
              }
            })
            return user
          }
          return null
        }
      })
    ] : [])
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
