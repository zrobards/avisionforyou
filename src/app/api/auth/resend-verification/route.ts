import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { rateLimit, authLimiter, getClientIp } from "@/lib/rateLimit"
import { sanitizeEmail } from "@/lib/sanitize"
import { logger } from "@/lib/logger"
import crypto from "crypto"

/**
 * POST /api/auth/resend-verification
 *
 * Resends the email verification link.
 * Always returns 200 to prevent email enumeration.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = await rateLimit(authLimiter, ip)
    if (!rl.success) {
      return NextResponse.json(
        { message: "If an account exists with that email, a verification link has been sent." },
        { status: 200 }
      )
    }

    const { email } = await request.json()
    const cleanEmail = sanitizeEmail(email)

    if (!cleanEmail) {
      return NextResponse.json(
        { message: "If an account exists with that email, a verification link has been sent." },
        { status: 200 }
      )
    }

    // Find unverified user
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, emailVerified: true, passwordHash: true }
    })

    if (!user || !user.passwordHash || user.emailVerified) {
      // Don't reveal account existence
      return NextResponse.json(
        { message: "If an account exists with that email, a verification link has been sent." },
        { status: 200 }
      )
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Delete existing verification tokens and create new one
    await db.verificationToken.deleteMany({
      where: { identifier: `verify:${cleanEmail}` }
    })

    await db.verificationToken.create({
      data: {
        identifier: `verify:${cleanEmail}`,
        token,
        expires,
      }
    })

    // Send verification email
    const baseUrl = process.env.NEXTAUTH_URL || "https://avisionforyourecovery.org"
    const verifyUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(cleanEmail)}`

    await sendEmail({
      to: cleanEmail,
      subject: "Verify Your Email - A Vision For You",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #7f3d8b; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Verify Your Email</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${user.name || "there"},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Please verify your email address to activate your account.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="display: inline-block; background-color: #7f3d8b; color: white; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              This link expires in 24 hours.
            </p>
            <div style="border-top: 1px solid #e5e7eb; margin-top: 20px; padding-top: 20px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #6b7280; font-size: 12px; word-break: break-all; margin-top: 4px;">
                ${verifyUrl}
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

    logger.info({ email: cleanEmail }, "Verification email resent")

    return NextResponse.json(
      { message: "If an account exists with that email, a verification link has been sent." },
      { status: 200 }
    )
  } catch (error) {
    logger.error({ err: error }, "Resend verification error")
    return NextResponse.json(
      { message: "If an account exists with that email, a verification link has been sent." },
      { status: 200 }
    )
  }
}
