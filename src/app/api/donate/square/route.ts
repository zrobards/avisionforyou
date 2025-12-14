import { NextRequest, NextResponse } from "next/server"
import { checkoutApi, customersApi } from "@/lib/square"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
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
      } else {
        const createCustomerResult = await customersApi.createCustomer({
          emailAddress: email,
          givenName: name.split(" ")[0],
          familyName: name.split(" ").slice(1).join(" ") || "",
          note: `Donation via A Vision For You Recovery website`
        })
        customerId = createCustomerResult.result.customer?.id
      }
    } catch (err) {
      console.error("Error with customer management:", err)
      // Continue without customer ID if this fails
    }

    // Create payment link for one-time donations
    if (frequency === "ONE_TIME") {
      const checkoutResult = await checkoutApi.createPaymentLink({
        idempotencyKey,
        quickPay: {
          name: "A Vision For You Recovery - Donation",
          priceAmount: amountInCents,
          currency: "USD",
          description: "Support our recovery programs and community"
        },
        checkoutOptions: {
          askForShippingAddress: false,
          customFields: [
            {
              title: "Impact Message",
              placeholder: "Share why this cause matters to you (optional)"
            }
          ]
        },
        prePopulatedData: {
          buyerEmail: email
        }
      })

      if (!checkoutResult.result.paymentLink) {
        return NextResponse.json(
          { error: "Failed to create payment link" },
          { status: 500 }
        )
      }

      const paymentLink = checkoutResult.result.paymentLink

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

        return NextResponse.json({
          url: paymentLink.url,
          donationId: donation.id
        })
      } catch (dbError) {
        console.error("Database error:", dbError)
        return NextResponse.json(
          { error: "Donation created but failed to save record" },
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
  } catch (error) {
    console.error("Square checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
