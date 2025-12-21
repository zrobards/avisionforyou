import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { organizationId, projectId, amount, description, dueDate, items } = body;

    // Get organization
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, email: true, stripeCustomerId: true },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Create or get Stripe customer
    let stripeCustomerId = organization.stripeCustomerId;

    if (!stripeCustomerId && organization.email) {
      const customer = await stripe.customers.create({
        name: organization.name,
        email: organization.email,
        metadata: {
          organizationId: organization.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update organization with Stripe customer ID
      await db.organization.update({
        where: { id: organization.id },
        data: { stripeCustomerId },
      });
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "Organization needs email to create Stripe invoice" },
        { status: 400 }
      );
    }

    // Create Stripe invoice
    const stripeInvoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: "send_invoice",
      days_until_due: dueDate 
        ? Math.max(1, Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 30,
      description,
      metadata: {
        organizationId,
        projectId: projectId || "",
      },
    });

    // Add invoice items
    for (const item of items || []) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: stripeInvoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_amount: Math.round(item.rate * 100), // Convert to cents
      });
    }

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);

    return NextResponse.json({
      success: true,
      invoiceId: finalizedInvoice.id,
      hostedInvoiceUrl: finalizedInvoice.hosted_invoice_url,
      invoicePdf: finalizedInvoice.invoice_pdf,
      status: finalizedInvoice.status,
    });
  } catch (error) {
    console.error("Error creating Stripe invoice:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe invoice" },
      { status: 500 }
    );
  }
}

