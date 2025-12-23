import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { db } from "@/server/db";
import Stripe from "stripe";
import { getSubscriptionPlan } from "@/lib/subscriptionPlans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId, projectId, priceId } = body;

    if (!planId || !projectId) {
      return NextResponse.json(
        { error: "Missing planId or projectId" },
        { status: 400 }
      );
    }

    // Get the subscription plan
    const plan = getSubscriptionPlan(planId as any);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Verify project belongs to user's organization
    const orgMembership = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: {
        organization: true,
      },
    });

    if (!orgMembership) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        organizationId: orgMembership.organizationId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let customerId = orgMembership.organization.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: orgMembership.organization.email || session.user.email || undefined,
        name: orgMembership.organization.name,
        metadata: {
          organizationId: orgMembership.organization.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to organization
      await db.organization.update({
        where: { id: orgMembership.organization.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Use provided priceId or create one from the plan
    let stripePriceId = priceId;

    if (!stripePriceId && plan.stripePriceId) {
      stripePriceId = plan.stripePriceId;
    }

    if (!stripePriceId) {
      // Create price if it doesn't exist
      const product = await stripe.products.create({
        name: plan.displayName,
        description: plan.description,
        metadata: {
          planId: plan.id,
          changeRequestsAllowed: plan.changeRequestsAllowed.toString(),
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: "usd",
        recurring: {
          interval: plan.billingCycle === "monthly" ? "month" : "year",
        },
        metadata: {
          planId: plan.id,
        },
      });

      stripePriceId = price.id;
    }

    // Check if there's an existing subscription for this project
    const existingSubscription = await db.subscription.findFirst({
      where: {
        projectId: projectId,
        status: "active",
      },
    });

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/client/subscriptions?upgraded=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/client/upgrade`,
      metadata: {
        userId: session.user.id,
        organizationId: orgMembership.organization.id,
        projectId: projectId,
        planId: plan.id,
        planName: plan.name,
        existingSubscriptionId: existingSubscription?.id || "",
      },
      subscription_data: {
        metadata: {
          organizationId: orgMembership.organization.id,
          projectId: projectId,
          planId: plan.id,
          planName: plan.name,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Subscription upgrade error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create upgrade session" },
      { status: 500 }
    );
  }
}




