import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      )
    }

    let event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      )
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    // Handle payment.intent.succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object
      
      // Save donation to database
      await db.donation.create({
        data: {
          stripeId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          status: "COMPLETED",
          frequency: "ONE_TIME",
          email: paymentIntent.receipt_email || paymentIntent.metadata?.email || "",
          comment: paymentIntent.metadata?.name || "Anonymous"
        }
      })
    }

    // Handle customer.subscription.updated
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object
      
      // Update recurring donation in database
      await db.donation.updateMany({
        where: {
          stripeId: subscription.id
        },
        data: {
          status: subscription.status === "active" ? "COMPLETED" : "CANCELLED"
        }
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
