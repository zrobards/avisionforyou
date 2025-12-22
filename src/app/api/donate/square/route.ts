import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendDonationConfirmationEmail } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"

// Get Square API base URL
function getSquareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com"
}

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Get Square Location ID from environment
function getSquareLocationId() {
  const locationId = process.env.SQUARE_LOCATION_ID
  if (!locationId) {
    throw new Error("SQUARE_LOCATION_ID environment variable is required. Please set it in Vercel.")
  }
  console.log("Square: Using location ID:", locationId)
  return locationId
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

      // Create Square Payment Link via HTTP API
      try {
        console.log("Square: Creating payment link for", { frequency, amount: amountInCents })

        // Get location ID
        const locationId = getSquareLocationId()
        console.log("Square: Location ID retrieved:", locationId)

        // First create an order
        const orderBody = {
          idempotencyKey: donationSessionId,
          order: {
            locationId: locationId,
            lineItems: [
              {
                name: `A Vision For You Recovery - ${frequency === "ONE_TIME" ? "One-Time" : frequency === "MONTHLY" ? "Monthly" : "Annual"} Donation`,
                quantity: "1",
                catalogObjectId: undefined,
                basePriceMoney: {
                  amount: amountInCents,
                  currency: "USD"
                },
                grossSalesMoney: {
                  amount: amountInCents,
                  currency: "USD"
                },
                totalTaxMoney: {
                  amount: 0,
                  currency: "USD"
                },
                totalDiscountMoney: {
                  amount: 0,
                  currency: "USD"
                },
                totalMoney: {
                  amount: amountInCents,
                  currency: "USD"
                }
              }
            ]
          }
        }

        console.log("Square: Order body being sent:", JSON.stringify(orderBody, null, 2))

        const orderResponse = await fetch(`${getSquareBaseUrl()}/v2/orders`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
            "Square-Version": "2024-12-18"
          },
          body: JSON.stringify(orderBody)
        })

        console.log("Square: Order API response status:", orderResponse.status)

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json()
          console.log("Square: Order API error details:", JSON.stringify(errorData, null, 2))
          throw new Error(`Failed to create order: ${orderResponse.status} - ${JSON.stringify(errorData)}`)
        }

        const orderData = await orderResponse.json()
        const orderId = orderData.order.id

        // Now create a checkout link from the order
        const checkoutBody = {
          idempotencyKey: `${donationSessionId}-checkout`,
          order: {
            id: orderId
          },
          redirectUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/donation/confirm?id=${donation.id}&amount=${amount}`,
          askForShippingAddress: false
        }

        const response = await fetch(`${getSquareBaseUrl()}/v2/checkouts`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
            "Square-Version": "2024-12-18"
          },
          body: JSON.stringify(checkoutBody)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Square API error: ${response.status} - ${JSON.stringify(errorData)}`)
        }

        const checkout = await response.json()

        console.log("Square: Checkout created successfully:", checkout.checkout?.checkout_page_url)

        if (!checkout.checkout?.checkout_page_url) {
          throw new Error("Checkout URL not returned from Square")
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

        // Return the checkout URL
        return NextResponse.json(
          {
            url: checkout.checkout.checkout_page_url,
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
