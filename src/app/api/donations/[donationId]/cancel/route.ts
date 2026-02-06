import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { SquareClient, SquareEnvironment } from "square"

/**
 * POST /api/donations/[donationId]/cancel
 * Cancel a recurring donation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { donationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const donationId = params.donationId

    // Get the donation
    const donation = await db.donation.findUnique({
      where: { id: donationId },
      include: { user: true }
    })

    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      )
    }

    // Verify user owns this donation
    if (donation.user?.email !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Check if it's a recurring donation
    if (donation.frequency === "ONE_TIME") {
      return NextResponse.json(
        { error: "Cannot cancel one-time donations" },
        { status: 400 }
      )
    }

    // Check if already cancelled
    if (donation.cancelledAt) {
      return NextResponse.json(
        { error: "Donation already cancelled" },
        { status: 400 }
      )
    }

    // Cancel with Square if it has a subscription ID
    if (donation.squareSubscriptionId) {
      try {
        const client = new SquareClient({
          token: process.env.SQUARE_ACCESS_TOKEN,
          environment: process.env.SQUARE_ENVIRONMENT === "production"
            ? SquareEnvironment.Production
            : SquareEnvironment.Sandbox,
        })

        await client.subscriptions.cancel({
          subscriptionId: donation.squareSubscriptionId
        })

        console.log("Square: Subscription cancelled", donation.squareSubscriptionId)
      } catch (squareError: any) {
        console.error("Square: Failed to cancel subscription:", squareError)
        // Continue anyway - we'll still mark it as cancelled in our DB
      }
    }

    // Update donation in database
    const updatedDonation = await db.donation.update({
      where: { id: donationId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date()
      }
    })

    console.log("Donation cancelled:", {
      donationId: updatedDonation.id,
      frequency: updatedDonation.frequency,
      email: updatedDonation.email
    })

    return NextResponse.json({
      success: true,
      donation: updatedDonation
    })
  } catch (error: any) {
    console.error("Cancel donation error:", error)
    return NextResponse.json(
      { error: "Failed to cancel donation" },
      { status: 500 }
    )
  }
}
