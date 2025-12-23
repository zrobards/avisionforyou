import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleCors, addCorsHeaders } from "@/lib/cors";
import { getClientAccessContext } from "@/lib/client-access";

/**
 * OPTIONS /api/client/subscriptions
 * Handle CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 200 });
}

/**
 * GET /api/client/subscriptions
 * Returns client's active subscriptions with billing details
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const identity = {
      userId: session.user.id,
      email: session.user.email,
    };
    const { organizationIds, leadProjectIds } = await getClientAccessContext(identity);

    if (organizationIds.length === 0 && leadProjectIds.length === 0) {
      const response = NextResponse.json({
        subscriptions: [],
        maintenancePlans: [],
        stats: {
          activeSubscriptions: 0,
          totalMonthlyAmount: 0,
        },
      });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Fetch subscriptions from the Subscription model (from NextAuth)
    const subscriptions = await prisma.subscription.findMany({
      where: {
        project: {
          OR: [
            { organizationId: { in: organizationIds } },
            { id: { in: leadProjectIds } },
          ],
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch maintenance plans with hour packs
    const maintenancePlans = await prisma.maintenancePlan.findMany({
      where: {
        project: {
          OR: [
            { organizationId: { in: organizationIds } },
            { id: { in: leadProjectIds } },
          ],
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        hourPacks: {
          where: {
            isActive: true,
          },
          orderBy: { purchasedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.status === "active" || sub.status === "trialing"
    ).length;
    
    const activePlans = maintenancePlans.filter(
      (plan) => plan.status === "ACTIVE"
    ).length;

    const totalMonthlyAmount = maintenancePlans
      .filter((plan) => plan.status === "ACTIVE")
      .reduce((sum, plan) => sum + Number(plan.monthlyPrice), 0);

    // Calculate total hour packs across all plans
    const allHourPacks = maintenancePlans.flatMap((plan) => plan.hourPacks);
    const totalHourPacks = allHourPacks.length;
    const totalHourPackCost = allHourPacks.reduce((sum, pack) => sum + pack.cost, 0);

    const response = NextResponse.json({
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        stripeId: sub.stripeId,
        priceId: sub.priceId,
        status: sub.status,
        planName: sub.planName || "Standard Plan",
        currentPeriodEnd: sub.currentPeriodEnd,
        changeRequestsAllowed: sub.changeRequestsAllowed,
        changeRequestsUsed: sub.changeRequestsUsed,
        project: sub.project,
        createdAt: sub.createdAt,
      })),
      maintenancePlans: maintenancePlans.map((plan) => ({
        id: plan.id,
        tier: plan.tier,
        monthlyPrice: Number(plan.monthlyPrice),
        status: plan.status,
        supportHoursIncluded: plan.supportHoursIncluded,
        supportHoursUsed: plan.supportHoursUsed,
        changeRequestsIncluded: plan.changeRequestsIncluded,
        changeRequestsUsed: plan.changeRequestsUsed,
        currentPeriodEnd: plan.currentPeriodEnd,
        project: plan.project,
        createdAt: plan.createdAt,
        hourPacks: plan.hourPacks.map((pack) => ({
          id: pack.id,
          packType: pack.packType,
          hours: pack.hours,
          hoursRemaining: pack.hoursRemaining,
          cost: pack.cost,
          purchasedAt: pack.purchasedAt,
          expiresAt: pack.expiresAt,
          neverExpires: pack.neverExpires,
        })),
      })),
      hourPacks: allHourPacks.map((pack) => ({
        id: pack.id,
        packType: pack.packType,
        hours: pack.hours,
        hoursRemaining: pack.hoursRemaining,
        cost: pack.cost,
        purchasedAt: pack.purchasedAt,
        expiresAt: pack.expiresAt,
        neverExpires: pack.neverExpires,
        planId: pack.planId,
      })),
      stats: {
        activeSubscriptions: activeSubscriptions + activePlans,
        totalMonthlyAmount,
        totalHourPacks,
        totalHourPackCost,
      },
    });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error: any) {
    console.error("[GET /api/client/subscriptions]", error);
    const response = NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}
