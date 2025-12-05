import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true
    }),
    CredentialsProvider({
      name: 'Demo Login',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        // Demo credentials
        if (credentials.email === "zacharyrobards@gmail.com" && credentials.password === "demo") {
          let user = await db.user.findUnique({
            where: { email: credentials.email }
          })
          
          if (!user) {
            user = await db.user.create({
              data: {
                email: credentials.email,
                name: "Zachary Robards",
                role: "ADMIN"
              }
            })
          } else if (user.role !== "ADMIN") {
            user = await db.user.update({
              where: { id: user.id },
              data: { role: "ADMIN" }
            })
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          } as any
        }
        
        return null
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
