import { NextResponse } from "next/server"
import { logger } from '@/lib/logger'

export async function POST() {
  try {
    // Clear the session cookie by setting it to expire immediately
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    )

    // Clear NextAuth session cookies
    response.cookies.set("next-auth.session-token", "", { maxAge: 0, path: "/" })
    response.cookies.set("__Secure-next-auth.session-token", "", { maxAge: 0, path: "/" })
    response.cookies.set("next-auth.csrf-token", "", { maxAge: 0, path: "/" })
    response.cookies.set("__Host-next-auth.csrf-token", "", { maxAge: 0, path: "/" })
    response.cookies.set("next-auth.callback-url", "", { maxAge: 0, path: "/" })

    return response
  } catch (error: unknown) {
    logger.error({ err: error }, "Logout error")
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    )
  }
}
