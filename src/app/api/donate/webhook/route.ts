import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { sendDonationThankYou } from "@/lib/email"
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
      
      const email = paymentIntent.receipt_email || paymentIntent.metadata?.email || ""
      const name = paymentIntent.metadata?.name || "Anonymous"
      const amount = paymentIntent.amount / 100
      const frequency = paymentIntent.metadata?.frequency || "ONE_TIME"
      
      // Save donation to database
      await db.donation.create({
        data: {
          stripeId: paymentIntent.id,
          amount: amount,
          status: "COMPLETED",
          frequency: frequency,
          email: email,
          comment: name
        }
      })
      
      // Send thank you email
      if (email && email !== "") {
        await sendDonationThankYou(name, email, amount, frequency)
      }
    }

    // Handle checkout.session.completed for subscriptions
    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      
      if (session.mode === "subscription") {
        const email = session.customer_email || session.metadata?.email || ""
        const name = session.metadata?.name || "Anonymous"
        
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const amount = subscription.items.data[0].price.unit_amount! / 100
        const interval = subscription.items.data[0].price.recurring?.interval || "month"
        const frequency = interval === "month" ? "MONTHLY" : "YEARLY"
        
        // Save recurring donation
        await db.donation.create({
          data: {
            stripeId: subscription.id,
            amount: amount,
            status: "COMPLETED",
            frequency: frequency,
            email: email,
            comment: name
          }
        })
        
        // Send thank you email
        if (email && email !== "") {
          await sendDonationThankYou(name, email, amount, frequency)
        }
      }
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
