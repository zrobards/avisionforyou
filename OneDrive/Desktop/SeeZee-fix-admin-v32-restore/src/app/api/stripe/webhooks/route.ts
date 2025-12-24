import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Update transaction status to PAID
        await prisma.financeTransaction.updateMany({
          where: { stripeInvoiceId: invoice.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });

        console.log(`Invoice ${invoice.id} marked as paid`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        // Update transaction status to FAILED
        await prisma.financeTransaction.updateMany({
          where: { stripeInvoiceId: invoice.id },
          data: { status: "FAILED" },
        });

        // TODO: Send alert email to admin
        console.log(`Invoice ${invoice.id} payment failed`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Cancel the maintenance subscription
        await prisma.maintenanceSubscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: SubscriptionStatus.CANCELLED,
            cancelledAt: new Date(),
          },
        });

        console.log(`Subscription ${subscription.id} cancelled`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        // Build update data object, only including valid dates
        const updateData: {
          currentPeriodStart?: Date;
          currentPeriodEnd?: Date;
          status: SubscriptionStatus;
        } = {
          status: subscription.status === "active" ? SubscriptionStatus.ACTIVE : 
                 subscription.status === "paused" ? SubscriptionStatus.PAUSED : SubscriptionStatus.CANCELLED,
        };

        // Only add dates if they are valid numbers
        if (subscription.current_period_start && typeof subscription.current_period_start === 'number') {
          updateData.currentPeriodStart = new Date(subscription.current_period_start * 1000);
        }
        
        if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
          updateData.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        }

        // Update subscription period
        await prisma.maintenanceSubscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: updateData,
        });

        console.log(`Subscription ${subscription.id} updated`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}






