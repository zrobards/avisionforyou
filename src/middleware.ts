import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
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
