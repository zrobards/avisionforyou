import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    
    // Find maintenance plan
    const plan = await db.maintenancePlan.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!plan) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Pause in Stripe if subscription exists
    if (plan.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(plan.stripeSubscriptionId, {
          pause_collection: {
            behavior: 'mark_uncollectible',
          },
        });
      } catch (error: any) {
        console.error("Error pausing Stripe subscription:", error);
        // Continue - update DB anyway
      }
    }

    // Update in database
    await db.maintenancePlan.update({
      where: { id },
      data: { status: 'PAUSED' },
    });

    return NextResponse.json({ success: true, message: "Subscription paused successfully" });
  } catch (error: any) {
    console.error("Error pausing subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to pause subscription" },
      { status: 500 }
    );
  }
}



