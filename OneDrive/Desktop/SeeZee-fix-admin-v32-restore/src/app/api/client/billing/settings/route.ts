import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { getSubscriptionPlanByName } from "@/lib/subscriptionPlans";

/**
 * GET /api/client/billing/settings
 * Returns billing settings and current subscription plan
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
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

    // Get active subscriptions
    const projects = await db.project.findMany({
      where: {
        organizationId: orgMembership.organizationId,
      },
      include: {
        subscriptions: {
          where: {
            status: "active",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Get the most recent active subscription
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get the first active subscription
    const activeSubscription = projects
      .flatMap((p) => p.subscriptions)
      .find((sub) => sub.status === "active");

    if (!activeSubscription) {
      return NextResponse.json({
        plan: null,
        settings: {
          onDemandEnabled: false,
          dailySpendCap: 500,
          monthlySpendCap: 2000,
          dailyRequestLimit: 3,
          urgentRequestsPerWeek: 2,
          rolloverEnabled: true,
          notifyAt80Percent: true,
          notifyAt2Hours: true,
          notifyBeforeOverage: true,
          notifyRolloverExpiring: true,
          autoPayEnabled: false,
        },
      });
    }

    // Get plan details from subscription plans
    const planDetails = getSubscriptionPlanByName(
      activeSubscription.planName || "Standard Monthly"
    );

    // Calculate period dates
    const periodEnd =
      activeSubscription.currentPeriodEnd ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    // Calculate period start from period end (30 days back) or use createdAt
    const periodStart = activeSubscription.currentPeriodEnd
      ? new Date(activeSubscription.currentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000)
      : activeSubscription.createdAt || new Date();

    // Map subscription to plan info
    const planInfo = {
      tierName: planDetails?.displayName || activeSubscription.planName || "Standard Support",
      monthlyPrice: planDetails
        ? planDetails.price / 100
        : activeSubscription.planName?.includes("Premium")
        ? 90
        : 50,
      hoursIncluded: planDetails
        ? planDetails.billingCycle === "monthly"
          ? planDetails.displayName.includes("Premium")
            ? 3
            : 1
          : planDetails.displayName.includes("Premium")
          ? 3
          : 1
        : 10, // Default fallback
      changeRequestsIncluded:
        activeSubscription.changeRequestsAllowed || planDetails?.changeRequestsAllowed || 2,
      isUnlimited: false,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    };

    // Return billing settings (for now, using defaults - can be stored in DB later)
    return NextResponse.json({
      plan: planInfo,
      settings: {
        onDemandEnabled: false,
        dailySpendCap: 500,
        monthlySpendCap: 2000,
        dailyRequestLimit: 3,
        urgentRequestsPerWeek: 2,
        rolloverEnabled: true,
        notifyAt80Percent: true,
        notifyAt2Hours: true,
        notifyBeforeOverage: true,
        notifyRolloverExpiring: true,
        autoPayEnabled: false,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/client/billing/settings]", error);
    return NextResponse.json(
      { error: "Failed to fetch billing settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/client/billing/settings
 * Update billing settings
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // For now, just return success
    // In the future, you can store these settings in a UserPreferences or OrganizationSettings table
    return NextResponse.json({
      success: true,
      message: "Billing settings updated",
    });
  } catch (error: any) {
    console.error("[PUT /api/client/billing/settings]", error);
    return NextResponse.json(
      { error: "Failed to update billing settings" },
      { status: 500 }
    );
  }
}
