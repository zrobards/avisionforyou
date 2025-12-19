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

        console.log("Square: Token configured:", !!squareAccessToken)
        console.log("Square: Environment:", squareEnvironment)

        if (!squareAccessToken) {
          console.error("Square: Access token not configured")
          return NextResponse.json(
            { error: "Square is not properly configured. Please contact support." },
            { status: 500 }
          )
        }

        // Use correct API endpoint for payment links
        const apiUrl = squareEnvironment === 'production'
          ? 'https://connect.squareup.com'
          : 'https://connect.squareupsandbox.com'

        console.log("Square: Creating payment link at:", `${apiUrl}/v2/catalog/batch`)

        // First, create a catalog item for the donation
        const catalogResponse = await fetch(`${apiUrl}/v2/catalog/batch`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${squareAccessToken}`,
            'Content-Type': 'application/json',
            'Square-Version': '2024-01-18'
          },
          body: JSON.stringify({
            idempotency_key: `catalog-${donationSessionId}`,
            batches: [
              {
                objects: [
                  {
                    type: "ITEM",
                    id: `#${donationSessionId}`,
                    item_data: {
                      name: "A Vision For You Recovery - Donation",
                      description: `Donation from ${name}`,
                      variations: [
                        {
                          type: "ITEM_VARIATION",
                          id: "#0",
                          item_variation_data: {
                            item_id: `#${donationSessionId}`,
                            name: `$${amount}`,
                            pricing_type: "FIXED_PRICING",
                            price_money: {
                              amount: amountInCents,
                              currency: "USD"
                            }
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          })
        })

        const catalogData = await catalogResponse.json()
        console.log("Square: Catalog response status:", catalogResponse.status)

        if (!catalogResponse.ok) {
          console.error("Square: Catalog creation failed:", catalogData)
          // Fall back to using payment request instead
          console.log("Square: Falling back to payment requests endpoint")
          
          const paymentRequestResponse = await fetch(`${apiUrl}/v2/invoices`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${squareAccessToken}`,
              'Content-Type': 'application/json',
              'Square-Version': '2024-01-18'
            },
            body: JSON.stringify({
              idempotency_key: donationSessionId,
              invoice: {
                location_id: "REQUIRED", // You'll need to set a default location
                customer_id: "REQUIRED", // Or make it optional
                order: {
                  line_items: [
                    {
                      quantity: "1",
                      name: "A Vision For You Recovery - Donation",
                      base_price_money: {
                        amount: amountInCents,
                        currency: "USD"
                      }
                    }
                  ]
                },
                delivery_method: "EMAIL",
                invoice_number: `DONATION-${donation.id}`,
                title: "Donation",
                description: `Thank you for your donation of $${amount}`
              }
            })
          })

          const paymentRequestData = await paymentRequestResponse.json()
          console.log("Square: Payment request response:", paymentRequestResponse.status)

          if (!paymentRequestResponse.ok) {
            console.error("Square: Payment request failed:", paymentRequestData)
            return NextResponse.json(
              { error: `Failed to create payment link: ${paymentRequestData.errors?.[0]?.detail || 'Unknown error'}` },
              { status: 500 }
            )
          }

          console.log("Square: Payment request created:", paymentRequestData.invoice?.public_url)

          if (!paymentRequestData.invoice?.public_url) {
            console.error("Square: No payment URL in response")
            return NextResponse.json(
              { error: "Failed to create payment link" },
              { status: 500 }
            )
          }

          // Send confirmation email
          try {
            await sendDonationConfirmationEmail(
              donation.id,
              email,
              name,
              amount,
              frequency
            )
            console.log("Square: Confirmation email sent")
          } catch (emailError) {
            console.error("Square: Email failed (non-fatal):", emailError)
          }

          return NextResponse.json(
            {
              url: paymentRequestData.invoice.public_url,
              donationId: donation.id,
              success: true
            },
            { status: 200 }
          )
        }

        // Successfully created catalog item, now create payment link
        const objects = catalogData.objects || []
        if (objects.length === 0) {
          throw new Error("No catalog item created")
        }

        const itemId = objects[0].id
        console.log("Square: Catalog item created:", itemId)

        // Create payment link using the catalog item
        const linkResponse = await fetch(`${apiUrl}/v2/online-checkout-links`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${squareAccessToken}`,
            'Content-Type': 'application/json',
            'Square-Version': '2024-01-18'
          },
          body: JSON.stringify({
            idempotency_key: `link-${donationSessionId}`,
            checkout_options: {
              redirect_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/donation/confirm?id=${donation.id}&amount=${amount}`
            },
            pre_populated_data: {
              buyer_email: email
            },
            order: {
              reference_id: donation.id,
              line_items: [
                {
                  quantity: "1",
                  name: "A Vision For You Recovery - Donation",
                  base_price_money: {
                    amount: amountInCents,
                    currency: "USD"
                  }
                }
              ]
            }
          })
        })

        const linkData = await linkResponse.json()
        console.log("Square: Link response status:", linkResponse.status)

        if (!linkResponse.ok) {
          console.error("Square: Link creation failed:", linkData)
          return NextResponse.json(
            { error: `Failed to create payment link: ${linkData.errors?.[0]?.detail || 'Unknown error'}` },
            { status: 500 }
          )
        }

        console.log("Square: Payment link created:", linkData.checkout_link?.checkout_url)

        if (!linkData.checkout_link?.checkout_url) {
          console.error("Square: No checkout URL returned")
          return NextResponse.json(
            { error: "Failed to create payment link" },
            { status: 500 }
          )
        }

        // Send confirmation email
        try {
          await sendDonationConfirmationEmail(
            donation.id,
            email,
            name,
            amount,
            frequency
          )
          console.log("Square: Confirmation email sent")
        } catch (emailError) {
          console.error("Square: Email failed (non-fatal):", emailError)
        }

        return NextResponse.json(
          {
            url: linkData.checkout_link.checkout_url,
            donationId: donation.id,
            success: true
          },
          { status: 200 }
        )
      } catch (squareError: any) {
        console.error("Square: Payment link creation failed:", squareError.message)
        
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
