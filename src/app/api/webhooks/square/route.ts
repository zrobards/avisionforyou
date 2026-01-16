import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import crypto from "crypto"

/**
 * Square Webhook Handler
 * 
 * Receives real-time payment events from Square and updates donation status
 * Events: payment.created, payment.completed, payment.updated, invoice.payment_pending, etc.
 */

async function verifySquareWebhookSignature(
  body: string,
  signatureHeader: string
): Promise<boolean> {
  // Get webhook signing key from environment
  const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  
  if (!webhookSignatureKey) {
    console.error("Square Webhook: SQUARE_WEBHOOK_SIGNATURE_KEY not configured")
    return false
  }

  // Compute HMAC-SHA256 signature
  const hash = crypto
    .createHmac("sha256", webhookSignatureKey)
    .update(body)
    .digest("base64")

  // Compare with provided signature (constant-time comparison to prevent timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(signatureHeader)
  ).valueOf()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signatureHeader = request.headers.get("x-square-hmac-sha256-signature") || ""
    
    // Verify webhook signature
    const isValid = await verifySquareWebhookSignature(body, signatureHeader)
    
    if (!isValid) {
      console.error("Square Webhook: Invalid signature")
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    
    console.log("Square Webhook: Event received", {
      type: event.type,
      eventId: event.id,
      timestamp: event.created_at
    })

    // Log webhook for audit trail
    await db.webhookLog.create({
      data: {
        provider: "square",
        eventType: event.type,
        eventId: event.id,
        data: event,
        status: "processed"
      }
    })

    // Handle different event types
    switch (event.type) {
      case "payment.created":
      case "payment.completed":
      case "payment.updated": {
        return handlePaymentEvent(event)
      }

      case "invoice.payment_pending":
      case "invoice.payment_received": {
        return handleInvoiceEvent(event)
      }

      case "subscription.created":
      case "subscription.updated": {
        return handleSubscriptionEvent(event)
      }

      case "subscription.deleted": {
        return handleSubscriptionCancelled(event)
      }

      default: {
        console.log("Square Webhook: Unhandled event type:", event.type)
        return NextResponse.json({ received: true }, { status: 200 })
      }
    }
  } catch (error: any) {
    console.error("Square Webhook: Error processing event:", error)
    
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    )
  }
}

async function handlePaymentEvent(event: any) {
  try {
    const payment = event.data?.object?.payment
    
    if (!payment) {
      console.warn("Square Webhook: No payment data in event")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    console.log("Square Webhook: Payment event", {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount_money?.amount
    })

    // Find donation by Square payment ID
    const donation = await db.donation.findFirst({
      where: {
        squarePaymentId: payment.id
      }
    })

    if (!donation) {
      console.warn("Square Webhook: No donation found for payment", payment.id)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Update donation status based on payment status
    let newStatus = donation.status
    
    if (payment.status === "COMPLETED") {
      newStatus = "COMPLETED"
      console.log("Square Webhook: Payment completed for donation", donation.id)
    } else if (payment.status === "APPROVED") {
      newStatus = "COMPLETED"
      console.log("Square Webhook: Payment approved for donation", donation.id)
    } else if (payment.status === "PENDING") {
      newStatus = "PENDING"
    } else if (payment.status === "CANCELED" || payment.status === "FAILED") {
      newStatus = "FAILED"
      console.warn("Square Webhook: Payment failed for donation", donation.id)
    }

    // Update donation in database
    await db.donation.update({
      where: { id: donation.id },
      data: {
        status: newStatus as "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
      }
    })

    console.log("Square Webhook: Updated donation status to", newStatus)

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("Square Webhook: Error handling payment event:", error)
    throw error
  }
}

async function handleInvoiceEvent(event: any) {
  try {
    const invoice = event.data?.object?.invoice
    
    if (!invoice) {
      console.warn("Square Webhook: No invoice data in event")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    console.log("Square Webhook: Invoice event", {
      invoiceId: invoice.id,
      status: invoice.status
    })

    // Find donation by order ID or custom field
    const donationId = invoice.custom_fields?.find(
      (field: any) => field.label === "Donation ID"
    )?.value

    if (!donationId) {
      console.warn("Square Webhook: No donation ID found in invoice")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const donation = await db.donation.findUnique({
      where: { id: donationId }
    })

    if (!donation) {
      console.warn("Square Webhook: No donation found for invoice", donationId)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Update status based on invoice status
    let newStatus = donation.status
    
    if (invoice.status === "PAID") {
      newStatus = "COMPLETED"
      console.log("Square Webhook: Invoice paid for donation", donation.id)
    } else if (invoice.status === "PAYMENT_PENDING") {
      newStatus = "PENDING"
    } else if (invoice.status === "OVERDUE" || invoice.status === "CANCELED") {
      newStatus = "FAILED"
    }

    await db.donation.update({
      where: { id: donation.id },
      data: { status: newStatus as "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" }
    })

    console.log("Square Webhook: Updated donation status from invoice to", newStatus)

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("Square Webhook: Error handling invoice event:", error)
    throw error
  }
}

async function handleSubscriptionEvent(event: any) {
  try {
    const subscription = event.data?.object?.subscription
    
    if (!subscription) {
      console.warn("Square Webhook: No subscription data in event")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    console.log("Square Webhook: Subscription event", {
      subscriptionId: subscription.id,
      status: subscription.status
    })

    // Find donation by Square subscription ID
    const donation = await db.donation.findFirst({
      where: {
        squareSubscriptionId: subscription.id
      }
    })

    if (!donation) {
      console.warn("Square Webhook: No donation found for subscription", subscription.id)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Update subscription fields
    const updates: any = {}
    
    if (subscription.status === "ACTIVE") {
      updates.status = "COMPLETED"
    } else if (subscription.status === "CANCELED") {
      updates.status = "CANCELLED"
      updates.cancelledAt = new Date()
    }

    if (subscription.billing_anchor_date) {
      // Calculate next renewal date based on subscription
      updates.nextRenewalDate = new Date(subscription.billing_anchor_date)
    }

    await db.donation.update({
      where: { id: donation.id },
      data: updates
    })

    console.log("Square Webhook: Updated recurring donation", {
      donationId: donation.id,
      newStatus: updates.status
    })

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("Square Webhook: Error handling subscription event:", error)
    throw error
  }
}

async function handleSubscriptionCancelled(event: any) {
  try {
    const subscription = event.data?.object?.subscription
    
    if (!subscription) {
      console.warn("Square Webhook: No subscription data in cancellation event")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const donation = await db.donation.findFirst({
      where: {
        squareSubscriptionId: subscription.id
      }
    })

    if (!donation) {
      console.warn("Square Webhook: No donation found for subscription cancellation", subscription.id)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    await db.donation.update({
      where: { id: donation.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date()
      }
    })

    console.log("Square Webhook: Subscription cancelled for donation", donation.id)

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("Square Webhook: Error handling subscription cancellation:", error)
    throw error
  }
}
