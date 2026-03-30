import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { rateLimit, authLimiter, getClientIp } from "@/lib/rateLimit"
import { sanitizeString, sanitizeEmail } from "@/lib/sanitize"
import { logActivity, notifyByRole } from "@/lib/notifications"
import { sendEmail } from "@/lib/email"
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = await rateLimit(authLimiter, ip)
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      )
    }

    const { email, name, password } = await request.json()

    // Validation (before sanitization — validate raw inputs first)
    if (!email || !name || !password) {
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

    // Sanitize inputs after validation
    const cleanEmail = sanitizeEmail(email)
    const cleanName = sanitizeString(name, 100)

    if (!cleanEmail) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: cleanEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create user (emailVerified is null — unverified)
    await db.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        passwordHash,
        role: "USER"
      }
    })

    // Generate email verification token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

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
              Hi ${cleanName},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Welcome to A Vision For You! Please verify your email address to activate your account.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="display: inline-block; background-color: #7f3d8b; color: white; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.
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

    // Log activity and notify admins (non-blocking)
    logActivity("user_registration", `New user registered: ${cleanName} (pending verification)`, cleanEmail)
    notifyByRole(["ADMIN"], "user_registration", "New User Registration", `${cleanName} (${cleanEmail}) created an account (pending email verification)`)

    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        message: "Account created. Please check your email to verify your account.",
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    logger.error({ err: error }, "Signup error")
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    )
  }
}
