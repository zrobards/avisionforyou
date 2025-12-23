import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

/**
 * POST /api/admin/stripe/verify-customer
 * Verify Stripe customer ID is correct and linked properly
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
    const { organizationId, projectId, customerId } = body;

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    // Verify customer exists in Stripe
    let stripeCustomer: Stripe.Customer | Stripe.DeletedCustomer;
    try {
      stripeCustomer = await stripe.customers.retrieve(customerId);
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        return NextResponse.json({
          valid: false,
          error: "Customer not found in Stripe",
          customerId,
        });
      }
      throw error;
    }

    // Check if customer is deleted
    if (stripeCustomer.deleted) {
      return NextResponse.json({
        valid: false,
        error: "Customer has been deleted in Stripe",
        customerId,
      });
    }

    // Check database records
    const org = organizationId ? await db.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, stripeCustomerId: true },
    }) : null;

    const project = projectId ? await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, stripeCustomerId: true },
    }) : null;

    // Find by customer ID if not provided
    const orgByCustomer = await db.organization.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true, name: true, stripeCustomerId: true },
    });

    const projectByCustomer = await db.project.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true, name: true, stripeCustomerId: true },
    });

    // Get Stripe payment history
    const charges = await stripe.charges.list({
      customer: customerId,
      limit: 10,
    });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });

    // Get database invoices for this customer
    const invoices = await db.invoice.findMany({
      where: {
        OR: [
          ...(org ? [{ organizationId: org.id }] : []),
          ...(project ? [{ projectId: project.id }] : []),
          ...(orgByCustomer ? [{ organizationId: orgByCustomer.id }] : []),
          ...(projectByCustomer ? [{ projectId: projectByCustomer.id }] : []),
        ],
      },
      include: {
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // At this point, we know it's not deleted
    const customer = stripeCustomer as Stripe.Customer;

    return NextResponse.json({
      valid: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        metadata: customer.metadata,
      },
      database: {
        organization: org || orgByCustomer,
        project: project || projectByCustomer,
      },
      stripe: {
        charges: charges.data.length,
        subscriptions: subscriptions.data.length,
        totalCharges: charges.data.reduce((sum, c) => sum + (c.amount || 0), 0) / 100,
      },
      databaseInvoices: {
        count: invoices.length,
        total: invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
        paid: invoices.filter(inv => inv.status === 'PAID').length,
      },
      correlation: {
        customerMatchesOrg: org?.stripeCustomerId === customerId || orgByCustomer?.stripeCustomerId === customerId,
        customerMatchesProject: project?.stripeCustomerId === customerId || projectByCustomer?.stripeCustomerId === customerId,
      },
    });
  } catch (error: any) {
    console.error("Error verifying Stripe customer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify customer" },
      { status: 500 }
    );
  }
}

