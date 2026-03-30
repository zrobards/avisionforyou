import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sanitizeEmail } from "@/lib/sanitize"

/**
 * POST /api/auth/check-verification
 *
 * Checks if an email/password account needs email verification.
 * Does NOT reveal whether the account exists — only returns
 * needsVerification: true if the account exists, has a password, and is unverified.
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const cleanEmail = sanitizeEmail(email)

    if (!cleanEmail) {
      return NextResponse.json({ needsVerification: false })
    }

    const user = await db.user.findUnique({
      where: { email: cleanEmail },
      select: { emailVerified: true, passwordHash: true }
    })

    // Only flag as needing verification if it's a credentials account that's unverified
    if (user && user.passwordHash && !user.emailVerified) {
      return NextResponse.json({ needsVerification: true })
    }

    return NextResponse.json({ needsVerification: false })
  } catch {
    return NextResponse.json({ needsVerification: false })
  }
}
