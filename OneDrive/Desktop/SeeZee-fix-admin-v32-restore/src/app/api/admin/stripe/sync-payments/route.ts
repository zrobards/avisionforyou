import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

/**
 * POST /api/admin/stripe/sync-payments
 * Sync payments from Stripe to database
 * Verifies all Stripe payments are properly recorded
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { customerId, limit = 100 } = body;

    const results = {
      synced: 0,
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    try {
      // Get all charges for the customer (or all customers if not specified)
      const charges = await stripe.charges.list({
        limit: limit,
        ...(customerId ? { customer: customerId } : {}),
      });

      for (const charge of charges.data) {
        try {
          // Skip if charge is not paid
          if (charge.status !== 'succeeded' || charge.paid !== true) {
            continue;
          }

          // Find existing payment by Stripe charge ID
          const existingPayment = await db.payment.findFirst({
            where: {
              OR: [
                { stripeChargeId: charge.id },
                { stripePaymentId: charge.payment_intent as string },
              ],
            },
            include: {
              invoice: true,
            },
          });

          if (existingPayment) {
            // Update if needed
            if (existingPayment.status !== 'COMPLETED') {
              await db.payment.update({
                where: { id: existingPayment.id },
                data: {
                  status: 'COMPLETED',
                  processedAt: new Date(charge.created * 1000),
                },
              });
              results.updated++;
            }
            results.synced++;
            continue;
          }

          // Try to find invoice by Stripe invoice ID
          let invoice = null;
          if (charge.invoice) {
            invoice = await db.invoice.findFirst({
              where: {
                stripeInvoiceId: charge.invoice as string,
              },
            });
          }

          // If no invoice found, try to find by customer metadata
          if (!invoice && charge.customer) {
            // Find organization or project by Stripe customer ID
            const org = await db.organization.findFirst({
              where: { stripeCustomerId: charge.customer as string },
            });

            const project = await db.project.findFirst({
              where: { stripeCustomerId: charge.customer as string },
            });

            // Try to find most recent unpaid invoice for this customer
            if (org || project) {
              invoice = await db.invoice.findFirst({
                where: {
                  OR: [
                    ...(org ? [{ organizationId: org.id }] : []),
                    ...(project ? [{ projectId: project.id }] : []),
                  ],
                  status: { in: ['SENT', 'DRAFT'] },
                  total: charge.amount / 100, // Match amount
                },
                orderBy: { createdAt: 'desc' },
              });
            }
          }

          // Create payment record
          if (invoice) {
            await db.payment.create({
              data: {
                invoiceId: invoice.id,
                amount: charge.amount,
                status: 'COMPLETED',
                method: 'stripe',
                stripeChargeId: charge.id,
                stripePaymentId: charge.payment_intent as string,
                processedAt: new Date(charge.created * 1000),
                currency: charge.currency.toUpperCase(),
              },
            });

            // Update invoice if not already paid
            if (invoice.status !== 'PAID') {
              await db.invoice.update({
                where: { id: invoice.id },
                data: {
                  status: 'PAID',
                  paidAt: new Date(charge.created * 1000),
                },
              });
            }

            results.created++;
          } else {
            results.errors.push(`No invoice found for charge ${charge.id} (${charge.amount / 100} ${charge.currency.toUpperCase()})`);
          }
        } catch (error: any) {
          results.errors.push(`Error processing charge ${charge.id}: ${error.message}`);
        }
      }

      return NextResponse.json({
        success: true,
        results,
        message: `Synced ${results.synced} payments, created ${results.created}, updated ${results.updated}`,
      });
    } catch (error: any) {
      console.error("Error syncing Stripe payments:", error);
      return NextResponse.json(
        { error: error.message || "Failed to sync payments" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in sync-payments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync payments" },
      { status: 500 }
    );
  }
}




