import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { rateLimit, authLimiter, getClientIp } from "@/lib/rateLimit"
import { sanitizeString, sanitizeEmail } from "@/lib/sanitize"
import { logActivity, notifyByRole } from "@/lib/notifications"
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

    // Create user
    const user = await db.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        passwordHash,
        role: "USER"
      }
    })

    // Log activity and notify admins (non-blocking)
    logActivity("user_registration", `New user registered: ${cleanName}`, cleanEmail)
    notifyByRole(["ADMIN"], "user_registration", "New User Registration", `${cleanName} (${cleanEmail}) created an account`)

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
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
