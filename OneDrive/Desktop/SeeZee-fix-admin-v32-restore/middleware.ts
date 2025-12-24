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
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:83',message:'BEFORE getToken call',data:{pathname:pathname,hasSecret:!!secret,isProtectedRoute,env:process.env.NODE_ENV},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      token = await getToken({
        req,
        secret: secret,
        secureCookie: process.env.NODE_ENV === 'production',
      });

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:94',message:'AFTER getToken call',data:{pathname:pathname,hasToken:!!token,isLoggedIn:!!token,tokenEmail:token?.email||null,tokenRole:token?.role||null,tokenTosAccepted:token?.tosAccepted||null,tokenProfileDone:token?.profileDone||null},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

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

    // CRITICAL FIX: Check authentication first, then onboarding status
    // If NOT logged in → redirect to login with returnUrl = original path
    if (!isLoggedIn || !token) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:109',message:'REDIRECTING TO LOGIN - not authenticated',data:{pathname:pathname,isLoggedIn,hasToken:!!token,returnUrl:pathname + searchParams.toString()},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('returnUrl', pathname + searchParams.toString());
      return NextResponse.redirect(loginUrl);
    }

    // Define special route types
    const isSetPasswordRoute = pathname.startsWith('/set-password');
    
    // Check onboarding completion flags (optimized format: "1" = completed, null = not completed)
    const tosAccepted = token.tosAccepted === true;
    const profileDone = token.profileDone === true;
    
    // CRITICAL FIX: If logged in BUT not onboarded, redirect DIRECTLY to onboarding (NOT via login)
    // This prevents the redirect loop where logged-in users get sent to login with returnUrl=/onboarding/tos
    // Only check this for protected routes that require onboarding (client routes, not onboarding routes themselves)
    if (!isOnboardingRoute && !isSetPasswordRoute) {
      if (!tosAccepted) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:125',message:'REDIRECTING TO TOS - logged in but not onboarded',data:{pathname:pathname,tosAccepted,profileDone},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        // User is logged in but hasn't accepted TOS - redirect DIRECTLY to onboarding
        return NextResponse.redirect(new URL('/onboarding/tos', req.url));
      }
      
      if (!profileDone) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:132',message:'REDIRECTING TO PROFILE - logged in but profile not done',data:{pathname:pathname,tosAccepted,profileDone},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        // User is logged in, TOS accepted, but profile not done - redirect DIRECTLY to profile
        return NextResponse.redirect(new URL('/onboarding/profile', req.url));
      }
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:97',message:'Middleware verification checks',data:{pathname:pathname,tokenTosAccepted:token.tosAccepted,tokenTosAcceptedType:typeof token.tosAccepted,tosAccepted:tosAccepted,tokenProfileDone:token.profileDone,tokenProfileDoneType:typeof token.profileDone,profileDone:profileDone,tokenNeedsPassword:token.needsPassword,tokenNeedsPasswordType:typeof token.needsPassword,isOnboardingRoute:isOnboardingRoute,isSetPasswordRoute:isSetPasswordRoute},sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    // Onboarding flow: ToS → Profile → Dashboard
    // IMPORTANT: Allow authenticated users to access onboarding routes
    // Only redirect within onboarding flow, don't block access to onboarding pages
    if (isOnboardingRoute) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:124',message:'Onboarding route check',data:{pathname:pathname,tosAccepted,profileDone,tokenTosAccepted:token.tosAccepted,tokenProfileDone:token.profileDone,isTosRoute:pathname.startsWith('/onboarding/tos')},sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      // If user is on /onboarding/tos and has already accepted TOS, redirect to next step
      if (pathname.startsWith('/onboarding/tos') && tosAccepted) {
        if (profileDone) {
          // Onboarding complete - redirect to dashboard
          const role = token.role as string;
          const dashboardUrl = role === 'CEO' || role === 'ADMIN' ? '/admin' : '/client';
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:130',message:'Redirecting from TOS to dashboard',data:{pathname:pathname,role,dashboardUrl},sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          return NextResponse.redirect(new URL(dashboardUrl, req.url));
        } else {
          // TOS done but profile not done - redirect to profile
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:135',message:'Redirecting from TOS to profile',data:{pathname:pathname},sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          return NextResponse.redirect(new URL('/onboarding/profile', req.url));
        }
      }
      
      // If user is on /onboarding/profile and hasn't accepted TOS, redirect to TOS
      if (pathname.startsWith('/onboarding/profile') && !tosAccepted) {
        return NextResponse.redirect(new URL('/onboarding/tos', req.url));
      }
      
      // If user is on /onboarding/profile and has completed profile, redirect to dashboard
      if (pathname.startsWith('/onboarding/profile') && tosAccepted && profileDone) {
        const role = token.role as string;
        const dashboardUrl = role === 'CEO' || role === 'ADMIN' ? '/admin' : '/client';
        return NextResponse.redirect(new URL(dashboardUrl, req.url));
      }
      
      // Otherwise, allow access to onboarding routes
      return NextResponse.next();
    }
    
    // Email verification has been removed - all users are auto-verified on signup

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
    '/set-password',  // Allow access to set password page
    '/api/((?!auth).*)',  // All API routes except auth
    // NOTE: /clear-cookies is explicitly excluded in the middleware code above
  ],
};
