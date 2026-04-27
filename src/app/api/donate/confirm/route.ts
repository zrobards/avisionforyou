import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"
import { getSquareApiBaseUrl } from "@/lib/square"
import { applyDonationPaymentStatus } from "@/lib/donations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const donationId = typeof body?.donationId === "string" ? body.donationId : ""

    if (!donationId) {
      return NextResponse.json({ error: "donationId is required" }, { status: 400 })
    }

    const donation = await db.donation.findUnique({
      where: { id: donationId }
    })

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    if (!donation.squarePaymentId) {
      return NextResponse.json({
        status: donation.status,
        confirmed: donation.status === "COMPLETED"
      })
    }

    const response = await fetch(`${getSquareApiBaseUrl()}/v2/orders/${donation.squarePaymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN?.trim()}`,
        Accept: "application/json",
        "Square-Version": "2024-12-18"
      },
      cache: "no-store"
    })

    const payload = await response.json()

    if (!response.ok) {
      logger.error({ donationId, payload }, "Square donation confirmation lookup failed")
      return NextResponse.json(
        {
          status: donation.status,
          confirmed: donation.status === "COMPLETED",
          squareLookupOk: false
        },
        { status: 200 }
      )
    }

    const orderState = payload?.order?.state as string | undefined

    if (orderState === "COMPLETED") {
      const result = await applyDonationPaymentStatus(donation.id, "COMPLETED")
      return NextResponse.json({
        status: result.status,
        confirmed: true,
        squareLookupOk: true,
        orderState
      })
    }

    if (orderState === "CANCELED") {
      const result = await applyDonationPaymentStatus(donation.id, "FAILED")
      return NextResponse.json({
        status: result.status,
        confirmed: false,
        squareLookupOk: true,
        orderState
      })
    }

    return NextResponse.json({
      status: donation.status,
      confirmed: donation.status === "COMPLETED",
      squareLookupOk: true,
      orderState: orderState || "UNKNOWN"
    })
  } catch (error) {
    logger.error({ err: error }, "Donation confirmation endpoint failed")
    return NextResponse.json({ error: "Failed to confirm donation" }, { status: 500 })
  }
}
