// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

export async function middleware(req: NextRequest) {
  try {
    const { pathname, searchParams } = req.nextUrl;
    const method = req.method;
    const origin = req.headers.get("origin");

    // CRITICAL: Never interfere with auth routes or cookie clearing
    if (pathname.startsWith("/api/auth") || pathname === "/clear-cookies" || pathname === "/api/auth/clear-session") {
      return NextResponse.next();
    }

    // Handle CORS preflight requests (OPTIONS)
    if (method === "OPTIONS" && pathname.startsWith("/api")) {
      return new NextResponse(null, {
        status: 200,
        headers: getCorsHeaders(origin),
      });
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
    const isAdminRoute = pathname.startsWith('/admin');
    const isClientRoute = pathname.startsWith('/client');
    const isCEORoute = pathname.startsWith('/ceo');
    const isPortalRoute = pathname.startsWith('/portal');
    const isOnboardingRoute = pathname.startsWith('/onboarding');
    
    const isProtectedRoute = isAdminRoute || isClientRoute || isCEORoute || isPortalRoute || isOnboardingRoute;
    
    // Only check auth on protected routes
    if (!isProtectedRoute) {
      return NextResponse.next();
    }

    // Read NextAuth JWT (edge-safe, no Prisma)
    // Handle case where cookies are too large (431 error)
    let token = null;
    let isLoggedIn = false;
    
    try {
      const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
      if (!secret) {
        console.error('Middleware: AUTH_SECRET or NEXTAUTH_SECRET is missing');
      }
      
      token = await getToken({
        req,
        secret: secret,
        secureCookie: process.env.NODE_ENV === 'production',
      });

      isLoggedIn = !!token;
    } catch (error) {
      // If we can't read the token (likely due to oversized cookies), redirect to clear cookies
      console.error('Middleware: Failed to read token (likely oversized cookies):', error);
      // Only redirect if we're not already on a public route
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/clear-cookies', req.url));
      }
      // For non-protected routes, just continue without auth
      return NextResponse.next();
    }

    if (!isLoggedIn || !token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('returnUrl', pathname + searchParams.toString());
      return NextResponse.redirect(loginUrl);
    }

    // Define special route types
    const isVerificationRoute = pathname.startsWith('/verify-email') || pathname.startsWith('/auth/verify-email');
    const isSetPasswordRoute = pathname.startsWith('/set-password');
    
    // Check onboarding completion flags (optimized format: "1" = completed, null = not completed)
    const tosAccepted = token.tosAccepted === true;
    const profileDone = token.profileDone === true;
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:97',message:'Middleware verification checks',data:{pathname:pathname,tokenTosAccepted:token.tosAccepted,tokenTosAcceptedType:typeof token.tosAccepted,tosAccepted:tosAccepted,tokenProfileDone:token.profileDone,tokenProfileDoneType:typeof token.profileDone,profileDone:profileDone,tokenEmailVerified:token.emailVerified,tokenEmailVerifiedType:typeof token.emailVerified,tokenNeedsPassword:token.needsPassword,tokenNeedsPasswordType:typeof token.needsPassword,isOnboardingRoute:isOnboardingRoute,isVerificationRoute:isVerificationRoute,isSetPasswordRoute:isSetPasswordRoute},sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    // Onboarding flow: ToS → Profile → Dashboard
    // IMPORTANT: Only enforce onboarding redirects for onboarding routes themselves
    // For dashboard routes (/client, /admin), let the pages handle redirects
    // This prevents redirect loops when token hasn't refreshed yet after completing onboarding
    if (!tosAccepted && isOnboardingRoute && !pathname.startsWith('/onboarding/tos')) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:105',message:'Middleware redirecting to TOS',data:{tosAccepted:tosAccepted,pathname:pathname},sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      return NextResponse.redirect(new URL('/onboarding/tos', req.url));
    }
    
    if (tosAccepted && !profileDone && isOnboardingRoute && !pathname.startsWith('/onboarding/profile')) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:109',message:'Middleware redirecting to profile',data:{tosAccepted:tosAccepted,profileDone:profileDone,pathname:pathname},sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      return NextResponse.redirect(new URL('/onboarding/profile', req.url));
    }
    
    // If onboarding complete, redirect away from onboarding pages
    // BUT: Only redirect if we're actually on an onboarding page to prevent loops
    if (tosAccepted && profileDone && isOnboardingRoute) {
      const role = token.role as string;
      const dashboardUrl = role === 'CEO' || role === 'ADMIN' ? '/admin' : '/client';
      // Prevent redirect loop: only redirect if not already going to dashboard
      if (!pathname.startsWith(dashboardUrl)) {
        return NextResponse.redirect(new URL(dashboardUrl, req.url));
      }
    }
    
    // Check email verification (except for verification, onboarding, and set-password routes)
    // Users can complete onboarding and set password without verification
    // But they cannot access the main app (dashboard, etc.) until verified
    const isPublicRoute = isVerificationRoute || isOnboardingRoute || isSetPasswordRoute || pathname === '/login' || pathname === '/register';
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:151',message:'Email verification check',data:{email:token.email,pathname:pathname,isPublicRoute:isPublicRoute,tokenEmailVerified:token.emailVerified,tokenEmailVerifiedType:typeof token.emailVerified},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!isPublicRoute && !token.emailVerified) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:158',message:'BLOCKED - redirecting to verify email',data:{email:token.email,pathname:pathname,redirectingTo:'/verify-email'},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const verifyUrl = new URL('/verify-email', req.url);
      verifyUrl.searchParams.set('returnUrl', pathname);
      verifyUrl.searchParams.set('email', token.email as string);
      return NextResponse.redirect(verifyUrl);
    }

    // Check if user needs to set a password (OAuth-only users)
    // Skip this check for set-password route and onboarding (password is optional for OAuth)
    if (!isSetPasswordRoute && !isOnboardingRoute && token.needsPassword === true) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:134',message:'Middleware redirecting to set password',data:{tokenNeedsPassword:token.needsPassword,tokenNeedsPasswordType:typeof token.needsPassword,pathname:pathname},sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      const setPasswordUrl = new URL('/set-password', req.url);
      return NextResponse.redirect(setPasswordUrl);
    }
    
    // Role-based route protection
    if (isAdminRoute) {
      const role = token.role as string;
      if (role !== 'CEO' && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/client', req.url));
      }
    }
    
    if (isClientRoute) {
      const role = token.role as string;
      if (role !== 'CLIENT') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Middleware error:', err);
    // Fail open instead of 500-ing the whole app
    return NextResponse.next();
  }
}

// 🎯 FIXED: Only match protected routes, NOT /login or other public pages
export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    '/ceo/:path*',
    '/portal/:path*',
    '/onboarding/:path*',
    '/verify-email',  // Allow access to verification page
    '/set-password',  // Allow access to set password page
    '/api/((?!auth).*)',  // All API routes except auth
    // NOTE: /clear-cookies is explicitly excluded in the middleware code above
  ],
};
