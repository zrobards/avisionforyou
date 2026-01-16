import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const pathname = request.nextUrl.pathname

  // Protect admin routes - Only ADMIN can access
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protect board routes - Staff (board members) and admins only
  if (pathname.startsWith("/board")) {
    if (!token || (token.role !== "STAFF" && token.role !== "ADMIN")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protect dashboard - Staff (board members) should go to /board instead
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    // Redirect staff (board members) to their board portal
    if (token.role === "STAFF") {
      return NextResponse.redirect(new URL("/board", request.url))
    }
  }

  const response = NextResponse.next()

  // Add caching headers for static assets
  if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|eot)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }

  // Add caching headers for API routes (5 minutes)
  if (pathname.startsWith("/api/")) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, s-maxage=300'
    )
  }

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // HSTS header
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )
  
  // CSP in Report-Only mode (Stage 1) - Relaxed for development
  // After testing in production, can tighten and enforce
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob: https://*.vercel.app",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://connect.squareup.com https://connect.squareupsandbox.com https://api.resend.com https://*.vercel.app https://*.vercel-scripts.com wss://*.vercel.app",
    "frame-src 'self' https://connect.squareup.com https://connect.squareupsandbox.com https://www.facebook.com https://www.instagram.com https://platform.twitter.com",
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy-Report-Only', cspDirectives)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
