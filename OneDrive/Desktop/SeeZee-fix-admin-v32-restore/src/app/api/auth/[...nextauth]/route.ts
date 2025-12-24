// Force Node.js runtime for Nodemailer support
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { checkDatabaseHealth } from "@/lib/prisma";

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://see-zee.com",
  "https://www.see-zee.com",
];

// Helper function to add CORS headers to a response
async function addCorsHeaders(response: Response, origin: string | null): Promise<Response> {
  // Don't modify redirects or non-CORS requests
  if (!origin || !allowedOrigins.includes(origin)) {
    return response;
  }
  
  // Don't modify redirect responses - OAuth callbacks need to work
  if (response.status >= 300 && response.status < 400) {
    return response;
  }
  
  const headers = new Headers(response.headers);
  
  // CRITICAL: Log Set-Cookie headers to debug cookie issues
  const setCookieHeaders = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
  if (setCookieHeaders.length > 0) {
    console.log('[AUTH API] Set-Cookie headers present:', setCookieHeaders.length);
    setCookieHeaders.forEach((cookie, index) => {
      console.log(`[AUTH API] Set-Cookie ${index + 1}:`, cookie.substring(0, 150) + (cookie.length > 150 ? '...' : ''));
    });
  } else {
    console.warn('[AUTH API] WARNING: No Set-Cookie headers in response! Cookies may not be set.');
  }
  
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  headers.set("Access-Control-Allow-Credentials", "true");
  
  // Note: new Headers(response.headers) should automatically preserve all Set-Cookie headers
  
  // Clone the response to avoid consuming the body stream
  // Read the body as text to preserve it
  let body: BodyInit | null = null;
  
  if (response.body) {
    // Clone to read without consuming the original
    const clonedResponse = response.clone();
    body = await clonedResponse.text();
  }
  
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
}

// Handle OPTIONS preflight requests
export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  
  if (origin && allowedOrigins.includes(origin)) {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  
  return new Response(null, { status: 204 });
}

// Wrap handlers with error handling
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  
  // Check if this is an OAuth callback with an error
  if (url.pathname.includes('/callback/google')) {
    // Check database health before processing OAuth callback
    console.log("🔍 [OAuth] Checking database health before processing callback...");
    const dbHealth = await checkDatabaseHealth();
    
    if (dbHealth.healthy) {
      console.log(`✅ [OAuth] Database is healthy (latency: ${dbHealth.latency}ms)`);
    } else {
      console.error(`❌ [OAuth] Database health check failed: ${dbHealth.error}`);
      console.error(`   Latency: ${dbHealth.latency}ms`);
      console.error("   ⚠️ OAuth callback may fail if database operations cannot complete");
      console.error("   💡 Check your DATABASE_URL and ensure the database server is running");
    }
    
    if (url.searchParams.has('error')) {
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      
      if (error === 'invalid_client' || error === 'access_denied') {
        const baseUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000'
          : (process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000');
        
        console.error("❌ Google OAuth Error Detected in URL:");
        console.error(`   Error: ${error}`);
        console.error(`   Description: ${errorDescription || 'Unauthorized'}`);
        console.error(`   Database Health: ${dbHealth.healthy ? '✅ Healthy' : `❌ ${dbHealth.error}`}`);
        console.error("");
        console.error("💡 To fix this, check your Google Cloud Console OAuth client configuration:");
        console.error(`   1. Go to: https://console.cloud.google.com/apis/credentials`);
        console.error(`   2. Find your OAuth 2.0 Client ID: 659797017979-sipunrpq0tlabjqthklic4kvoi81rfe7.apps.googleusercontent.com`);
        console.error(`   3. Ensure "Authorized redirect URIs" includes EXACTLY:`);
        console.error(`      ${baseUrl}/api/auth/callback/google`);
        console.error(`   4. Ensure "Authorized JavaScript origins" includes EXACTLY:`);
        console.error(`      ${baseUrl}`);
        console.error(`   5. Verify the Client ID and Secret match your .env file`);
        console.error(`   6. Make sure the OAuth client type is "Web application"`);
        console.error(`   7. Check that the Client Secret in Google Console matches AUTH_GOOGLE_SECRET`);
        if (!dbHealth.healthy) {
          console.error("");
          console.error("💡 Also check database connection:");
          console.error(`   - Database error: ${dbHealth.error}`);
          console.error(`   - Database may be preventing OAuth token storage`);
        }
      }
    } else if (url.searchParams.has('code')) {
      // This is a successful callback - log for debugging
      console.log("✅ [OAuth] Callback received with authorization code");
      console.log(`   Database Health: ${dbHealth.healthy ? '✅ Ready' : `⚠️ ${dbHealth.error}`}`);
      console.log("   [OAuth] Starting token exchange and database operations...");
    }
  }
  
  try {
    // Log before calling handlers (which may trigger database operations)
    const isOAuthCallback = url.pathname.includes('/callback/google');
    if (isOAuthCallback) {
      console.log("🔄 [OAuth] Processing callback through NextAuth handlers...");
      console.log("   [OAuth] This will trigger PrismaAdapter database operations");
      console.log(`   [OAuth] Callback URL: ${url.toString()}`);
    }
    
    let response: Response;
    try {
      response = await handlers.GET(request);
    } catch (handlerError) {
      // Catch errors from NextAuth handlers and log them
      const handlerErrorMessage = handlerError instanceof Error ? handlerError.message : String(handlerError);
      console.error("❌ [OAuth] NextAuth handler error:", handlerErrorMessage);
      
      // Re-throw to be caught by outer catch block
      throw handlerError;
    }
    
    // Log successful completion
    if (isOAuthCallback) {
      console.log("✅ [OAuth] Handlers completed successfully");
      console.log(`   [OAuth] Response status: ${response.status}`);
      // Log redirect location if it's a redirect
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          console.log(`   [OAuth] Redirecting to: ${location}`);
        }
      }
    }
    
    // Handle response creation errors
    try {
      return await addCorsHeaders(response, origin);
    } catch (corsError) {
      console.error("Error adding CORS headers:", corsError);
      // If CORS header addition fails, return the response without CORS
      return response;
    }
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Check if this is an OAuth callback error (token exchange failed)
    const isOAuthCallback = url.pathname.includes('/callback/google');
    const isOAuthError = 
      errorMessage.includes("CallbackRouteError") ||
      errorMessage.includes("ResponseBodyError") ||
      errorMessage.includes("invalid_client") ||
      errorMessage.includes("oauth");
    
    if (isOAuthCallback && isOAuthError) {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000'
        : (process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000');
      
      // Check database health again to see if it's related
      console.log("🔍 [OAuth] Re-checking database health after error...");
      const dbHealthAfterError = await checkDatabaseHealth();
      
      console.error("❌ [OAuth] Google OAuth Token Exchange Failed:");
      console.error(`   Error: ${errorMessage}`);
      console.error(`   This happens when exchanging the authorization code for an access token`);
      console.error(`   Database Health: ${dbHealthAfterError.healthy ? '✅ Healthy' : `❌ ${dbHealthAfterError.error}`}`);
      console.error("");
      
      // Check if database might be the issue
      const isDbError = 
        errorMessage.includes("Can't reach database server") ||
        errorMessage.includes("P1001") ||
        errorMessage.includes("P1000") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("DATABASE_URL") ||
        errorMessage.includes("PrismaClient") ||
        errorMessage.includes("prisma");
      
      if (isDbError || !dbHealthAfterError.healthy) {
        console.error("💡 DATABASE ISSUE DETECTED:");
        console.error(`   Database error: ${dbHealthAfterError.error || errorMessage}`);
        console.error(`   The PrismaAdapter needs database access to store OAuth tokens`);
        console.error(`   If the database is unavailable, OAuth will fail even with correct credentials`);
        console.error("");
        console.error("🔧 Fix database connection:");
        console.error(`   1. Check DATABASE_URL in your .env file`);
        console.error(`   2. Ensure your database server is running`);
        console.error(`   3. Verify database credentials are correct`);
        console.error(`   4. Check for network/firewall issues`);
        console.error("");
      }
      
      console.error("💡 Most common causes:");
      console.error(`   1. ❌ WRONG CLIENT SECRET - The AUTH_GOOGLE_SECRET in your .env doesn't match Google Console`);
      console.error(`   2. ❌ WRONG CLIENT ID - The AUTH_GOOGLE_ID doesn't match Google Console`);
      console.error(`   3. ❌ Redirect URI mismatch - The redirect URI in Google Console must EXACTLY match:`);
      console.error(`      ${baseUrl}/api/auth/callback/google`);
      if (!isDbError && dbHealthAfterError.healthy) {
        console.error(`   4. ❌ DATABASE ISSUE - Database unavailable during OAuth callback`);
      }
      console.error("");
      console.error("🔧 How to fix:");
      console.error(`   1. Go to: https://console.cloud.google.com/apis/credentials`);
      console.error(`   2. Find OAuth client: 659797017979-sipunrpq0tlabjqthklic4kvoi81rfe7.apps.googleusercontent.com`);
      console.error(`   3. Click "Edit" and verify:`);
      console.error(`      - Client ID matches: 659797017979-sipunrpq0tlabjqthklic4kvoi81rfe7.apps.googleusercontent.com`);
      console.error(`      - Copy the Client Secret (starts with GOCSPX-)`);
      console.error(`      - Update AUTH_GOOGLE_SECRET in your .env file with the EXACT secret`);
      console.error(`      - Ensure redirect URI is EXACTLY: ${baseUrl}/api/auth/callback/google`);
      console.error(`      - Ensure JavaScript origin is EXACTLY: ${baseUrl}`);
      console.error(`   4. Restart your dev server after updating .env`);
      if (!dbHealthAfterError.healthy) {
        console.error(`   5. Fix database connection (see above)`);
      }
    }
    
    // Log full error details for debugging
    console.error("NextAuth GET error:", {
      message: errorMessage,
      stack: errorStack,
      url: request.url,
      method: request.method,
      origin: origin,
      isOAuthCallback,
      isOAuthError,
    });
    
    // Check if it's a database connection error
    const isDbError = 
      errorMessage.includes("Can't reach database server") ||
      errorMessage.includes("P1001") ||
      errorMessage.includes("P1000") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("DATABASE_URL") ||
      errorMessage.includes("PrismaClient") ||
      errorMessage.includes("prisma");
    
    const errorDetails = {
      error: "Internal server error",
      message: isDbError 
        ? "Database connection error. Please check your DATABASE_URL environment variable and ensure the database is running."
        : isOAuthError && isOAuthCallback
        ? "OAuth authentication failed. Check your Google OAuth credentials in Google Cloud Console."
        : errorMessage,
      ...(isDev && {
        stack: errorStack,
        name: error instanceof Error ? error.name : undefined,
        fullError: String(error),
        isDbError: isDbError,
        isOAuthError: isOAuthError,
      }),
    };
    
    const errorResponse = new Response(
      JSON.stringify(errorDetails),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
    
    try {
      return await addCorsHeaders(errorResponse, origin);
    } catch (corsError) {
      // If CORS fails, return without CORS headers
      return errorResponse;
    }
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  
  try {
    const response = await handlers.POST(request);
    return await addCorsHeaders(response, origin);
  } catch (error) {
    console.error("NextAuth POST error:", error);
    const isDev = process.env.NODE_ENV === "development";
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: isDev ? error.stack : undefined,
      name: error.name,
    } : { message: String(error) };
    
    const errorResponse = new Response(
      JSON.stringify({ 
        error: "Internal server error",
        ...errorDetails,
        ...(isDev && { fullError: String(error) })
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
    return await addCorsHeaders(errorResponse, origin);
  }
}