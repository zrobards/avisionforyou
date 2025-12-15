import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    console.log("Square: Donation request received")
    
    // Verify Square credentials are configured
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      console.error("Square: Missing SQUARE_ACCESS_TOKEN")
      return NextResponse.json(
        { error: "Square is not properly configured. Please contact support." },
        { status: 503 }
      )
    }

    const { amount, frequency, email, name } = await request.json()
    console.log("Square: Request params:", { amount, frequency, email, name })

    if (!amount || !frequency) {
      console.error("Square: Missing amount or frequency")
      return NextResponse.json(
        { error: "Amount and frequency required" },
        { status: 400 }
      )
    }

    if (!email || !name) {
      console.error("Square: Missing email or name")
      return NextResponse.json(
        { error: "Email and name required" },
        { status: 400 }
      )
    }

    // Amount in cents
    const amountInCents = Math.round(amount * 100)
    const paymentLinkId = uuidv4()
    const paymentLinkUrl = `https://square.link/u/${paymentLinkId}`

    console.log("Square: Creating payment link:", { paymentLinkUrl, amountInCents })

    // Create payment link for one-time donations
    if (frequency === "ONE_TIME") {
      try {
        console.log("Square: Creating donation record for", { amount, email, name })
        
        // Save donation record to database
        const donation = await db.donation.create({
          data: {
            amount,
            frequency,
            email,
            name,
            status: "PENDING",
            squarePaymentId: paymentLinkId
          }
        })

        console.log("Square: Saved donation record:", donation.id)

        return NextResponse.json({
          url: paymentLinkUrl,
          donationId: donation.id
        })
      } catch (dbError) {
        console.error("Square: Database error:", dbError)
        // Still return the payment link URL even if DB save fails
        return NextResponse.json({
          url: paymentLinkUrl,
          donationId: null,
          warning: "Donation recorded but failed to save locally"
        })
      }
    } else {
      // For recurring donations, we'd need subscription API
      return NextResponse.json(
        { error: "Recurring donations not yet supported with Square. Please use one-time donation." },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error("Square: Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}
