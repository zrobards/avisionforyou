/**
 * Comprehensive Finance Dashboard
 * Manages invoices, subscriptions, and financial overview
 */

import { FinanceDashboard } from "@/components/admin/finance/FinanceDashboard";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  // Auth check is handled in layout.tsx to prevent flash

  // Fetch financial data
  const [invoices, payments, projects, organizations, maintenancePlans] = await Promise.all([
    db.invoice.findMany({
      include: {
        organization: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.payment.findMany({
      where: { status: "COMPLETED" },
      include: {
        invoice: {
          select: { number: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.project.findMany({
      where: { status: { in: ["ACTIVE", "COMPLETED", "MAINTENANCE"] } },
      select: { id: true, name: true, budget: true, status: true },
    }),
    db.organization.findMany({
      select: { id: true, name: true, stripeCustomerId: true },
    }),
    db.maintenancePlan.findMany({
      where: { status: "ACTIVE" },
      include: {
        project: {
          select: { name: true, organization: { select: { name: true } } },
        },
      },
    }),
  ]);

  // Calculate metrics
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

  const overdueCount = invoices.filter((inv) => inv.status === "OVERDUE").length;

  const monthlyRecurringRevenue = maintenancePlans.reduce(
    (sum, plan) => sum + Number(plan.monthlyPrice),
    0
  );

  const metrics = {
    thisMonthRevenue,
    lastMonthRevenue,
    outstandingAmount,
    overdueCount,
    monthlyRecurringRevenue,
    activeSubscriptions: maintenancePlans.length,
    totalPaidInvoices: paidInvoices.length,
    percentChange:
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0,
  };

  // Serialize decimal values
  const serializedInvoices = invoices.map((inv) => ({
    ...inv,
    total: Number(inv.total),
    amount: Number(inv.amount),
    tax: inv.tax ? Number(inv.tax) : 0,
    payments: inv.payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
    })),
  }));

  const serializedPayments = payments.map((p) => ({
    ...p,
    amount: Number(p.amount),
  }));

  const serializedPlans = maintenancePlans.map((plan) => ({
    ...plan,
    monthlyPrice: Number(plan.monthlyPrice),
  }));

  return (
    <FinanceDashboard
      invoices={serializedInvoices}
      payments={serializedPayments}
      maintenancePlans={serializedPlans}
      organizations={organizations}
      metrics={metrics}
    />
  );
}

