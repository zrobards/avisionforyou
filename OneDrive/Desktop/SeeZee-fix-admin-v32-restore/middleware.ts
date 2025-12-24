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
    
    // #region agent log
    console.log('[MIDDLEWARE] Entry', { pathname, method, timestamp: new Date().toISOString() });
    // #endregion

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
      
      // #region agent log
      console.log('[MIDDLEWARE] About to call getToken', { 
        pathname, 
        hasSecret: !!secret,
        nodeEnv: process.env.NODE_ENV,
        secureCookie: process.env.NODE_ENV === 'production',
        authUrl: process.env.AUTH_URL,
        nextauthUrl: process.env.NEXTAUTH_URL,
        cookieHeader: req.headers.get('cookie') ? 'present' : 'missing'
      });
      // #endregion
      
      token = await getToken({
        req,
        secret: secret,
        secureCookie: process.env.NODE_ENV === 'production',
      });
      
      // #region agent log - FULL TOKEN STATE DEBUG
      console.log('[MIDDLEWARE TOKEN DEBUG] Full token state:', { 
        pathname,
        timestamp: new Date().toISOString(),
        hasToken: !!token,
        // Full token object (sanitized to prevent sensitive data leaks)
        fullToken: token ? {
          sub: token.sub,
          email: token.email,
          role: token.role,
          tosAccepted: token.tosAccepted,
          profileDone: token.profileDone,
          questionnaireCompleted: token.questionnaireCompleted,
          emailVerified: token.emailVerified,
          needsPassword: token.needsPassword,
          // Log all token keys to see what fields exist
          allKeys: Object.keys(token || {}),
        } : null,
        // Detailed onboarding field analysis
        onboardingFields: token ? {
          tosAccepted: {
            value: token.tosAccepted,
            type: typeof token.tosAccepted,
            isTrue: token.tosAccepted === true,
            isTruthy: !!token.tosAccepted,
          },
          profileDone: {
            value: token.profileDone,
            type: typeof token.profileDone,
            isTrue: token.profileDone === true,
            isTruthy: !!token.profileDone,
          },
        } : null,
        // Cookie header info (to check if cookie exists)
        hasCookieHeader: !!req.headers.get('cookie'),
        cookieHeaderLength: req.headers.get('cookie')?.length || 0,
      });
      // #endregion
      
      // #region agent log
      console.log('[MIDDLEWARE] After getToken', { 
        pathname,
        hasToken: !!token,
        tokenEmail: token?.email || null,
        tokenRole: token?.role || null,
        tokenTosAccepted: token?.tosAccepted,
        tokenTosAcceptedType: typeof token?.tosAccepted,
        tokenProfileDone: token?.profileDone,
        tokenProfileDoneType: typeof token?.profileDone
      });
      // #endregion

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
      console.log('[MIDDLEWARE] REDIRECTING TO LOGIN - not authenticated', { pathname, isLoggedIn, hasToken: !!token, isOnboardingRoute });
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:109',message:'REDIRECTING TO LOGIN - not authenticated',data:{pathname:pathname,isLoggedIn,hasToken:!!token,isOnboardingRoute,returnUrl:pathname + searchParams.toString()},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('returnUrl', pathname + searchParams.toString());
      return NextResponse.redirect(loginUrl);
    }

    // Define special route types
    const isSetPasswordRoute = pathname.startsWith('/set-password');
    
    // Check onboarding completion flags
    // CRITICAL FIX: Token values are booleans (true/false/undefined)
    // Only treat as "accepted" if explicitly true, everything else is "not accepted"
    const tosAccepted = token.tosAccepted === true;
    const profileDone = token.profileDone === true;
    
    // #region agent log - COMPARE WITH JWT CALLBACK VALUES
    console.log('[MIDDLEWARE] Onboarding check - COMPARING WITH JWT CALLBACK', { 
      pathname,
      timestamp: new Date().toISOString(),
      // Raw token values from middleware
      middlewareToken: {
        tosAccepted: token.tosAccepted,
        tosAcceptedType: typeof token.tosAccepted,
        tosAcceptedIsTrue: token.tosAccepted === true,
        profileDone: token.profileDone,
        profileDoneType: typeof token.profileDone,
        profileDoneIsTrue: token.profileDone === true,
      },
      // Computed boolean values
      computed: {
        tosAccepted,
        profileDone,
      },
      // Context
      isOnboardingRoute,
      isSetPasswordRoute,
      role: token.role,
      // Expected values (these should match JWT callback logs)
      expectedFromJWT: 'Should be true if JWT callback set them',
    });
    // #endregion
    
    // #region agent log
    console.log('[MIDDLEWARE] Onboarding check', { 
      pathname, 
      rawTokenTosAccepted: token.tosAccepted, 
      rawTokenTosAcceptedType: typeof token.tosAccepted,
      rawTokenProfileDone: token.profileDone,
      rawTokenProfileDoneType: typeof token.profileDone,
      tosAcceptedBoolean: tosAccepted,
      profileDoneBoolean: profileDone,
      isOnboardingRoute,
      isSetPasswordRoute,
      role: token.role
    });
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:123',message:'Onboarding check evaluation',data:{pathname:pathname,rawTokenTosAccepted:token.tosAccepted,rawTokenTosAcceptedType:typeof token.tosAccepted,rawTokenProfileDone:token.profileDone,rawTokenProfileDoneType:typeof token.profileDone,tosAcceptedBoolean:tosAccepted,profileDoneBoolean:profileDone,isOnboardingRoute,isSetPasswordRoute,role:token.role},sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    // CRITICAL FIX: If user is on onboarding route, be lenient with stale tokens
    // The JWT callback will refresh the token when the page loads and calls /api/auth/session
    // So if they're already on onboarding, let them through even if token seems stale
    // This prevents redirect loops when DB is updated but token hasn't refreshed yet
    if (isOnboardingRoute) {
      // #region agent log
      console.log('[MIDDLEWARE] Onboarding route - allowing access (token may be stale, will refresh on page load)', { 
        pathname, 
        tokenTosAccepted: token.tosAccepted, 
        tokenProfileDone: token.profileDone 
      });
      // #endregion
      
      // If token shows onboarding is complete, redirect to dashboard (handles case where token was refreshed)
      if (tosAccepted && profileDone) {
        const role = token.role as string;
        const dashboardUrl = role === 'CEO' || role === 'ADMIN' ? '/admin' : '/client';
        // #region agent log
        console.log('[MIDDLEWARE] Onboarding route but token shows complete - redirecting to dashboard', { 
          pathname, 
          role, 
          dashboardUrl 
        });
        // #endregion
        return NextResponse.redirect(new URL(dashboardUrl, req.url));
      }
      
      // Otherwise, allow access - the page will call /api/auth/session which triggers JWT callback to refresh token
      return NextResponse.next();
    }
    
    // CRITICAL FIX: If logged in BUT not onboarded, redirect DIRECTLY to onboarding (NOT via login)
    // This prevents the redirect loop where logged-in users get sent to login with returnUrl=/onboarding/tos
    // Only check this for protected routes that require onboarding (client routes, not onboarding routes themselves)
    if (!isOnboardingRoute && !isSetPasswordRoute) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:130',message:'Checking non-onboarding route for onboarding status',data:{pathname:pathname,tosAccepted,profileDone,willCheckTos:!tosAccepted,willCheckProfile:!profileDone},sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      if (!tosAccepted) {
        // #region agent log
        console.log('[MIDDLEWARE] REDIRECTING TO TOS - logged in but not onboarded', { pathname, tosAccepted, profileDone, isOnboardingRoute });
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:125',message:'REDIRECTING TO TOS - logged in but not onboarded',data:{pathname:pathname,tosAccepted,profileDone,isOnboardingRoute},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
    
    // NOTE: Onboarding route check moved above to handle stale tokens
    // This section is now unreachable for onboarding routes, but kept for safety
    if (false && isOnboardingRoute) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:124',message:'Onboarding route check',data:{pathname:pathname,tosAccepted,profileDone,tokenTosAccepted:token.tosAccepted,tokenProfileDone:token.profileDone,isTosRoute:pathname.startsWith('/onboarding/tos')},sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      // If user is on /onboarding/tos and has already accepted TOS, redirect to next step
      if (pathname.startsWith('/onboarding/tos') && tosAccepted) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:160',message:'On /onboarding/tos with TOS accepted - checking profile status',data:{pathname:pathname,tosAccepted,profileDone,willRedirectToDashboard:profileDone,willRedirectToProfile:!profileDone},sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        if (profileDone) {
          // Onboarding complete - redirect to dashboard
          const role = token.role as string;
          const dashboardUrl = role === 'CEO' || role === 'ADMIN' ? '/admin' : '/client';
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:165',message:'REDIRECTING from TOS to dashboard',data:{pathname:pathname,role,dashboardUrl,reason:'Onboarding complete'},sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
          // #endregion
          return NextResponse.redirect(new URL(dashboardUrl, req.url));
        } else {
          // TOS done but profile not done - redirect to profile
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:172',message:'REDIRECTING from TOS to profile',data:{pathname:pathname,reason:'TOS done but profile not done'},sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
          // #endregion
          return NextResponse.redirect(new URL('/onboarding/profile', req.url));
        }
      }
      
      // If user is on /onboarding/profile and hasn't accepted TOS, redirect to TOS
      if (pathname.startsWith('/onboarding/profile') && !tosAccepted) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:179',message:'REDIRECTING from profile to TOS',data:{pathname:pathname,reason:'Profile page but TOS not accepted'},sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        return NextResponse.redirect(new URL('/onboarding/tos', req.url));
      }
      
      // If user is on /onboarding/profile and has completed profile, redirect to dashboard
      if (pathname.startsWith('/onboarding/profile') && tosAccepted && profileDone) {
        const role = token.role as string;
        const dashboardUrl = role === 'CEO' || role === 'ADMIN' ? '/admin' : '/client';
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:186',message:'REDIRECTING from profile to dashboard',data:{pathname:pathname,role,dashboardUrl,reason:'Onboarding complete'},sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        return NextResponse.redirect(new URL(dashboardUrl, req.url));
      }
      
      // Otherwise, allow access to onboarding routes
      // #region agent log
      console.log('[MIDDLEWARE] ALLOWING access to onboarding route', { pathname, tosAccepted, profileDone, reason: 'No redirect conditions met' });
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:193',message:'ALLOWING access to onboarding route',data:{pathname:pathname,tosAccepted,profileDone,reason:'No redirect conditions met'},sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:207',message:'Admin route role check',data:{pathname:pathname,role,isCEO:role==='CEO',isADMIN:role==='ADMIN',willAllow:role==='CEO'||role==='ADMIN'},sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      if (role !== 'CEO' && role !== 'ADMIN') {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:210',message:'REDIRECTING from admin to client - wrong role',data:{pathname:pathname,role,reason:'Not CEO or ADMIN'},sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
        return NextResponse.redirect(new URL('/client', req.url));
      }
    }
    
    if (isClientRoute) {
      const role = token.role as string;
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:216',message:'Client route role check',data:{pathname:pathname,role,isCLIENT:role==='CLIENT',willAllow:role==='CLIENT'},sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      if (role !== 'CLIENT') {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:219',message:'REDIRECTING from client to admin - wrong role',data:{pathname:pathname,role,reason:'Not CLIENT'},sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:225',message:'ALLOWING access - all checks passed',data:{pathname:pathname,role:token.role,tosAccepted,profileDone},sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
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
