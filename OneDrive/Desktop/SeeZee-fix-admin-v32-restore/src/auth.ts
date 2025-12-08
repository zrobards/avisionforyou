import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, retryDatabaseOperation, checkDatabaseHealth } from "@/lib/prisma";
import type { NextAuthConfig } from "next-auth";

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
  if (GOOGLE_SECRET) {
    if (!GOOGLE_SECRET.startsWith('GOCSPX-') || GOOGLE_SECRET.length < 40) {
      console.warn("⚠️ WARNING: Google Client Secret may be incorrect!");
      console.warn(`   Secret length: ${GOOGLE_SECRET.length} characters (expected 40-50)`);
      console.warn(`   Secret prefix: ${GOOGLE_SECRET.substring(0, 10)}...`);
      console.warn(`   Google Client Secrets should start with 'GOCSPX-' and be 40-50 characters long`);
      console.warn(`   Check your .env.local file - make sure the secret is not truncated`);
      console.warn(`   Remove any quotes, spaces, or line breaks around the secret`);
    }
  }
}

console.log("✅ Auth configuration loaded:", {
  hasSecret: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
  hasGoogleId: !!GOOGLE_ID,
  hasGoogleSecret: !!GOOGLE_SECRET,
  googleId: GOOGLE_ID ? `${GOOGLE_ID.substring(0, 20)}...` : 'MISSING',
  googleSecret: GOOGLE_SECRET ? `${GOOGLE_SECRET.substring(0, 10)}...` : 'MISSING',
});

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

if (AUTH_URL) {
  console.log("🌐 AUTH_URL configured:", AUTH_URL);
} else if (NEXTAUTH_URL) {
  console.log("🌐 NEXTAUTH_URL configured:", NEXTAUTH_URL);
} else {
  console.warn("⚠️ No AUTH_URL or NEXTAUTH_URL configured - NextAuth will try to auto-detect");
  console.warn("⚠️ This may cause 'Configuration' errors in production");
  console.warn("⚠️ Set AUTH_URL=http://localhost:3000 for local development (matching your dev server port)");
}

// Determine the base URL for OAuth callbacks and fix port mismatches
const getBaseUrl = () => {
  // In development, always use port 3000 (matching package.json dev script)
  // This prevents redirect_uri_mismatch errors from port mismatches
  if (process.env.NODE_ENV === "development") {
    const devUrl = "http://localhost:3000";
    
    // Warn if env vars have wrong port
    if (process.env.AUTH_URL && !process.env.AUTH_URL.includes(":3000")) {
      console.warn(`⚠️ AUTH_URL has wrong port: ${process.env.AUTH_URL}. Using ${devUrl} instead.`);
    }
    if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes(":3000")) {
      console.warn(`⚠️ NEXTAUTH_URL has wrong port: ${process.env.NEXTAUTH_URL}. Using ${devUrl} instead.`);
    }
    
    console.log(`🌐 Development mode: Using ${devUrl} for OAuth redirect URIs`);
    return devUrl;
  }
  
  // In production, use AUTH_URL or NEXTAUTH_URL
  if (process.env.AUTH_URL) {
    return process.env.AUTH_URL;
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Fallback - NextAuth will try to auto-detect
  return undefined;
};

const baseUrl = getBaseUrl();
if (baseUrl) {
  console.log("🌐 Using base URL for OAuth:", baseUrl);
  console.log("🔗 Expected redirect URI in Google Cloud Console:", `${baseUrl}/api/auth/callback/google`);
  console.log("🔗 Expected JavaScript origin in Google Cloud Console:", baseUrl);
} else {
  console.warn("⚠️ No base URL configured - NextAuth will try to auto-detect (may use wrong port)");
}

// Validate config before creating NextAuth instance
// In production, this will warn but not throw to prevent middleware crashes
validateAuthConfig();

// Only create NextAuth if we have minimum required config
const hasMinConfig = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) && GOOGLE_ID && GOOGLE_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  trustHost: true,
  session: { strategy: "jwt" },
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
  providers: [
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
        // Add explicit token endpoint configuration
        token: {
          async request(context: any) {
            console.log("🔐 [OAuth] Token exchange request:", {
              provider: "google",
              clientId: `${GOOGLE_ID?.substring(0, 20)}...`,
              hasClientSecret: !!GOOGLE_SECRET,
              clientSecretLength: GOOGLE_SECRET?.length,
              redirectUri: context.params.redirect_uri,
              code: context.params.code ? `${context.params.code.substring(0, 20)}...` : 'missing',
            });
            
            // Let NextAuth handle the token request normally
            // This is just for logging
            return context;
          },
        },
      }),
    ] : []),
  ],
  
  events: {
    // Fires after PrismaAdapter creates user on first sign-in
    async createUser({ user }) {
      try {
        console.log(`👤 [OAuth] Creating user account for ${user.email}`);
        
        // Check database health before operations
        const dbHealth = await checkDatabaseHealth();
        if (!dbHealth.healthy) {
          console.error(`❌ [OAuth] Database unhealthy during user creation: ${dbHealth.error}`);
          console.error(`   [OAuth] Retrying with exponential backoff...`);
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
              },
            });
          });
          console.log(`✅ [OAuth] CEO account created for ${user.email}`);
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
            },
          });
        });
        console.log(`✅ [OAuth] CLIENT account created for ${user.email}`);
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
        console.log("🔐 Sign in attempt:", {
          email: user.email,
          provider: account?.provider,
          accountType: account?.type,
        });

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

        // With allowDangerousEmailAccountLinking: true, the adapter will automatically
        // link accounts with the same email. We just need to allow the sign-in.
        console.log(`✅ Allowing sign-in for ${user.email} via ${account?.provider}`);
        return true;
      } catch (error) {
        console.error("❌ Sign in callback error:", error);
        return false;
      }
    },

    async session({ session, token }) {
      // IMPORTANT: Always fetch fresh role from database
      // This ensures manual role changes in DB are immediately reflected
      try {
        // Only query database if we have an email
        if (!session.user.email) {
          console.warn("Session callback: No email in session, using token values");
          session.user.id = token.sub!;
          session.user.role = (typeof token.role === 'string' ? token.role : "CLIENT") as any;
          session.user.tosAcceptedAt = (typeof token.tosAcceptedAt === 'string' ? new Date(token.tosAcceptedAt) : null);
          session.user.profileDoneAt = (typeof token.profileDoneAt === 'string' ? new Date(token.profileDoneAt) : null);
          session.user.questionnaireCompleted = (typeof token.questionnaireCompleted === 'string' ? new Date(token.questionnaireCompleted) : null);
          return session;
        }

        // Query database with retry logic - errors will be caught by try-catch below
        const dbUser = await retryDatabaseOperation(async () => {
          return await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
              id: true,
              role: true,
              tosAcceptedAt: true,
              profileDoneAt: true,
              questionnaireCompleted: true,
            },
          });
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          // Ensure role is never null - default to CLIENT if null
          session.user.role = dbUser.role || "CLIENT";
          session.user.tosAcceptedAt = dbUser.tosAcceptedAt;
          session.user.profileDoneAt = dbUser.profileDoneAt;
          session.user.questionnaireCompleted = dbUser.questionnaireCompleted ?? null;
          console.log(`✅ Session callback: User ${session.user.email} - role: ${session.user.role}, questionnaireCompleted: ${dbUser.questionnaireCompleted ? 'Yes' : 'No'}`);
        } else {
          // User not found in database - use token values
          console.warn(`Session callback: User ${session.user.email} not found in database, using token values`);
          session.user.id = token.sub!;
          session.user.role = (typeof token.role === 'string' ? token.role : "CLIENT") as any;
          session.user.tosAcceptedAt = (typeof token.tosAcceptedAt === 'string' ? new Date(token.tosAcceptedAt) : null);
          session.user.profileDoneAt = (typeof token.profileDoneAt === 'string' ? new Date(token.profileDoneAt) : null);
          session.user.questionnaireCompleted = (typeof token.questionnaireCompleted === 'string' ? new Date(token.questionnaireCompleted) : null);
        }
      } catch (error) {
        // Handle database connection errors gracefully
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isConnectionError = 
          errorMessage.includes("Can't reach database server") ||
          errorMessage.includes("P1001") ||
          errorMessage.includes("P1000") ||
          errorMessage.includes("connection") ||
          errorMessage.includes("ECONNREFUSED") ||
          errorMessage.includes("timeout") ||
          errorMessage.includes("PrismaClient") ||
          errorMessage.includes("prisma") ||
          errorMessage.includes("Database query timeout");
        
        if (isConnectionError) {
          console.error("Database connection error in session callback:", errorMessage);
          console.error("Falling back to token values - check DATABASE_URL and ensure database is running");
        } else {
          console.error("Failed to fetch user in session callback:", error);
        }
        
        // Always fallback to token values to prevent session from failing
        session.user.id = token.sub!;
        session.user.role = (typeof token.role === 'string' ? token.role : "CLIENT") as any;
        session.user.tosAcceptedAt = (typeof token.tosAcceptedAt === 'string' ? new Date(token.tosAcceptedAt) : null);
        session.user.profileDoneAt = (typeof token.profileDoneAt === 'string' ? new Date(token.profileDoneAt) : null);
        session.user.questionnaireCompleted = (typeof token.questionnaireCompleted === 'string' ? new Date(token.questionnaireCompleted) : null);
        console.warn(`⚠️ Session callback error fallback: questionnaireCompleted set to ${session.user.questionnaireCompleted ? 'Yes' : 'No'}`);
      }

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
            token.questionnaireCompleted = token.questionnaireCompleted ?? null;
            return token;
          }
          
          // Use retry logic for database operations during OAuth flow
          const dbUser = await retryDatabaseOperation(async () => {
            return await prisma.user.findUnique({
              where: { email: email as string },
              select: {
                id: true,
                role: true,
                tosAcceptedAt: true,
                profileDoneAt: true,
                questionnaireCompleted: true,
              },
            });
          });
          
          if (dbUser) {
            // Ensure role is never null - default to CLIENT if null
            token.role = dbUser.role || "CLIENT";
            token.tosAcceptedAt = dbUser.tosAcceptedAt?.toISOString() ?? null;
            token.profileDoneAt = dbUser.profileDoneAt?.toISOString() ?? null;
            token.questionnaireCompleted = dbUser.questionnaireCompleted?.toISOString() ?? null;
            console.log(`🔄 JWT refreshed for ${email}: role=${token.role}, questionnaireCompleted: ${dbUser.questionnaireCompleted ? 'Yes' : 'No'}`);
          } else {
            // User might not exist yet during OAuth flow - don't fail
            console.log(`JWT callback: User ${email} not found in DB yet (may be during OAuth creation)`);
            token.role = (typeof token.role === 'string' ? token.role : "CLIENT") as any;
            token.questionnaireCompleted = (typeof token.questionnaireCompleted === 'string' ? token.questionnaireCompleted : null);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("Failed to fetch user in JWT callback:", errorMessage);
          
          // During OAuth flow, database might not be ready - use safe defaults
          // Don't override existing token values if they exist
          if (!token.role || typeof token.role !== 'string') {
            token.role = "CLIENT" as any;
          }
          if (token.questionnaireCompleted === undefined || (typeof token.questionnaireCompleted !== 'string' && token.questionnaireCompleted !== null)) {
            token.questionnaireCompleted = null;
          }
        }
      }

      // Handle explicit session updates from onboarding pages
      if (trigger === "update" && updateSession) {
        token.role = updateSession.role || token.role;
        token.tosAcceptedAt = updateSession.tosAcceptedAt ? (typeof updateSession.tosAcceptedAt === 'string' ? updateSession.tosAcceptedAt : updateSession.tosAcceptedAt.toISOString()) : token.tosAcceptedAt;
        token.profileDoneAt = updateSession.profileDoneAt ? (typeof updateSession.profileDoneAt === 'string' ? updateSession.profileDoneAt : updateSession.profileDoneAt.toISOString()) : token.profileDoneAt;
        token.questionnaireCompleted = updateSession.questionnaireCompleted ? (typeof updateSession.questionnaireCompleted === 'string' ? updateSession.questionnaireCompleted : updateSession.questionnaireCompleted.toISOString()) : token.questionnaireCompleted;
        token.name = updateSession.name || token.name;
        if (updateSession.questionnaireCompleted) {
          console.log(`✅ JWT updated: questionnaireCompleted set for ${token.email || 'user'}`);
        }
      }

      return token;
    },

    async redirect({ url, baseUrl }) {
      console.log("🔀 Redirect callback:", { url, baseUrl });
      
      // For relative URLs (like /client, /admin), prepend baseUrl
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log("✅ Relative URL redirect:", redirectUrl);
        return redirectUrl;
      }
      
      // For absolute URLs, check if they're on the same origin
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        
        // If same origin, allow it
        if (urlObj.origin === baseUrlObj.origin) {
          console.log("✅ Same origin redirect:", url);
          return url;
        }
        
        // Different origin - default to base URL for security
        console.warn("⚠️ Different origin redirect blocked, using baseUrl:", baseUrl);
        return baseUrl;
      } catch (err) {
        // Invalid URL - default to base URL
        console.error("❌ Invalid redirect URL, using baseUrl:", url, err);
        return baseUrl;
      }
    },
  },
  
  debug: true,
});

// Also export GET and POST directly for convenience
export const { GET, POST } = handlers;