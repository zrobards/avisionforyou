/**
 * CEO Finances Dashboard
 * Aligned with Finance Overview page for consistency
 */

import { getFinancialMetrics, getRecentPayouts } from "@/server/actions/stripe";
import { db } from "@/server/db";
import { FinancesClient } from "@/components/admin/FinancesClient";

export const dynamic = "force-dynamic";

export default async function CEOFinancesPage() {
  // Fetch same data as Finance Overview page for consistency
  const [metricsResult, payoutsResult, invoices, maintenancePlans] = await Promise.all([
    getFinancialMetrics(),
    getRecentPayouts(5),
    // Get invoices for detailed breakdown
    db.invoice.findMany({
      include: {
        organization: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    // Get maintenance plans for MRR calculation
    db.maintenancePlan.findMany({
      where: { status: "ACTIVE" },
      include: {
        project: {
          select: { name: true, organization: { select: { name: true } } },
        },
      },
    }),
  ]);

  // Calculate metrics aligned with Finance Overview
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const paidInvoices = invoices.filter((inv) => inv.status === "PAID");
  const thisMonthRevenue = paidInvoices
    .filter((inv) => inv.paidAt && new Date(inv.paidAt) >= thisMonth)
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const lastMonthRevenue = paidInvoices
    .filter(
      (inv) =>
        inv.paidAt &&
        new Date(inv.paidAt) >= lastMonth &&
        new Date(inv.paidAt) < thisMonth
    )
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const outstandingAmount = invoices
    .filter((inv) => inv.status === "SENT" || inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const monthlyRecurringRevenue = maintenancePlans.reduce(
    (sum, plan) => sum + Number(plan.monthlyPrice),
    0
  );

  // Merge Stripe metrics with database metrics
  const stripeMetrics = metricsResult.success ? metricsResult.metrics : {
    totalIncome: 0,
    pendingPayments: 0,
    refunds: 0,
    growthPercent: 0,
    accountInfo: {
      accountId: "N/A",
      payoutSchedule: "Weekly",
      lastPayout: null,
      lastPayoutAmount: 0,
    },
  };

  const metrics = {
    ...stripeMetrics,
    // Override with database-calculated values for consistency
    totalIncome: paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0),
    pendingPayments: outstandingAmount,
    thisMonthRevenue,
    lastMonthRevenue,
    monthlyRecurringRevenue,
    activeSubscriptions: maintenancePlans.length,
    totalPaidInvoices: paidInvoices.length,
    percentChange:
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : stripeMetrics.growthPercent,
  };

  const payouts = payoutsResult.success ? payoutsResult.payouts : [];

  return (
    <FinancesClient metrics={metrics} payouts={payouts} />
  );
}

