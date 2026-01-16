import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const pathname = request.nextUrl.pathname

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token || (token.role !== "ADMIN" && token.role !== "STAFF")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protect board routes
  if (pathname.startsWith("/board")) {
    const boardRoles = ["BOARD_PRESIDENT", "BOARD_VP", "BOARD_TREASURER", "BOARD_SECRETARY", "BOARD_MEMBER", "ADMIN"]
    if (!token || !boardRoles.includes(token.role as string)) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protect dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
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
  
  // CSP in Report-Only mode (Stage 1)
  // After testing, change to Content-Security-Policy (remove -Report-Only)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://connect.squareup.com https://connect.squareupsandbox.com https://api.resend.com",
    "frame-src 'self' https://connect.squareup.com https://connect.squareupsandbox.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests"
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
    '/((?!_next/static|_next/image|favicon.ico|team/).*)',
  ]
}
