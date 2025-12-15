import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    console.log("Square: Donation request received")

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

    // Validate email format
    if (!isValidEmail(email)) {
      console.error("Square: Invalid email format:", email)
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    // Validate name
    if (typeof name !== 'string' || name.trim().length < 2) {
      console.error("Square: Invalid name")
      return NextResponse.json(
        { error: "Please enter a valid name" },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount < 1 || amount > 1000000) {
      console.error("Square: Invalid amount:", amount)
      return NextResponse.json(
        { error: "Amount must be between $1 and $1,000,000" },
        { status: 400 }
      )
    }

    // Amount in cents
    const amountInCents = Math.round(amount * 100)
    
    // Generate a unique payment session ID
    const paymentSessionId = uuidv4()
    
    // Create a mock Square payment link
    // In production, this would integrate with Square's Payment Links API
    const paymentLinkUrl = `https://square.link/u/${paymentSessionId}`

    console.log("Square: Creating payment session:", { paymentLinkUrl, amountInCents, name, email })

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
            squarePaymentId: paymentSessionId
          }
        })

        console.log("Square: Saved donation record:", donation.id)

        return NextResponse.json(
          {
            url: paymentLinkUrl,
            donationId: donation.id,
            success: true
          },
          { status: 200 }
        )
      } catch (dbError) {
        console.error("Square: Database error:", dbError)
        // Still return the payment link URL even if DB save fails
        return NextResponse.json(
          {
            url: paymentLinkUrl,
            donationId: null,
            warning: "Donation recorded but failed to save locally",
            success: true
          },
          { status: 200 }
        )
      }
    } else {
      // For recurring donations, we'd need subscription API
      console.error("Square: Recurring donations not supported yet")
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
