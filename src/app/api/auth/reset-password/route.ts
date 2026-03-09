import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { rateLimit, authLimiter, getClientIp } from "@/lib/rateLimit"
import { sanitizeEmail } from "@/lib/sanitize"
import { logger } from "@/lib/logger"

/**
 * POST /api/auth/reset-password
 *
 * Validates the reset token and updates the user's password.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = await rateLimit(authLimiter, ip)
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      )
    }

    const { token, email, password } = await request.json()
    const cleanEmail = sanitizeEmail(email)

    if (!token || !cleanEmail || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    if (!/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json(
        { error: "Password must include at least 1 number and 1 special character" },
        { status: 400 }
      )
    }

    // Find the reset token
    const resetToken = await db.verificationToken.findFirst({
      where: {
        identifier: `reset:${cleanEmail}`,
        token,
      }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      )
    }

    // Check expiry
    if (new Date() > resetToken.expires) {
      // Clean up expired token
      await db.verificationToken.deleteMany({
        where: { identifier: `reset:${cleanEmail}`, token }
      })
      return NextResponse.json(
        { error: "Reset link has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Update password and delete token in a transaction
    await db.$transaction([
      db.user.update({
        where: { email: cleanEmail },
        data: { passwordHash }
      }),
      db.verificationToken.deleteMany({
        where: { identifier: `reset:${cleanEmail}` }
      })
    ])

    logger.info({ email: cleanEmail }, "Password reset successful")

    return NextResponse.json(
      { message: "Password reset successfully. You can now sign in." },
      { status: 200 }
    )
  } catch (error) {
    logger.error({ err: error }, "Reset password error")
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    )
  }
}
