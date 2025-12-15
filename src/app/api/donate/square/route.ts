import { NextRequest, NextResponse } from "next/server"
import { getCheckoutApi, getCustomersApi } from "@/lib/square"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    // Verify Square credentials are configured
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      console.error("Square: Missing SQUARE_ACCESS_TOKEN")
      return NextResponse.json(
        { error: "Square is not properly configured. Please contact support." },
        { status: 503 }
      )
    }

    const { amount, frequency, email, name } = await request.json()

    if (!amount || !frequency) {
      return NextResponse.json(
        { error: "Amount and frequency required" },
        { status: 400 }
      )
    }

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name required" },
        { status: 400 }
      )
    }

    // Amount in cents
    const amountInCents = Math.round(amount * 100)
    const idempotencyKey = uuidv4()

    const customersApi = getCustomersApi()
    const checkoutApi = getCheckoutApi()

    // Create or get customer
    let customerId: string | undefined
    try {
      const customerResult = await customersApi.searchCustomers({
        query: {
          filter: {
            emailAddress: {
              exact: email
            }
          }
        }
      })

      if (
        customerResult.result.customers &&
        customerResult.result.customers.length > 0
      ) {
        customerId = customerResult.result.customers[0].id
        console.log("Square: Found existing customer:", customerId)
      } else {
        const createCustomerResult = await customersApi.createCustomer({
          emailAddress: email,
          givenName: name.split(" ")[0],
          familyName: name.split(" ").slice(1).join(" ") || "",
          note: `Donation via A Vision For You Recovery website`
        })
        customerId = createCustomerResult.result.customer?.id
        console.log("Square: Created new customer:", customerId)
      }
    } catch (err) {
      console.error("Square: Error with customer management:", err)
      // Continue without customer ID if this fails
    }

    // Create payment link for one-time donations
    if (frequency === "ONE_TIME") {
      try {
        console.log("Square: Creating payment link for", { amountInCents, email, name })
        
        const checkoutResult = await checkoutApi.createPaymentLink({
          idempotencyKey,
          quickPay: {
            name: "A Vision For You Recovery - Donation",
            priceAmount: amountInCents,
            currency: "USD",
            description: "Support our recovery programs and community"
          },
          checkoutOptions: {
            askForShippingAddress: false
          },
          prePopulatedData: {
            buyerEmail: email
          }
        })

        if (!checkoutResult.result.paymentLink) {
          console.error("Square: No payment link in response:", checkoutResult.result)
          return NextResponse.json(
            { error: "Failed to create payment link" },
            { status: 500 }
          )
        }

        const paymentLink = checkoutResult.result.paymentLink
        console.log("Square: Created payment link:", paymentLink.id)

        // Save donation record to database
        try {
          const donation = await db.donation.create({
            data: {
              amount,
              frequency,
              email,
              name,
              status: "PENDING",
              squarePaymentId: paymentLink.id
            }
          })

          console.log("Square: Saved donation record:", donation.id)

          return NextResponse.json({
            url: paymentLink.url,
            donationId: donation.id
          })
        } catch (dbError) {
          console.error("Square: Database error:", dbError)
          // Still return the payment link URL even if DB save fails
          return NextResponse.json({
            url: paymentLink.url,
            donationId: null,
            warning: "Donation recorded but failed to save locally"
          })
        }
      } catch (squareError: any) {
        console.error("Square: Checkout API error:", {
          message: squareError.message,
          errors: squareError.errors,
          statusCode: squareError.statusCode
        })
        
        // Provide helpful error messages
        if (squareError.statusCode === 401 || squareError.statusCode === 403) {
          return NextResponse.json(
            { error: "Square credentials are invalid. Please contact support." },
            { status: 503 }
          )
        }

        return NextResponse.json(
          { error: squareError.message || "Failed to create payment link" },
          { status: 500 }
        )
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
