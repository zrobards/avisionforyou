import { stripe } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, frequency, email, name } = await request.json()

    if (!amount || !frequency) {
      return NextResponse.json(
        { error: "Amount and frequency required" },
        { status: 400 }
      )
    }

    // Amount in cents
    const amountInCents = Math.round(amount * 100)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
                name: "A Vision For You Recovery - " + (frequency === "ONE_TIME" ? "One-Time" : "Monthly") + " Donation",
              description: "Support our recovery programs and community"
            },
            unit_amount: amountInCents,
            recurring: frequency !== "ONE_TIME" ? { interval: frequency === "MONTHLY" ? "month" : "year" } : undefined
          },
          quantity: 1
        }
      ],
      mode: frequency === "ONE_TIME" ? "payment" : "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/donate`,
      customer_email: email,
      metadata: {
        name: name,
        frequency: frequency
      }
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
