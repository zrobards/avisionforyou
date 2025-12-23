import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/invoices/[id]/pay
 * Create Stripe checkout session for invoice payment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: invoiceId } = await params;

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
        project: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Payment logic:
    // 1. SENT invoices can always be paid (regardless of type or approval)
    // 2. Non-custom invoices (deposit, final, subscription) can be paid without approval
    // 3. Custom invoices that aren't SENT require both customer and admin approval
    
    const invoiceType = (invoice as any).invoiceType || "deposit";
    const isCustomInvoice = invoiceType === 'custom';
    const isSent = invoice.status === "SENT";
    
    // Only require approval for custom invoices that haven't been sent yet
    if (isCustomInvoice && !isSent) {
      if (!(invoice as any).customerApprovedAt || !(invoice as any).adminApprovedAt) {
        console.error("[Pay Invoice] Custom invoice requires approval but missing:", {
          invoiceId,
          invoiceType,
          status: invoice.status,
          customerApprovedAt: (invoice as any).customerApprovedAt,
          adminApprovedAt: (invoice as any).adminApprovedAt,
        });
        return NextResponse.json(
          { error: "Invoice must be approved by both customer and admin before payment" },
          { status: 400 }
        );
      }
    }
    
    // Check if invoice is in a payable state (block CANCELLED and PAID)
    if (invoice.status === "CANCELLED") {
      console.error("[Pay Invoice] Invoice is cancelled:", { invoiceId, status: invoice.status });
      return NextResponse.json(
        { error: "Cancelled invoices cannot be paid" },
        { status: 400 }
      );
    }
    
    // Check if invoice is already paid
    if (invoice.status === "PAID") {
      console.error("[Pay Invoice] Invoice already paid:", { invoiceId, status: invoice.status });
      return NextResponse.json(
        { error: "Invoice is already paid" },
        { status: 400 }
      );
    }

    // Check if invoice has items
    if (!invoice.items || invoice.items.length === 0) {
      console.error("[Pay Invoice] Invoice has no items:", { invoiceId });
      return NextResponse.json(
        { error: "Invoice has no items to pay" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const owner = invoice.organization.members.find(m => m.role === "OWNER");
    if (!owner) {
      console.error("[Pay Invoice] No organization owner found:", {
        invoiceId,
        organizationId: invoice.organizationId,
        members: invoice.organization.members.map(m => ({ role: m.role, userId: m.userId })),
      });
      return NextResponse.json(
        { error: "No organization owner found" },
        { status: 400 }
      );
    }

    let customerId = invoice.project?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: owner.user.email!,
        name: owner.user.name || undefined,
        metadata: {
          organizationId: invoice.organizationId,
          invoiceId: invoice.id,
        },
      });

      customerId = customer.id;

      // Update project if exists
      if (invoice.projectId) {
        await prisma.project.update({
          where: { id: invoice.projectId },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: invoice.items.map((item) => ({
        price_data: {
          currency: invoice.currency.toLowerCase(),
          product_data: {
            name: item.description,
            description: invoice.description || undefined,
          },
          unit_amount: Math.round(Number(item.amount) * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/client/invoices/${invoice.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/client/invoices/${invoice.id}`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        invoiceType: (invoice as any).invoiceType || "deposit",
      },
      payment_intent_data: {
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
        },
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error: any) {
    console.error("[Pay Invoice Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment session" },
      { status: 500 }
    );
  }
}

