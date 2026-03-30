import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sanitizeEmail } from "@/lib/sanitize"
import { logger } from "@/lib/logger"

/**
 * POST /api/auth/verify-email
 *
 * Validates the email verification token and marks the user as verified.
 */
export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()
    const cleanEmail = sanitizeEmail(email)

    if (!token || !cleanEmail) {
      return NextResponse.json(
        { error: "Invalid verification link." },
        { status: 400 }
      )
    }

    // Find the verification token
    const verificationToken = await db.verificationToken.findFirst({
      where: {
        identifier: `verify:${cleanEmail}`,
        token,
      }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification link. Please request a new one." },
        { status: 400 }
      )
    }

    // Check expiry
    if (new Date() > verificationToken.expires) {
      await db.verificationToken.deleteMany({
        where: { identifier: `verify:${cleanEmail}`, token }
      })
      return NextResponse.json(
        { error: "Verification link has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Mark user as verified and delete token in a transaction
    await db.$transaction([
      db.user.update({
        where: { email: cleanEmail },
        data: { emailVerified: new Date() }
      }),
      db.verificationToken.deleteMany({
        where: { identifier: `verify:${cleanEmail}` }
      })
    ])

    logger.info({ email: cleanEmail }, "Email verified successfully")

    return NextResponse.json(
      { message: "Email verified successfully. You can now sign in." },
      { status: 200 }
    )
  } catch (error) {
    logger.error({ err: error }, "Email verification error")
    return NextResponse.json(
      { error: "Failed to verify email. Please try again." },
      { status: 500 }
    )
  }
}
