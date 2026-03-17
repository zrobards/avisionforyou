import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/apiAuth"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"

/**
 * POST /api/donations/cancel
 * Cancel a recurring donation for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { donationId } = body

    if (!donationId) {
      return NextResponse.json(
        { error: "Donation ID is required" },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Find the donation and verify ownership
    const donation = await db.donation.findFirst({
      where: {
        id: donationId,
        OR: [
          { userId: user.id },
          { email: session.user.email },
        ]
      }
    })

    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      )
    }

    if (donation.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Donation is already cancelled" },
        { status: 400 }
      )
    }

    // Update donation status to CANCELLED
    await db.donation.update({
      where: { id: donationId },
      data: {
        status: "CANCELLED",
        nextRenewalDate: null,
      }
    })

    logger.info({ donationId, userId: user.id }, "Recurring donation cancelled")

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    logger.error({ err: error }, "Cancel donation error")
    return NextResponse.json(
      { error: "Failed to cancel donation" },
      { status: 500 }
    )
  }
}
