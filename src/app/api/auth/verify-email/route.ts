import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sanitizeEmail } from "@/lib/sanitize"
import { sendEmail } from "@/lib/email"
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
    const [verifiedUser] = await db.$transaction([
      db.user.update({
        where: { email: cleanEmail },
        data: { emailVerified: new Date() },
        select: { name: true }
      }),
      db.verificationToken.deleteMany({
        where: { identifier: `verify:${cleanEmail}` }
      })
    ])

    logger.info({ email: cleanEmail }, "Email verified successfully")

    // Send welcome email (non-blocking)
    const baseUrl = process.env.NEXTAUTH_URL || "https://avisionforyourecovery.org"
    sendEmail({
      to: cleanEmail,
      subject: "Welcome to A Vision For You!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #7f3d8b, #9333ea); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to A Vision For You!</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${verifiedUser.name || "there"},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Your email has been verified and your account is now active. Welcome to our recovery community!
            </p>

            <h2 style="color: #7f3d8b; font-size: 18px; margin-top: 25px;">Here's What You Can Do</h2>

            <div style="background: white; border-left: 4px solid #b6e41f; padding: 15px; margin: 15px 0; border-radius: 4px;">
              <p style="margin: 0; color: #374151;"><strong>Explore Our Programs</strong></p>
              <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Learn about IOP, shelter, self-help groups, and more.</p>
              <a href="${baseUrl}/programs" style="color: #7f3d8b; font-size: 14px;">View Programs &rarr;</a>
            </div>

            <div style="background: white; border-left: 4px solid #b6e41f; padding: 15px; margin: 15px 0; border-radius: 4px;">
              <p style="margin: 0; color: #374151;"><strong>Find the Right Program</strong></p>
              <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Take our quick assessment to find the best fit for your recovery journey.</p>
              <a href="${baseUrl}/assessment" style="color: #7f3d8b; font-size: 14px;">Start Assessment &rarr;</a>
            </div>

            <div style="background: white; border-left: 4px solid #b6e41f; padding: 15px; margin: 15px 0; border-radius: 4px;">
              <p style="margin: 0; color: #374151;"><strong>Support Our Mission</strong></p>
              <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Every dollar helps provide housing, meals, and recovery support.</p>
              <a href="${baseUrl}/donate" style="color: #7f3d8b; font-size: 14px;">Make a Donation &rarr;</a>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/dashboard" style="display: inline-block; background: #7f3d8b; color: white; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
                Go to Your Dashboard
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you have questions, reach out anytime at <a href="mailto:info@avisionforyourecovery.org" style="color: #7f3d8b;">info@avisionforyourecovery.org</a> or call us at <a href="tel:+15027496344" style="color: #7f3d8b;">(502) 749-6344</a>.
            </p>
          </div>
          <div style="background-color: #e5e7eb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              A Vision For You | 1675 Story Ave, Louisville, KY 40206
            </p>
          </div>
        </div>
      `,
    }).catch(err => logger.error({ err }, "Failed to send welcome email"))

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
