import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendDonationConfirmationEmail } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"
import { Client, Environment } from "square"

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Initialize Square client
function getSquareClient() {
  return new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === "production" 
      ? Environment.Production 
      : Environment.Sandbox,
  })
}

// Calculate next renewal date based on start date and frequency
function getNextRenewalDate(startDate: Date, frequency: string): Date {
  const next = new Date(startDate)
  
  if (frequency === "MONTHLY") {
    next.setMonth(next.getMonth() + 1)
  } else if (frequency === "YEARLY") {
    next.setFullYear(next.getFullYear() + 1)
  }
  
  return next
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

    // Validate frequency
    if (!["ONE_TIME", "MONTHLY", "YEARLY"].includes(frequency)) {
      console.error("Square: Invalid frequency:", frequency)
      return NextResponse.json(
        { error: "Frequency must be ONE_TIME, MONTHLY, or YEARLY" },
        { status: 400 }
      )
    }

    // Amount in cents
    const amountInCents = Math.round(amount * 100)
    
    // Generate a unique donation ID
    const donationSessionId = uuidv4()
    const now = new Date()
    const nextRenewalDate = frequency !== "ONE_TIME" ? getNextRenewalDate(now, frequency) : null
    
    try {
      console.log("Square: Creating donation record for", { amount, frequency, email, name })
      
      // Save donation record to database first
      const donation = await db.donation.create({
        data: {
          amount,
          frequency: frequency as "ONE_TIME" | "MONTHLY" | "YEARLY",
          email,
          name,
          status: "PENDING",
          squarePaymentId: donationSessionId,
          nextRenewalDate: nextRenewalDate,
          recurringStartDate: frequency !== "ONE_TIME" ? now : null,
          renewalSchedule: "anniversary"
        }
      })

      console.log("Square: Saved donation record:", donation.id)

      // Create Square Payment Link
      try {
        const client = getSquareClient()
        const checkoutApi = client.checkoutApi

        console.log("Square: Creating payment link for", { frequency, amount: amountInCents })

        const paymentLink = await checkoutApi.createPaymentLink({
          idempotencyKey: donationSessionId,
          description: `${frequency === "ONE_TIME" ? "One-time" : frequency === "MONTHLY" ? "Monthly" : "Annual"} donation to A Vision For You Recovery`,
          quickPay: {
            name: `A Vision For You Recovery - ${frequency === "ONE_TIME" ? "One-Time" : frequency === "MONTHLY" ? "Monthly" : "Annual"} Donation`,
            priceAmount: amountInCents,
            currencyCode: "USD"
          },
          redirectUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/donation/confirm?id=${donation.id}&amount=${amount}`,
          note: `Donation from ${name} (${email}) - ${frequency}`,
          customFields: [
            {
              title: "Donor Email",
              value: email
            },
            {
              title: "Donation Type",
              value: frequency
            },
            {
              title: "Donation ID",
              value: donation.id
            }
          ]
        })

        console.log("Square: Payment link created successfully:", paymentLink.paymentLink?.url)

        if (!paymentLink.paymentLink?.url) {
          throw new Error("Payment link URL not returned from Square")
        }

        // Send confirmation email
        console.log("Square: Attempting to send confirmation email to:", email)
        try {
          const emailSent = await sendDonationConfirmationEmail(
            donation.id,
            email,
            name,
            amount,
            frequency as "ONE_TIME" | "MONTHLY" | "YEARLY"
          )
          if (emailSent) {
            console.log("Square: ✅ Confirmation email sent successfully to", email)
          } else {
            console.log("Square: ⚠️ Email function returned false for", email)
          }
        } catch (emailError) {
          console.error("Square: ❌ Failed to send email, but donation saved:", emailError)
          // Don't fail the donation if email fails
        }

        // Return the Square payment link
        return NextResponse.json(
          {
            url: paymentLink.paymentLink.url,
            donationId: donation.id,
            success: true,
            isRecurring: frequency !== "ONE_TIME",
            nextRenewalDate: nextRenewalDate
          },
          { status: 200 }
        )
      } catch (squareError: any) {
        console.error("Square: Payment link creation failed:", squareError)
        
        // Check if it's a credentials issue
        if (squareError.message?.includes('401') || squareError.message?.includes('Unauthorized')) {
          return NextResponse.json(
            { error: "Square credentials invalid. Please check your Square setup." },
            { status: 500 }
          )
        }

        return NextResponse.json(
          { error: `Failed to create payment link: ${squareError.message}` },
          { status: 500 }
        )
      }
    } catch (dbError) {
      console.error("Square: Database error:", dbError)
      return NextResponse.json(
        { error: "Failed to save donation. Please try again." },
        { status: 500 }
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
