import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const pathname = request.nextUrl.pathname

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
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

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/:path*',
    '/:path*.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|eot)'
  ]
}
