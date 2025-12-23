import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * DELETE /api/client/payment-methods/[id]
 * Delete a payment method
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this payment method
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                projects: {
                  where: {
                    stripeCustomerId: { not: null },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get payment method to verify it belongs to user's customer
    const paymentMethod = await stripe.paymentMethods.retrieve(id);
    
    if (!paymentMethod.customer) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    // Verify customer belongs to user's organization or project
    const customerId = typeof paymentMethod.customer === 'string' 
      ? paymentMethod.customer 
      : paymentMethod.customer.id;

    let hasAccess = false;
    for (const orgMember of user.organizations) {
      // Check organization customer ID
      if (orgMember.organization.stripeCustomerId === customerId) {
        hasAccess = true;
        break;
      }
      // Check project customer IDs
      for (const project of orgMember.organization.projects) {
        if (project.stripeCustomerId === customerId) {
          hasAccess = true;
          break;
        }
      }
      if (hasAccess) break;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Detach payment method from customer
    await stripe.paymentMethods.detach(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Delete Payment Method Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete payment method" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/client/payment-methods/[id]
 * Set a payment method as default
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this payment method
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                projects: {
                  where: {
                    stripeCustomerId: { not: null },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get payment method to verify it belongs to user's customer
    const paymentMethod = await stripe.paymentMethods.retrieve(id);
    
    if (!paymentMethod.customer) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    // Verify customer belongs to user's organization or project
    const customerId = typeof paymentMethod.customer === 'string' 
      ? paymentMethod.customer 
      : paymentMethod.customer.id;

    let hasAccess = false;
    for (const orgMember of user.organizations) {
      // Check organization customer ID
      if (orgMember.organization.stripeCustomerId === customerId) {
        hasAccess = true;
        break;
      }
      // Check project customer IDs
      for (const project of orgMember.organization.projects) {
        if (project.stripeCustomerId === customerId) {
          hasAccess = true;
          break;
        }
      }
      if (hasAccess) break;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update customer's default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Set Default Payment Method Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to set default payment method" },
      { status: 500 }
    );
  }
}

