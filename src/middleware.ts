import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
    return NextResponse.next()
  }

  const token = await getToken({ req: request })
  const pathname = request.nextUrl.pathname

  // Board routes - only BOARD and ADMIN
  if (pathname.startsWith("/board")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (token.role !== "BOARD" && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Community routes - ALUMNI, BOARD, and ADMIN
  if (pathname.startsWith("/community")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (token.role !== "ALUMNI" && token.role !== "BOARD" && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Admin routes - only ADMIN
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Protect dashboard - any authenticated user
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

  // Prevent caching on API routes (may return user-specific data)
  if (pathname.startsWith("/api/")) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate'
    )
  }

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.squareup.com https://sandbox.web.squarecdn.com https://www.googletagmanager.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.squareup.com https://*.squarecdn.com https://*.google-analytics.com https://*.vercel-insights.com",
      "frame-src https://*.squareup.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/board/:path*',
    '/community/:path*',
    '/dashboard/:path*',
    '/api/:path*',
    '/:path*.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|eot)'
  ]
}
