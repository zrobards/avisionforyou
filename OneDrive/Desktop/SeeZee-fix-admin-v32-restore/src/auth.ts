import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, retryDatabaseOperation, checkDatabaseHealth } from "@/lib/prisma";
import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";

// Validate environment variables with better error messages
// SAFE: Don't throw at import time - only validate when actually used
const GOOGLE_ID = (process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID)?.trim();
const GOOGLE_SECRET = (process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET)?.trim();

// Safe validation function - only warns in production, throws in dev
function validateAuthConfig() {
  const hasSecret = !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
  const hasGoogleId = !!GOOGLE_ID;
  const hasGoogleSecret = !!GOOGLE_SECRET;
  
  if (!hasSecret) {
    const error = new Error("AUTH_SECRET or NEXTAUTH_SECRET is required");
    console.error("❌ Auth configuration error:", error.message);
    // Only throw in development - in production, log and continue
    if (process.env.NODE_ENV === "development") {
      throw error;
    }
    console.warn("⚠️ Continuing without AUTH_SECRET in production - auth may not work");
  }

  if (!hasGoogleId || !hasGoogleSecret) {
    const error = new Error(
      `Google OAuth credentials missing. GOOGLE_ID: ${hasGoogleId}, GOOGLE_SECRET: ${hasGoogleSecret}`
    );
    console.error("❌ Auth configuration error:", error.message);
    // Only throw in development - in production, log and continue
    if (process.env.NODE_ENV === "development") {
      throw error;
    }
    console.warn("⚠️ Continuing without Google OAuth credentials - OAuth sign-in will not work");
  }

  // Validate Google Secret format - only if it exists
  // Only warn once on startup, not on every request
  if (GOOGLE_SECRET && process.env.NODE_ENV === 'development') {
    if (!GOOGLE_SECRET.startsWith('GOCSPX-') || GOOGLE_SECRET.length < 40) {
      // Only log this once by checking if we've already warned
      if (!(global as any).__googleSecretWarned) {
        console.warn("⚠️ WARNING: Google Client Secret may be incorrect!");
        console.warn(`   Secret length: ${GOOGLE_SECRET.length} characters (expected 40-50)`);
        console.warn(`   If OAuth fails, check your .env.local file`);
        (global as any).__googleSecretWarned = true;
      }
    }
  }
}

// Auth configuration validated (logs removed to prevent console spam)

// Log URL configuration for debugging
const AUTH_URL = process.env.AUTH_URL;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

// Validate URL configuration - this is critical for OAuth to work
if (!AUTH_URL && !NEXTAUTH_URL) {
  const error = new Error(
    "AUTH_URL or NEXTAUTH_URL is required for OAuth to work. " +
    "Set AUTH_URL to your production domain (e.g., https://see-zee.com) or " +
    "NEXTAUTH_URL for NextAuth compatibility."
  );
  console.error("❌ Auth configuration error:", error.message);
  console.error("❌ This will cause 'Configuration' errors when signing in with Google");
  // Don't throw in development to allow local testing, but warn heavily
  if (process.env.NODE_ENV === "production") {
    throw error;
  }
}

// URL configuration validated (logs removed to prevent console spam)

// Determine the base URL for OAuth callbacks and fix port mismatches
const getBaseUrl = () => {
  // In development, always use port 3000 (matching package.json dev script)
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  
  // In production, use AUTH_URL or NEXTAUTH_URL
  return process.env.AUTH_URL || process.env.NEXTAUTH_URL || undefined;
};

const baseUrl = getBaseUrl();

// Validate config before creating NextAuth instance
// In production, this will warn but not throw to prevent middleware crashes
validateAuthConfig();

// Only create NextAuth if we have minimum required config
const hasMinConfig = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) && GOOGLE_ID && GOOGLE_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  trustHost: true,
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: { 
    signIn: "/login", 
    error: "/login",
    verifyRequest: "/verify",
  },
  // Allow linking accounts with the same email
  // This is needed when users sign up with email then try to login with OAuth
  experimental: {
    enableWebAuthn: false,
  },
  // Optimize cookies to prevent chunking issues
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    // Credentials provider for email/password login
    Credentials({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        recaptchaToken: { label: "ReCAPTCHA Token", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Verify reCAPTCHA if token provided
          if (credentials.recaptchaToken && process.env.RECAPTCHA_SECRET_KEY) {
            try {
              const recaptchaResponse = await fetch(
                `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${credentials.recaptchaToken}`,
                { method: "POST" }
              );
              const recaptchaData = await recaptchaResponse.json();
              
              if (!recaptchaData.success || recaptchaData.score < 0.5) {
                throw new Error("reCAPTCHA verification failed");
              }
            } catch (error) {
              throw new Error("reCAPTCHA verification failed");
            }
          }

          // Find user by email
          const user = await retryDatabaseOperation(async () => {
            return await prisma.user.findUnique({
              where: { email: (credentials.email as string).toLowerCase() },
              select: {
                id: true,
                email: true,
                password: true,
                name: true,
                role: true,
                emailVerified: true,
                image: true,
                tosAcceptedAt: true,
                profileDoneAt: true,
                questionnaireCompleted: true,
              },
            });
          });

          if (!user || !user.password) {
            return null;
          }

          // CEO whitelist - skip email verification for CEO users
          const CEO_EMAILS = ["seanspm1007@gmail.com", "seanpm1007@gmail.com"];
          const isCEO = CEO_EMAILS.includes((credentials.email as string).toLowerCase());

          // Check if email is verified (skip for CEO users)
          if (!user.emailVerified && !isCEO) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          // Auto-verify CEO email if not already verified
          if (isCEO && !user.emailVerified) {
            await prisma.user.update({
              where: { id: user.id },
              data: { 
                emailVerified: new Date(),
                role: "CEO",
                tosAcceptedAt: new Date(),
                profileDoneAt: new Date(),
              },
            });
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValidPassword) {
            return null;
          }

          // Return user object (password excluded)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            tosAcceptedAt: user.tosAcceptedAt?.toISOString() || null,
            profileDoneAt: user.profileDoneAt?.toISOString() || null,
            questionnaireCompleted: user.questionnaireCompleted?.toISOString() || null,
          };
        } catch (error) {
          throw error;
        }
      },
    }),
    
    // Only add Google provider if credentials are available
    ...(GOOGLE_ID && GOOGLE_SECRET ? [
      Google({
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        allowDangerousEmailAccountLinking: true,
        authorization: { 
          params: { 
            prompt: "consent", 
            access_type: "offline", 
            response_type: "code" 
          } 
        },
        // Token endpoint handled by NextAuth (logging removed to prevent spam)
      }),
    ] : []),
  ],
  
  events: {
    // Fires after PrismaAdapter creates user on first sign-in
    async createUser({ user }) {
      try {
        // Check database health before operations (silent check)
        const dbHealth = await checkDatabaseHealth();
        if (!dbHealth.healthy) {
          console.error(`❌ [OAuth] Database unhealthy: ${dbHealth.error}`);
        }
        
        // CEO whitelist - auto-upgrade to CEO with completed onboarding
        const CEO_EMAILS = ["seanspm1007@gmail.com", "seanpm1007@gmail.com"];
        if (CEO_EMAILS.includes(user.email!)) {
          await retryDatabaseOperation(async () => {
            return await prisma.user.update({
              where: { id: user.id },
              data: {
                role: "CEO",
                tosAcceptedAt: new Date(),
                profileDoneAt: new Date(),
                emailVerified: new Date(),
              },
            });
          });
          return;
        }

        // Default new sign-ins to CLIENT
        // Note: STAFF/ADMIN users are upgraded via 6-digit invitation codes or admin panel
        await retryDatabaseOperation(async () => {
          return await prisma.user.update({
            where: { id: user.id },
            data: {
              role: "CLIENT",
              questionnaireCompleted: null, // Initialize field to prevent undefined errors
              emailVerified: new Date(), // Mark OAuth emails as verified
            },
          });
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ [OAuth] Error creating user account for ${user.email}:`, errorMessage);
        
        // Check if it's a database error
        const isDbError = 
          errorMessage.includes("Can't reach database server") ||
          errorMessage.includes("P1001") ||
          errorMessage.includes("P1000") ||
          errorMessage.includes("connection") ||
          errorMessage.includes("ECONNREFUSED") ||
          errorMessage.includes("timeout") ||
          errorMessage.includes("PrismaClient") ||
          errorMessage.includes("prisma");
        
        if (isDbError) {
          console.error(`   [OAuth] Database error detected - this may cause OAuth to fail`);
          console.error(`   [OAuth] Check DATABASE_URL and ensure database is running`);
        }
        
        // Re-throw to let NextAuth handle it, but with better context
        throw error;
      }
    },
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Sign in attempt (logging removed to prevent spam)
        
        // Log OAuth errors if present
        if (account && 'error' in account) {
          console.error("❌ OAuth account error:", {
            error: (account as any).error,
            errorDescription: (account as any).error_description,
            provider: account.provider,
          });
          console.error("💡 This usually means:");
          console.error("   1. The redirect URI in Google Cloud Console doesn't match");
          console.error("   2. The Client ID or Secret is incorrect");
          console.error("   3. The OAuth client type is wrong (should be 'Web application')");
          console.error(`   4. Expected redirect URI: ${baseUrl || 'http://localhost:3000'}/api/auth/callback/google`);
          return false;
        }

        // Check if OAuth user needs to set a password (for account migrations)
        if (account?.provider === "google" && user.email) {
          const userEmail = user.email; // Capture in local variable for type narrowing
          const dbUser = await retryDatabaseOperation(async () => {
            return await prisma.user.findUnique({
              where: { email: userEmail },
              select: { id: true, password: true },
            });
          });

          // If OAuth user has no password, continue sign-in but flag for password setup
        }

        // With allowDangerousEmailAccountLinking: true, the adapter will automatically
        // link accounts with the same email. We just need to allow the sign-in.
        return true;
      } catch (error) {
        console.error("❌ Sign in callback error:", error);
        return false;
      }
    },

    async session({ session, token }) {
      // Optimized: Store minimal data from token only
      // No database queries here to keep session lightweight and fast
      if (!token.sub) {
        console.warn("Session callback: No user ID in token");
        return session;
      }

      // Populate session from JWT token (no DB query)
      session.user.id = token.sub;
      session.user.role = (token.role as any) || "CLIENT";
      session.user.tosAcceptedAt = token.tosAccepted ? "1" : null; // Use "1" instead of date string to save space
      session.user.profileDoneAt = token.profileDone ? "1" : null;
      session.user.questionnaireCompleted = token.questionnaireCompleted ? "1" : null;
      (session.user as any).needsPassword = token.needsPassword === true;

      return session;
    },

    async jwt({ token, user, trigger, session: updateSession }) {
      // Initial sign in OR trigger refresh - fetch fresh user data from database
      // This ensures role changes in DB are picked up on next sign-in
      if (user || trigger === "update") {
        try {
          // Always fetch latest user data from database to catch role changes
          const email = user?.email || token.email;
          
          if (!email) {
            console.warn("JWT callback: No email available, using default values");
            token.role = token.role || "CLIENT";
            token.questionnaireCompleted = false;
            token.needsPassword = false;
            token.emailVerified = false;
            return token;
          }
          
          // CEO whitelist - auto-upgrade to CEO with completed onboarding
          const CEO_EMAILS = ["seanspm1007@gmail.com", "seanpm1007@gmail.com"];
          const isCEO = CEO_EMAILS.includes(email as string);
          
          // Use retry logic for database operations during OAuth flow
          const dbUser = await retryDatabaseOperation(async () => {
            return await prisma.user.findUnique({
              where: { email: email as string },
              select: {
                id: true,
                role: true,
                password: true,
                tosAcceptedAt: true,
                profileDoneAt: true,
                questionnaireCompleted: true,
                emailVerified: true,
              },
            });
          });
          
          if (dbUser) {
            // Auto-complete onboarding for CEO users if not already done
            if (isCEO && (!dbUser.tosAcceptedAt || !dbUser.profileDoneAt || dbUser.role !== "CEO")) {
              await retryDatabaseOperation(async () => {
                return await prisma.user.update({
                  where: { id: dbUser.id },
                  data: {
                    role: "CEO",
                    tosAcceptedAt: dbUser.tosAcceptedAt || new Date(),
                    profileDoneAt: dbUser.profileDoneAt || new Date(),
                    emailVerified: dbUser.emailVerified || new Date(),
                  },
                });
              });
              
              // Update token with CEO values
              token.role = "CEO" as any;
              token.tosAccepted = true;
              token.profileDone = true;
              token.emailVerified = true;
              token.questionnaireCompleted = !!dbUser.questionnaireCompleted;
              token.needsPassword = !dbUser.password;
            } else {
              // Normal user - use database values
              // Ensure role is never null - default to CLIENT if null
              token.role = dbUser.role || "CLIENT";
              // Store boolean flags instead of ISO strings to reduce token size
              token.tosAccepted = !!dbUser.tosAcceptedAt;
              token.profileDone = !!dbUser.profileDoneAt;
              token.questionnaireCompleted = !!dbUser.questionnaireCompleted;
              token.emailVerified = !!dbUser.emailVerified;
              // Check if user needs to set a password (OAuth-only users)
              token.needsPassword = !dbUser.password;
            }
          } else {
            // User might not exist yet during OAuth flow - use defaults
            token.role = (typeof token.role === 'string' ? token.role : "CLIENT") as any;
            token.questionnaireCompleted = false;
            token.needsPassword = false;
            token.emailVerified = false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("Failed to fetch user in JWT callback:", errorMessage);
          
          // During OAuth flow, database might not be ready - use safe defaults
          // Don't override existing token values if they exist
          if (!token.role || typeof token.role !== 'string') {
            token.role = "CLIENT" as any;
          }
          if (typeof token.questionnaireCompleted !== 'boolean') {
            token.questionnaireCompleted = false;
          }
          token.needsPassword = token.needsPassword ?? false;
          token.emailVerified = token.emailVerified ?? false;
        }
      }

      // Handle explicit session updates from onboarding pages
      if (trigger === "update" && updateSession) {
        token.role = updateSession.role || token.role;
        token.tosAccepted = updateSession.tosAcceptedAt ? true : token.tosAccepted;
        token.profileDone = updateSession.profileDoneAt ? true : token.profileDone;
        token.questionnaireCompleted = updateSession.questionnaireCompleted ? true : token.questionnaireCompleted;
        token.name = updateSession.name || token.name;
        // Allow clearing needsPassword flag when password is set
        if ('needsPassword' in updateSession) {
          token.needsPassword = updateSession.needsPassword;
        }
        // Allow setting emailVerified
        if ('emailVerified' in updateSession) {
          token.emailVerified = !!updateSession.emailVerified;
        }
      }

      return token;
    },

    async redirect({ url, baseUrl }) {
      // For relative URLs (like /client, /admin), prepend baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      // For absolute URLs, check if they're on the same origin
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        
        // If same origin, allow it
        if (urlObj.origin === baseUrlObj.origin) {
          return url;
        }
        
        // Different origin - default to base URL for security
        return baseUrl;
      } catch (err) {
        // Invalid URL - default to base URL
        return baseUrl;
      }
    },
  },
  
  debug: false, // Disable debug mode to prevent console spam
});

// Also export GET and POST directly for convenience
export const { GET, POST } = handlers;