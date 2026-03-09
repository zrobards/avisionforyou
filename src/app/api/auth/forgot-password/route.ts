import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { rateLimit, authLimiter, getClientIp } from "@/lib/rateLimit"
import { sanitizeEmail } from "@/lib/sanitize"
import { logger } from "@/lib/logger"
import crypto from "crypto"

/**
 * POST /api/auth/forgot-password
 *
 * Sends a password reset email with a secure token.
 * Uses the existing VerificationToken model — no schema change needed.
 * Always returns 200 to prevent email enumeration.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = await rateLimit(authLimiter, ip)
    if (!rl.success) {
      return NextResponse.json(
        { message: "If an account exists with that email, a reset link has been sent." },
        { status: 200 }
      )
    }

    const { email } = await request.json()
    const cleanEmail = sanitizeEmail(email)

    if (!cleanEmail) {
      // Don't reveal whether email is valid
      return NextResponse.json(
        { message: "If an account exists with that email, a reset link has been sent." },
        { status: 200 }
      )
    }

    // Check if user exists and has a password (not OAuth-only)
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, passwordHash: true }
    })

    if (!user || !user.passwordHash) {
      // Don't reveal whether email is valid
      return NextResponse.json(
        { message: "If an account exists with that email, a reset link has been sent." },
        { status: 200 }
      )
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete any existing reset tokens for this email
    await db.verificationToken.deleteMany({
      where: { identifier: `reset:${cleanEmail}` }
    })

    // Store token
    await db.verificationToken.create({
      data: {
        identifier: `reset:${cleanEmail}`,
        token,
        expires,
      }
    })

    // Send reset email
    const baseUrl = process.env.NEXTAUTH_URL || "https://avisionforyourecovery.org"
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(cleanEmail)}`

    await sendEmail({
      to: cleanEmail,
      subject: "Reset Your Password - A Vision For You",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #7f3d8b; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${user.name || "there"},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #7f3d8b; color: white; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
            <div style="border-top: 1px solid #e5e7eb; margin-top: 20px; padding-top: 20px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #6b7280; font-size: 12px; word-break: break-all; margin-top: 4px;">
                ${resetUrl}
              </p>
            </div>
          </div>
          <div style="background-color: #e5e7eb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              A Vision For You | 1675 Story Ave, Louisville, KY 40206
            </p>
          </div>
        </div>
      `,
    })

    logger.info({ email: cleanEmail }, "Password reset email sent")

    return NextResponse.json(
      { message: "If an account exists with that email, a reset link has been sent." },
      { status: 200 }
    )
  } catch (error) {
    logger.error({ err: error }, "Forgot password error")
    return NextResponse.json(
      { message: "If an account exists with that email, a reset link has been sent." },
      { status: 200 }
    )
  }
}
