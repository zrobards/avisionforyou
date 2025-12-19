import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendDonationConfirmationEmail } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    console.log("Square: Donation request received")
    console.log("Square: ENV check - TOKEN exists:", !!process.env.SQUARE_ACCESS_TOKEN)
    console.log("Square: ENV check - ENVIRONMENT:", process.env.SQUARE_ENVIRONMENT)

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

    // Check if recurring donation is supported
    if (frequency !== "ONE_TIME") {
      console.error("Square: Recurring donations not supported yet")
      return NextResponse.json(
        { error: "Recurring donations not yet supported. Please use one-time donation." },
        { status: 400 }
      )
    }

    // Amount in cents
    const amountInCents = Math.round(amount * 100)
    
    // Generate a unique donation ID
    const donationSessionId = uuidv4()
    
    try {
      console.log("Square: Creating donation record for", { amount, email, name })
      
      // Save donation record to database first
      const donation = await db.donation.create({
        data: {
          amount,
          frequency,
          email,
          name,
          status: "PENDING",
          squarePaymentId: donationSessionId
        }
      })

      console.log("Square: Saved donation record:", donation.id)

      // Create Square Payment Link via API
      try {
        const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
        const squareEnvironment = process.env.SQUARE_ENVIRONMENT || 'sandbox'

        console.log("Square: DEBUG - Token:", squareAccessToken ? `***${squareAccessToken.slice(-10)}` : 'MISSING')
        console.log("Square: DEBUG - Environment:", squareEnvironment)

        if (!squareAccessToken) {
          console.error("Square: Access token not configured")
          return NextResponse.json(
            { error: "Square is not properly configured. Please contact support." },
            { status: 500 }
          )
        }

        const apiUrl = squareEnvironment === 'production'
          ? 'https://connect.squareup.com'
          : 'https://connect.squareupsandbox.com'

        console.log("Square: Creating payment link with:", { amount, email, name, apiUrl })

        const paymentLinkResponse = await fetch(`${apiUrl}/v2/online-checkout-links`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${squareAccessToken}`,
            'Content-Type': 'application/json',
            'Square-Version': '2024-12-18'
          },
          body: JSON.stringify({
            idempotency_key: donationSessionId,
            quick_pay: {
              name: `Donation - A Vision For You Recovery`,
              price_money: {
                amount: amountInCents,
                currency: 'USD'
              }
            },
            redirect_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/donation/confirm?id=${donation.id}&amount=${amount}`,
            note: `Donation from ${name} (${email})`
          })
        })

        const paymentLinkData = await paymentLinkResponse.json()

        console.log("Square: Payment link response status:", paymentLinkResponse.status)
        console.log("Square: Payment link response:", JSON.stringify(paymentLinkData).substring(0, 200))

        if (!paymentLinkResponse.ok) {
          console.error("Square: Payment link creation error:", paymentLinkData)
          return NextResponse.json(
            { error: `Failed to create payment link: ${paymentLinkData.errors?.[0]?.detail || 'Unknown error'}` },
            { status: 500 }
          )
        }

        console.log("Square: Payment link created successfully:", paymentLinkData.online_checkout_link?.checkout_page_url)

        if (!paymentLinkData.online_checkout_link?.checkout_page_url) {
          console.error("Square: No checkout URL in response:", paymentLinkData)
          return NextResponse.json(
            { error: "Failed to create payment link" },
            { status: 500 }
          )
        }

        // Send confirmation email
        console.log("Square: Attempting to send confirmation email to:", email)
        try {
          const emailSent = await sendDonationConfirmationEmail(
            donation.id,
            email,
            name,
            amount,
            frequency
          )
          if (emailSent) {
            console.log("Square: ✅ Confirmation email sent successfully to", email)
          } else {
            console.log("Square: ⚠️ Email function returned false for", email)
          }
        } catch (emailError) {
          console.error("Square: ❌ Failed to send email, but donation saved:", emailError)
        }

        // Return the Square payment link
        return NextResponse.json(
          {
            url: paymentLinkData.online_checkout_link.checkout_page_url,
            donationId: donation.id,
            success: true
          },
          { status: 200 }
        )
      } catch (squareError: any) {
        console.error("Square: Payment link creation failed:", squareError)
        
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
