import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getClientAccessContext } from "@/lib/client-access";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

/**
 * POST /api/client/maintenance-plans/cancel
 * Cancel a maintenance plan subscription
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identity = {
      userId: session.user.id,
      email: session.user.email!,
    };

    // Get user's accessible projects
    const access = await getClientAccessContext(identity);
    
    if (access.organizationIds.length === 0 && access.leadProjectIds.length === 0) {
      return NextResponse.json(
        { error: "No accessible projects found" },
        { status: 404 }
      );
    }

    // Find the active maintenance plan for the user's organization
    const maintenancePlan = await prisma.maintenancePlan.findFirst({
      where: {
        project: {
          OR: [
            { organizationId: { in: access.organizationIds } },
            { id: { in: access.leadProjectIds } },
          ],
        },
        status: 'ACTIVE',
      },
    });

    if (!maintenancePlan) {
      return NextResponse.json(
        { error: "No active maintenance plan found" },
        { status: 404 }
      );
    }

    // If there's a Stripe subscription, cancel it
    if (maintenancePlan.stripeSubscriptionId) {
      try {
        // Cancel the subscription at period end (don't cancel immediately)
        await stripe.subscriptions.update(maintenancePlan.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      } catch (stripeError: any) {
        console.error("Failed to cancel Stripe subscription:", stripeError);
        // Continue anyway - we'll mark it as cancelled in the database
      }
    }

    // Update the maintenance plan status to CANCELLED
    const updatedPlan = await prisma.maintenancePlan.update({
      where: { id: maintenancePlan.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
      message: "Your subscription has been cancelled. You'll continue to have access until the end of your current billing period.",
    });
  } catch (error) {
    console.error("[POST /api/client/maintenance-plans/cancel]", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}





