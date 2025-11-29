import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "invoice.finalized":
        await handleInvoiceFinalized(event.data.object as Stripe.Invoice);
        break;
      case "invoice.voided":
        await handleInvoiceVoided(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 * This fires when a Stripe Checkout session is completed (payment successful)
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    // Get invoice ID from session metadata
    const invoiceId = session.metadata?.invoiceId;
    
    if (!invoiceId) {
      console.log(`No invoice ID found in checkout session ${session.id}`);
      return;
    }

    // Find the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      console.log(`Invoice not found: ${invoiceId}`);
      return;
    }

    // Only update if payment was successful
    if (session.payment_status === "paid" && invoice.status !== "PAID") {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      console.log(`Invoice ${invoice.number} marked as paid via checkout session ${session.id}`);
    }
  } catch (error) {
    console.error("Error handling checkout session completed:", error);
    throw error;
  }
}

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(stripeInvoice: Stripe.Invoice) {
  try {
    // Find the invoice by Stripe invoice ID
    const invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id },
    });

    if (!invoice) {
      console.log(`Invoice not found for Stripe invoice ${stripeInvoice.id}`);
      return;
    }

    // Update invoice status
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "PAID",
        paidAt: new Date(stripeInvoice.status_transitions.paid_at! * 1000),
      },
    });

    // Create payment record
    if (stripeInvoice.charge && typeof stripeInvoice.charge === 'string') {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: stripeInvoice.amount_paid,
          status: "COMPLETED",
          method: "stripe",
          stripeChargeId: stripeInvoice.charge,
          stripePaymentId: stripeInvoice.payment_intent as string | null,
          processedAt: new Date(),
          currency: stripeInvoice.currency.toUpperCase(),
        },
      });
    }

    console.log(`Invoice ${invoice.number} marked as paid`);
  } catch (error) {
    console.error("Error handling invoice.paid:", error);
    throw error;
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(stripeInvoice: Stripe.Invoice) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id },
    });

    if (!invoice) {
      console.log(`Invoice not found for Stripe invoice ${stripeInvoice.id}`);
      return;
    }

    // Update invoice status to OVERDUE if past due date
    const isPastDue = new Date(invoice.dueDate) < new Date();
    if (isPastDue) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "OVERDUE" },
      });
    }

    console.log(`Invoice ${invoice.number} payment failed`);
  } catch (error) {
    console.error("Error handling invoice.payment_failed:", error);
    throw error;
  }
}

/**
 * Handle invoice.finalized event
 */
async function handleInvoiceFinalized(stripeInvoice: Stripe.Invoice) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id },
    });

    if (!invoice) {
      console.log(`Invoice not found for Stripe invoice ${stripeInvoice.id}`);
      return;
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    console.log(`Invoice ${invoice.number} finalized`);
  } catch (error) {
    console.error("Error handling invoice.finalized:", error);
    throw error;
  }
}

/**
 * Handle invoice.voided event
 */
async function handleInvoiceVoided(stripeInvoice: Stripe.Invoice) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id },
    });

    if (!invoice) {
      console.log(`Invoice not found for Stripe invoice ${stripeInvoice.id}`);
      return;
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "CANCELLED" },
    });

    console.log(`Invoice ${invoice.number} voided`);
  } catch (error) {
    console.error("Error handling invoice.voided:", error);
    throw error;
  }
}

/**
 * Handle subscription.created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const projectId = subscription.metadata?.projectId;
    if (!projectId) {
      console.log("No project ID in subscription metadata");
      return;
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        stripeSubscriptionId: subscription.id,
        maintenanceStatus: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        nextBillingDate: new Date(subscription.current_period_end * 1000),
      },
    });

    console.log(`Subscription ${subscription.id} created for project ${projectId}`);
  } catch (error) {
    console.error("Error handling subscription.created:", error);
    throw error;
  }
}

/**
 * Handle subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const project = await prisma.project.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!project) {
      console.log(`Project not found for subscription ${subscription.id}`);
      return;
    }

    await prisma.project.update({
      where: { id: project.id },
      data: {
        maintenanceStatus: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        nextBillingDate: new Date(subscription.current_period_end * 1000),
      },
    });

    console.log(`Subscription ${subscription.id} updated`);
  } catch (error) {
    console.error("Error handling subscription.updated:", error);
    throw error;
  }
}

/**
 * Handle subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const project = await prisma.project.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!project) {
      console.log(`Project not found for subscription ${subscription.id}`);
      return;
    }

    await prisma.project.update({
      where: { id: project.id },
      data: {
        maintenanceStatus: 'CANCELLED',
        stripeSubscriptionId: null,
      },
    });

    console.log(`Subscription ${subscription.id} deleted`);
  } catch (error) {
    console.error("Error handling subscription.deleted:", error);
    throw error;
  }
}
