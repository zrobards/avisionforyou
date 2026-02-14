import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"
import crypto from "crypto"
import { escapeHtml } from "@/lib/sanitize"
import type { Prisma } from "@prisma/client"
import type { SquareWebhookEvent, SquarePaymentObject, SquareInvoiceObject, SquareSubscriptionObject } from "@/types/square"

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
    logger.error("Square Webhook: SQUARE_WEBHOOK_SIGNATURE_KEY not configured")
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
      logger.error("Square Webhook: Invalid signature")
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      )
    }

    const event: SquareWebhookEvent = JSON.parse(body)

    logger.info({ type: event.type, eventId: event.event_id, timestamp: event.created_at }, "Square Webhook: Event received")

    // Idempotency check — skip if we've already processed this event
    const existingLog = await db.webhookLog.findFirst({
      where: { eventId: event.id, provider: "square" }
    })
    if (existingLog) {
      logger.info({ eventId: event.id }, "Square Webhook: Duplicate event, skipping")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Log webhook for audit trail
    await db.webhookLog.create({
      data: {
        provider: "square",
        eventType: event.type,
        eventId: event.id,
        data: JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue,
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
        logger.info({ eventType: event.type }, "Square Webhook: Unhandled event type")
        return NextResponse.json({ received: true }, { status: 200 })
      }
    }
  } catch (error: unknown) {
    logger.error({ err: error }, "Square Webhook: Error processing event")

    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    )
  }
}

async function handlePaymentEvent(event: SquareWebhookEvent) {
  try {
    const payment = (event.data?.object as SquarePaymentObject)?.payment

    if (!payment) {
      logger.warn("Square Webhook: No payment data in event")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    logger.info({ paymentId: payment.id, status: payment.status, amount: payment.amount_money?.amount, orderId: payment.order_id }, "Square Webhook: Payment event")

    // Find donation by Square payment ID
    const donation = await db.donation.findFirst({
      where: {
        squarePaymentId: payment.id
      }
    })

    // Also check for DUI registration by order ID (we store order ID in paymentId initially)
    const duiRegistration = payment.order_id
      ? await db.dUIRegistration.findFirst({
          where: {
            paymentId: payment.order_id
          }
        })
      : await db.dUIRegistration.findFirst({
          where: {
            paymentId: payment.id
          }
        })

    // Determine payment status
    let paymentStatus: "PENDING" | "COMPLETED" | "FAILED" = "PENDING"

    if (payment.status === "COMPLETED" || payment.status === "APPROVED") {
      paymentStatus = "COMPLETED"
    } else if (payment.status === "CANCELED" || payment.status === "FAILED") {
      paymentStatus = "FAILED"
    }

    // Update donation and/or DUI registration in a transaction
    await db.$transaction(async (tx) => {
      if (donation) {
        let newStatus = donation.status

        if (payment.status === "COMPLETED" || payment.status === "APPROVED") {
          newStatus = "COMPLETED"
          logger.info({ donationId: donation.id }, "Square Webhook: Payment completed for donation")
        } else if (payment.status === "PENDING") {
          newStatus = "PENDING"
        } else if (payment.status === "CANCELED" || payment.status === "FAILED") {
          newStatus = "FAILED"
          logger.warn({ donationId: donation.id }, "Square Webhook: Payment failed for donation")
        }

        await tx.donation.update({
          where: { id: donation.id },
          data: {
            status: newStatus as "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
          }
        })

        logger.info({ donationId: donation.id, newStatus }, "Square Webhook: Updated donation status")
      }

      if (duiRegistration) {
        const updateData: {
          paymentStatus: "PENDING" | "COMPLETED" | "FAILED"
          paymentId: string
          status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "ATTENDED" | "NO_SHOW"
        } = {
          paymentStatus: paymentStatus,
          paymentId: payment.id,
        }

        if (paymentStatus === "COMPLETED") {
          updateData.status = "CONFIRMED"
          logger.info({ registrationId: duiRegistration.id }, "Square Webhook: Payment completed for DUI registration")
        } else if (paymentStatus === "FAILED") {
          logger.warn({ registrationId: duiRegistration.id }, "Square Webhook: Payment failed for DUI registration")
        }

        await tx.dUIRegistration.update({
          where: { id: duiRegistration.id },
          data: updateData
        })

        logger.info({ registrationId: duiRegistration.id, paymentStatus }, "Square Webhook: Updated DUI registration status")
      }
    })

    // Send confirmation email for completed DUI payments
    if (paymentStatus === "COMPLETED" && duiRegistration?.email) {
      try {
        const { sendEmail } = await import("@/lib/email")
        await sendEmail({
          to: duiRegistration.email,
          subject: "DUI Class Registration Confirmed - A Vision For You",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #7f3d8b; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Registration Confirmed</h1>
              </div>
              <div style="background-color: #f9fafb; padding: 30px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Hi ${escapeHtml(duiRegistration.firstName || "there")},
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Your payment has been received and your DUI class registration is confirmed.
                </p>
                <div style="background-color: white; border-left: 4px solid #7f3d8b; padding: 20px; margin: 25px 0; border-radius: 4px;">
                  <p style="color: #374151; margin: 0;"><strong>Registration ID:</strong> ${duiRegistration.id}</p>
                </div>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  We will contact you with class details and scheduling information. If you have questions, call us at
                  <a href="tel:+15027496344" style="color: #7f3d8b;">(502) 749-6344</a>.
                </p>
              </div>
              <div style="background-color: #e5e7eb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  A Vision For You | 1675 Story Ave, Louisville, KY 40206
                </p>
              </div>
            </div>
          `,
        })
        logger.info({ email: duiRegistration.email }, "Square Webhook: Sent DUI confirmation email")
      } catch (emailError: unknown) {
        logger.error({ err: emailError }, "Square Webhook: Failed to send DUI confirmation email")
      }
    }

    // If neither found, log warning but don't fail
    if (!donation && !duiRegistration) {
      logger.warn({ paymentId: payment.id }, "Square Webhook: No donation or DUI registration found for payment")
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: unknown) {
    logger.error({ err: error }, "Square Webhook: Error handling payment event")
    throw error
  }
}

async function handleInvoiceEvent(event: SquareWebhookEvent) {
  try {
    const invoice = (event.data?.object as SquareInvoiceObject)?.invoice

    if (!invoice) {
      logger.warn("Square Webhook: No invoice data in event")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    logger.info({ invoiceId: invoice.id, status: invoice.status }, "Square Webhook: Invoice event")

    // Find donation by order ID or custom field
    const donationId = invoice.custom_fields?.find(
      (field) => field.label === "Donation ID"
    )?.value

    if (!donationId) {
      logger.warn("Square Webhook: No donation ID found in invoice")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const donation = await db.donation.findUnique({
      where: { id: donationId }
    })

    if (!donation) {
      logger.warn({ donationId }, "Square Webhook: No donation found for invoice")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Update status based on invoice status
    let newStatus = donation.status

    if (invoice.status === "PAID") {
      newStatus = "COMPLETED"
      logger.info({ donationId: donation.id }, "Square Webhook: Invoice paid for donation")
    } else if (invoice.status === "PAYMENT_PENDING") {
      newStatus = "PENDING"
    } else if (invoice.status === "OVERDUE" || invoice.status === "CANCELED") {
      newStatus = "FAILED"
    }

    await db.donation.update({
      where: { id: donation.id },
      data: { status: newStatus as "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" }
    })

    logger.info({ donationId: donation.id, newStatus }, "Square Webhook: Updated donation status from invoice")

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: unknown) {
    logger.error({ err: error }, "Square Webhook: Error handling invoice event")
    throw error
  }
}

async function handleSubscriptionEvent(event: SquareWebhookEvent) {
  try {
    const subscription = (event.data?.object as SquareSubscriptionObject)?.subscription

    if (!subscription) {
      logger.warn("Square Webhook: No subscription data in event")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    logger.info({ subscriptionId: subscription.id, status: subscription.status }, "Square Webhook: Subscription event")

    // Find donation by Square subscription ID
    const donation = await db.donation.findFirst({
      where: {
        squareSubscriptionId: subscription.id
      }
    })

    if (!donation) {
      logger.warn({ subscriptionId: subscription.id }, "Square Webhook: No donation found for subscription")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Update subscription fields
    const updates: {
      status?: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
      cancelledAt?: Date
      nextRenewalDate?: Date
    } = {}

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

    logger.info({ donationId: donation.id, newStatus: updates.status }, "Square Webhook: Updated recurring donation")

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: unknown) {
    logger.error({ err: error }, "Square Webhook: Error handling subscription event")
    throw error
  }
}

async function handleSubscriptionCancelled(event: SquareWebhookEvent) {
  try {
    const subscription = (event.data?.object as SquareSubscriptionObject)?.subscription

    if (!subscription) {
      logger.warn("Square Webhook: No subscription data in cancellation event")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const donation = await db.donation.findFirst({
      where: {
        squareSubscriptionId: subscription.id
      }
    })

    if (!donation) {
      logger.warn({ subscriptionId: subscription.id }, "Square Webhook: No donation found for subscription cancellation")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    await db.donation.update({
      where: { id: donation.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date()
      }
    })

    logger.info({ donationId: donation.id }, "Square Webhook: Subscription cancelled for donation")

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: unknown) {
    logger.error({ err: error }, "Square Webhook: Error handling subscription cancellation")
    throw error
  }
}
