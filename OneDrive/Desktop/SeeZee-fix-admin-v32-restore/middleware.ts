import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://see-zee.com",
  "https://www.see-zee.com",
];

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

// Routes that require authentication
const protectedRoutes = [
  "/start",
  "/client",
  "/onboarding",
];

// Routes that should be accessible to everyone
const publicRoutes = [
  "/",
  "/login",
  "/signin",
  "/signup",
  "/register",
  "/about",
  "/services",
  "/contact",
  "/privacy",
  "/terms",
];

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const method = request.method;
  const origin = request.headers.get("origin");
  
  try {

    // CRITICAL: Never interfere with auth routes - let NextAuth handle them completely
    // This MUST be the first check to avoid any interference with OAuth flow
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // Handle CORS preflight requests (OPTIONS)
    if (method === "OPTIONS" && pathname.startsWith("/api")) {
      return new NextResponse(null, {
        status: 200,
        headers: getCorsHeaders(origin),
      });
    }

    // Never interfere with RSC requests
    if (searchParams.has("_rsc")) {
      return NextResponse.next();
    }

    // Never interfere with prefetch requests
    if (request.headers.get("next-router-prefetch") === "1") {
      return NextResponse.next();
    }

    // Add CORS headers to all API routes
    if (pathname.startsWith("/api")) {
      const response = NextResponse.next();
      const corsHeaders = getCorsHeaders(origin);
      
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }

    // Check if route requires authentication
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (isProtectedRoute) {
      try {
        // Get session - wrap in try-catch to handle database/connection errors gracefully
        const session = await auth();
      
      // If no session, redirect to login with return URL
      if (!session?.user) {
        const url = new URL("/login", request.url);
        url.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(url);
      }

      // Check if user needs to complete onboarding questionnaire
      // (except if they're already on the onboarding page)
      if (!pathname.startsWith("/onboarding") && session.user.email) {
        // Check if user has completed the brief questionnaire
        // For CLIENT role users trying to access /start
        if (pathname.startsWith("/start") && session.user.role === "CLIENT") {
          // Check if questionnaireCompleted field exists (handles null and undefined)
          const questionnaireCompleted = session.user.questionnaireCompleted;
          console.log(`🔍 Middleware check: User ${session.user.email} - questionnaireCompleted: ${questionnaireCompleted ? 'Yes' : 'No'}, path: ${pathname}`);
          
          if (!questionnaireCompleted) {
            // Redirect to brief questionnaire
            console.log(`🔄 Redirecting ${session.user.email} to questionnaire (questionnaireCompleted is ${questionnaireCompleted === null ? 'null' : 'undefined'})`);
            const url = new URL("/onboarding/brief-questionnaire", request.url);
            return NextResponse.redirect(url);
          }
          
          console.log(`✅ User ${session.user.email} has completed questionnaire, allowing access to ${pathname}`);
        }
      }
    } catch (error) {
      // Handle auth errors gracefully - log and redirect to login
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Middleware auth check failed:", errorMessage);
      
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
      
      if (isDbError) {
        console.error("💡 Database connection error detected. Check your DATABASE_URL and ensure the database is running.");
      }
      
      // Redirect to login on any auth error (don't crash the middleware)
      const url = new URL("/login", request.url);
      url.searchParams.set("returnUrl", pathname);
      url.searchParams.set("error", "AuthError");
      return NextResponse.redirect(url);
    }
  }

    return NextResponse.next();
  } catch (error) {
    // Top-level error handler - catch any unexpected errors in middleware
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Middleware top-level error:", errorMessage);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack");
    
    // For API routes, return 500 error
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Internal server error", message: "Middleware error" },
        { status: 500 }
      );
    }
    
    // For page routes, try to continue (don't crash)
    // This allows the page to load even if middleware has issues
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all API routes EXCEPT auth routes (NextAuth handles those)
    "/api/((?!auth).*)",
    // Match all pages except Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};


