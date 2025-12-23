import { getCurrentUser } from "@/lib/auth/requireRole";
import { db } from "@/server/db";
import { AdminSubscriptionManager } from "@/components/admin/AdminSubscriptionManager";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    const { redirect } = await import('next/navigation');
    redirect('/login');
  }

  // Get all maintenance plans with full details
  const maintenancePlans = await db.maintenancePlan.findMany({
    include: {
      project: {
        include: {
          organization: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get all subscriptions (legacy)
  const subscriptions = await db.subscription.findMany({
    include: {
      project: {
        include: {
          organization: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Serialize Decimal values to numbers
  const serializedMaintenancePlans = maintenancePlans.map(plan => ({
    ...plan,
    monthlyPrice: plan.monthlyPrice ? Number(plan.monthlyPrice) : null,
    supportHoursIncluded: plan.supportHoursIncluded ? Number(plan.supportHoursIncluded) : null,
    supportHoursUsed: plan.supportHoursUsed ? Number(plan.supportHoursUsed) : null,
    changeRequestsIncluded: plan.changeRequestsIncluded ? Number(plan.changeRequestsIncluded) : null,
    changeRequestsUsed: plan.changeRequestsUsed ? Number(plan.changeRequestsUsed) : null,
    hourlyOverageRate: plan.hourlyOverageRate ? Number(plan.hourlyOverageRate) : null,
    rolloverCap: plan.rolloverCap ? Number(plan.rolloverCap) : null,
    rolloverHours: plan.rolloverHours ? Number(plan.rolloverHours) : null,
    dailySpendCap: plan.dailySpendCap ? Number(plan.dailySpendCap) : null,
    monthlySpendCap: plan.monthlySpendCap ? Number(plan.monthlySpendCap) : null,
    currentPeriodStart: plan.currentPeriodStart?.toISOString() || null,
    currentPeriodEnd: plan.currentPeriodEnd?.toISOString() || null,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    cancelledAt: plan.cancelledAt?.toISOString() || null,
  }));

  const serializedSubscriptions = subscriptions.map(sub => ({
    ...sub,
    price: null, // Legacy subscriptions don't have a price field
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() || null,
    createdAt: sub.createdAt.toISOString(),
  }));

  // Calculate stats
  const stats = {
    total: maintenancePlans.length + subscriptions.length,
    active: maintenancePlans.filter(p => p.status === 'ACTIVE').length + 
            subscriptions.filter(s => s.status === 'active').length,
    pending: 0, // MaintenancePlanStatus doesn't have PENDING status
    cancelled: maintenancePlans.filter(p => p.status === 'CANCELLED').length + 
               subscriptions.filter(s => s.status === 'canceled').length,
    pastDue: subscriptions.filter(s => s.status === 'past_due').length,
    totalMonthlyRevenue: maintenancePlans
      .filter(p => p.status === 'ACTIVE')
      .reduce((sum, p) => sum + Number(p.monthlyPrice || 0), 0),
      // Note: Legacy subscriptions don't have a price field, so they're not included in revenue calculation
  };

  return (
    <AdminSubscriptionManager
      maintenancePlans={serializedMaintenancePlans}
      subscriptions={serializedSubscriptions}
      stats={stats}
      currentUser={user!}
    />
  );
}

