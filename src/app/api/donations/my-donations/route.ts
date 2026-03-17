import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/apiAuth"
import { db } from "@/lib/db"
import { logger } from '@/lib/logger'

export const dynamic = "force-dynamic"

/**
 * GET /api/donations/my-donations
 * Fetch all donations for the authenticated user
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get all donations for this user (by userId or matching email)
    const donations = await db.donation.findMany({
      where: {
        OR: [
          { userId: user.id },
          { email: session.user.email },
        ]
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(donations)
  } catch (error: unknown) {
    logger.error({ err: error }, "Get donations error")
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    )
  }
}
