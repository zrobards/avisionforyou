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
  // Note: GOCSPX- format secrets are 35 characters, which is valid
  if (GOOGLE_SECRET && process.env.NODE_ENV === 'development') {
    const isValidFormat = GOOGLE_SECRET.startsWith('GOCSPX-') && GOOGLE_SECRET.length >= 35;
    if (!isValidFormat && GOOGLE_SECRET.length < 30) {
      // Only log this once by checking if we've already warned
      if (!(global as any).__googleSecretWarned) {
        console.warn("⚠️ WARNING: Google Client Secret may be incorrect!");
        console.warn(`   Secret length: ${GOOGLE_SECRET.length} characters (expected 35+ for GOCSPX- format)`);
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

          // CEO whitelist - auto-setup CEO users
          const CEO_EMAILS = ["seanspm1007@gmail.com", "seanpm1007@gmail.com", "sean.mcculloch23@gmail.com"];
          const isCEO = CEO_EMAILS.includes((credentials.email as string).toLowerCase());

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
        const CEO_EMAILS = ["seanspm1007@gmail.com", "seanpm1007@gmail.com", "spmcculloch1007@gmail.com", "sean.mcculloch23@gmail.com"];
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
        // Auto-verify OAuth emails since Google already verified them
        // For existing OAuth users who weren't auto-verified, we'll handle in the signIn callback
        
        await retryDatabaseOperation(async () => {
          return await prisma.user.update({
            where: { id: user.id },
            data: {
              role: "CLIENT",
              questionnaireCompleted: null, // Initialize field to prevent undefined errors
              emailVerified: new Date(), // Auto-verify OAuth users since provider already verified
              emailVerificationToken: null,
              emailVerificationExpires: null,
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

        // Handle OAuth account linking for existing users
        // If a user with this email already exists (from email/password signup),
        // we need to ensure the OAuth account gets linked to the existing user
        if (account?.provider === "google" && user.email) {
          const userEmail = user.email.toLowerCase();
          
          // Check if an account with this provider/providerAccountId already exists
          const existingAccount = await retryDatabaseOperation(async () => {
            return await prisma.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              include: { user: { select: { id: true, email: true } } },
            });
          });

          // Check if a user with this email already exists
          const existingUser = await retryDatabaseOperation(async () => {
            return await prisma.user.findUnique({
              where: { email: userEmail },
              select: { id: true },
            });
          });

          // If account exists but is linked to a different user, and we have a user with matching email
          // Link the account to the user with matching email (account linking)
          if (existingAccount && existingUser && existingAccount.userId !== existingUser.id) {
            // Update the account to link it to the user with matching email
            await retryDatabaseOperation(async () => {
              return await prisma.account.update({
                where: { id: existingAccount.id },
                data: { userId: existingUser.id },
              });
            });
            // Set user ID so NextAuth uses the existing user
            user.id = existingUser.id;
          } else if (existingUser && !existingAccount) {
            // User exists but account doesn't - set user ID so NextAuth uses existing user
            // The adapter will create the account and link it
            user.id = existingUser.id;
          } else if (existingAccount && existingAccount.user.email.toLowerCase() === userEmail) {
            // Account exists and is already linked to a user with matching email
            // Use that user ID
            user.id = existingAccount.userId;
          }
          
          // Auto-verify existing OAuth users if not already verified
          // Google OAuth already verified their email, so we should trust that
          if (existingUser) {
            const userWithVerification = await retryDatabaseOperation(async () => {
              return await prisma.user.findUnique({
                where: { id: existingUser.id },
                select: { id: true, emailVerified: true },
              });
            });
            
            if (userWithVerification && !userWithVerification.emailVerified) {
              await retryDatabaseOperation(async () => {
                return await prisma.user.update({
                  where: { id: existingUser.id },
                  data: {
                    emailVerified: new Date(),
                    emailVerificationToken: null,
                    emailVerificationExpires: null,
                  },
                });
              });
            }
          }
        }

        // OAuth users are allowed to sign in - Google already verified their email
        // Auto-verification is handled above for both new and existing users

        // With allowDangerousEmailAccountLinking: true, the adapter will automatically
        // link accounts with the same email. We just need to allow the sign-in.
        return true;
      } catch (error) {
        console.error("❌ Sign in callback error:", error);
        // Re-throw EMAIL_NOT_VERIFIED error so it can be handled by the login page
        if (error instanceof Error && error.message === "EMAIL_NOT_VERIFIED") {
          throw error;
        }
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
      // Keep minimal to prevent cookie bloat (431 errors)
      session.user.id = token.sub;
      session.user.role = (token.role as any) || "CLIENT";
      session.user.tosAcceptedAt = token.tosAccepted ? "1" : null; // Use "1" instead of date string to save space
      session.user.profileDoneAt = token.profileDone ? "1" : null;
      session.user.questionnaireCompleted = token.questionnaireCompleted ? "1" : null;
      (session.user as any).needsPassword = token.needsPassword === true;
      // Note: emailVerified is checked in middleware via token, not stored in session to save space
      
      // CRITICAL FIX: Remove image from session to prevent cookie bloat (431 errors)
      // The image field from OAuth providers can be 4-20KB, causing cookies to exceed 4KB limit
      delete (session.user as any).image;

      return session;
    },

    async jwt({ token, user, trigger, session: updateSession }) {
      // CRITICAL FIX: Always fetch fresh user data from database to prevent stale token issues
      // This ensures onboarding completion and role changes in DB are immediately reflected
      // Previously only fetched on initial sign-in or explicit updates, causing users to get stuck
      try {
        // Get email from user object (first sign-in) or existing token
        const email = user?.email || token.email;
        
        if (!email) {
          console.warn("JWT callback: No email available, using default values");
          token.role = token.role || "CLIENT";
          token.tosAccepted = token.tosAccepted ?? false;
          token.profileDone = token.profileDone ?? false;
          token.questionnaireCompleted = token.questionnaireCompleted ?? false;
          token.needsPassword = token.needsPassword ?? false;
          token.emailVerified = token.emailVerified ?? false;
          return token;
        }
        
        // CEO whitelist - auto-upgrade to CEO with completed onboarding
        const CEO_EMAILS = ["seanspm1007@gmail.com", "seanpm1007@gmail.com", "sean.mcculloch23@gmail.com"];
        const isCEO = CEO_EMAILS.includes(email as string);
        
        // Always fetch latest user data from database to catch onboarding completion and role changes
        // This prevents users from getting stuck with stale token values
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
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:495',message:'JWT callback - fetched DB user',data:{email,hasDbUser:!!dbUser,dbUserId:dbUser?.id||null,dbUserRole:dbUser?.role||null,dbTosAcceptedAt:dbUser?.tosAcceptedAt||null,dbProfileDoneAt:dbUser?.profileDoneAt||null,trigger:trigger||null},sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        if (dbUser) {
          // Auto-verify OAuth users if not already verified (Google already verified their email)
          // Check if user has an OAuth account (Google provider)
          const hasOAuthAccount = await retryDatabaseOperation(async () => {
            return await prisma.account.findFirst({
              where: {
                userId: dbUser.id,
                provider: "google",
              },
              select: { id: true },
            });
          });
          
          // Track if we updated emailVerified
          let currentDbUser = dbUser;
          
          if (hasOAuthAccount && !dbUser.emailVerified) {
            await retryDatabaseOperation(async () => {
              return await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  emailVerified: new Date(),
                  emailVerificationToken: null,
                  emailVerificationExpires: null,
                },
              });
            });
            
            // Refresh dbUser to get updated emailVerified
            const updatedDbUser = await retryDatabaseOperation(async () => {
              return await prisma.user.findUnique({
                where: { id: dbUser.id },
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
            
            // Use updated user data if available
            if (updatedDbUser) {
              currentDbUser = updatedDbUser;
            }
          }
          
          // Auto-complete onboarding for CEO users if not already done
          if (isCEO && (!currentDbUser.tosAcceptedAt || !currentDbUser.profileDoneAt || currentDbUser.role !== "CEO")) {
            await retryDatabaseOperation(async () => {
              return await prisma.user.update({
                where: { id: currentDbUser.id },
                data: {
                  role: "CEO",
                  tosAcceptedAt: currentDbUser.tosAcceptedAt || new Date(),
                  profileDoneAt: currentDbUser.profileDoneAt || new Date(),
                  // Only auto-verify CEO email if it's not already verified
                  emailVerified: currentDbUser.emailVerified ?? new Date(),
                },
              });
            });
            
            // Update token with CEO values
            token.role = "CEO" as any;
            token.tosAccepted = true;
            token.profileDone = true;
            token.emailVerified = true;
            token.questionnaireCompleted = !!currentDbUser.questionnaireCompleted;
            token.needsPassword = !currentDbUser.password;
          } else {
            // Normal user - always use fresh database values
            // DO NOT auto-verify - users must verify through email verification link
            // Ensure role is never null - default to CLIENT if null
            token.role = currentDbUser.role || "CLIENT";
            // Store boolean flags instead of ISO strings to reduce token size
            token.tosAccepted = !!currentDbUser.tosAcceptedAt;
            token.profileDone = !!currentDbUser.profileDoneAt;
            token.questionnaireCompleted = !!currentDbUser.questionnaireCompleted;
            // CRITICAL: Only mark as verified if actually verified in database
            // Do NOT auto-verify non-CEO users
            token.emailVerified = !!currentDbUser.emailVerified;
            // Check if user needs to set a password (OAuth-only users)
            token.needsPassword = !currentDbUser.password;
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:583',message:'JWT callback - token values set',data:{email,userId:currentDbUser.id,role:token.role,tosAccepted:token.tosAccepted,profileDone:token.profileDone,dbTosAcceptedAt:currentDbUser.tosAcceptedAt||null,dbProfileDoneAt:currentDbUser.profileDoneAt||null},sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
          }
        } else {
          // User might not exist yet during OAuth flow - use safe defaults
          // Preserve existing token values if they exist to prevent overwriting during OAuth
          if (!token.role || typeof token.role !== 'string') {
            token.role = "CLIENT" as any;
          }
          if (typeof token.tosAccepted !== 'boolean') {
            token.tosAccepted = false;
          }
          if (typeof token.profileDone !== 'boolean') {
            token.profileDone = false;
          }
          if (typeof token.questionnaireCompleted !== 'boolean') {
            token.questionnaireCompleted = false;
          }
          token.needsPassword = token.needsPassword ?? false;
          token.emailVerified = token.emailVerified ?? false;
        }

        // Handle explicit session updates from onboarding pages
        // NOTE: Even with update trigger, we still fetch fresh from DB above
        // This ensures DB is always the source of truth
        if (trigger === "update" && updateSession) {
          console.log('[JWT] Update trigger:', { email, trigger, updateTosAcceptedAt: updateSession.tosAcceptedAt, updateProfileDoneAt: updateSession.profileDoneAt });
          
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
        
        // CRITICAL: After handling update trigger, ALWAYS force token values to match DB
        // This ensures DB is always the source of truth, even if update trigger had stale data
        // This prevents redirect loops when DB is updated but token still has old values
        if (dbUser) {
          console.log('[JWT] Final token values (DB source of truth):', { 
            email, 
            userId: dbUser.id, 
            role: token.role, 
            tokenTosAccepted: token.tosAccepted, 
            tokenProfileDone: token.profileDone,
            dbTosAcceptedAt: dbUser.tosAcceptedAt, 
            dbProfileDoneAt: dbUser.profileDoneAt 
          });
          
          // Force token values to match DB (DB is source of truth)
          // This overrides any values set by update trigger to ensure consistency
          token.tosAccepted = !!dbUser.tosAcceptedAt;
          token.profileDone = !!dbUser.profileDoneAt;
          token.questionnaireCompleted = !!dbUser.questionnaireCompleted;
          token.role = dbUser.role || "CLIENT";
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Failed to fetch user in JWT callback:", errorMessage);
        
        // On error, preserve existing token values to prevent breaking active sessions
        // Only set defaults if values are missing
        if (!token.role || typeof token.role !== 'string') {
          token.role = "CLIENT" as any;
        }
        if (typeof token.tosAccepted !== 'boolean') {
          token.tosAccepted = false;
        }
        if (typeof token.profileDone !== 'boolean') {
          token.profileDone = false;
        }
        if (typeof token.questionnaireCompleted !== 'boolean') {
          token.questionnaireCompleted = false;
        }
        token.needsPassword = token.needsPassword ?? false;
        token.emailVerified = token.emailVerified ?? false;
      }

      // CRITICAL FIX: Remove picture/image from token to prevent cookie bloat (431 errors)
      // The picture field from OAuth providers can be 4-20KB, causing cookies to exceed 4KB limit
      delete (token as any).picture;
      delete (token as any).image;

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