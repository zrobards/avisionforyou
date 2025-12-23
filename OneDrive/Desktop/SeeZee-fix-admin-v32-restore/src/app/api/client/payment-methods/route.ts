import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * GET /api/client/payment-methods
 * Get all payment methods for the current user's organization
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user's organization
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
                  take: 1,
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

    // Find first customer ID from organization or project
    let stripeCustomerId: string | null = null;

    for (const orgMember of user.organizations) {
      // Check organization's customer ID first
      if (orgMember.organization.stripeCustomerId) {
        stripeCustomerId = orgMember.organization.stripeCustomerId;
        break;
      }
      
      // Fallback to project customer ID
      const projectWithCustomer = orgMember.organization.projects.find(
        (p) => p.stripeCustomerId
      );
      if (projectWithCustomer?.stripeCustomerId) {
        stripeCustomerId = projectWithCustomer.stripeCustomerId;
        break;
      }
    }

    if (!stripeCustomerId) {
      return NextResponse.json({ paymentMethods: [] });
    }

    // Get payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

    // Get customer to find default payment method
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    const defaultPaymentMethodId = typeof customer === 'object' && !customer.deleted 
      ? customer.invoice_settings?.default_payment_method 
      : null;

    const formattedMethods = paymentMethods.data.map((pm) => ({
      id: pm.id,
      type: pm.type,
      card: pm.card ? {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
      } : null,
      isDefault: pm.id === defaultPaymentMethodId,
      created: pm.created,
    }));

    return NextResponse.json({ 
      paymentMethods: formattedMethods,
      defaultPaymentMethodId,
    });
  } catch (error: any) {
    console.error("[Payment Methods Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/client/payment-methods
 * Create a setup intent for adding a new payment method
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user's organization
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
                  take: 1,
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

    // Find or create Stripe customer
    let stripeCustomerId: string | null = null;

    for (const orgMember of user.organizations) {
      if (orgMember.organization.stripeCustomerId) {
        stripeCustomerId = orgMember.organization.stripeCustomerId;
        break;
      }
      
      const projectWithCustomer = orgMember.organization.projects.find(
        (p) => p.stripeCustomerId
      );
      if (projectWithCustomer?.stripeCustomerId) {
        stripeCustomerId = projectWithCustomer.stripeCustomerId;
        break;
      }
    }

    // Create customer if doesn't exist
    if (!stripeCustomerId) {
      const owner = user.organizations[0]?.organization;
      if (!owner) {
        return NextResponse.json({ error: "No organization found" }, { status: 404 });
      }

      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          organizationId: owner.id,
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      // Update organization with customer ID
      await prisma.organization.update({
        where: { id: owner.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Create setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    });
  } catch (error: any) {
    console.error("[Setup Intent Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create setup intent" },
      { status: 500 }
    );
  }
}

