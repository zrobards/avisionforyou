"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Clock,
  AlertTriangle,
  Plus,
  Download,
  Send,
  RefreshCw,
} from "lucide-react";
import { InvoicesTable } from "./InvoicesTable";
import { SubscriptionsTable } from "./SubscriptionsTable";
import { RevenueBreakdown } from "./RevenueBreakdown";
import { CreateInvoiceModal } from "./CreateInvoiceModal";

interface FinanceMetrics {
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  outstandingAmount: number;
  overdueCount: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  totalPaidInvoices: number;
  percentChange: number;
}

interface Invoice {
  id: string;
  number: string;
  title: string;
  status: string;
  total: number;
  amount: number;
  dueDate: Date;
  paidAt: Date | null;
  createdAt: Date;
  organization: { id: string; name: string };
  project: { id: string; name: string } | null;
}

interface MaintenancePlan {
  id: string;
  tier: string;
  monthlyPrice: number;
  status: string;
  project: {
    name: string;
    organization: { name: string };
  };
}

interface Organization {
  id: string;
  name: string;
  stripeCustomerId: string | null;
}

interface FinanceDashboardProps {
  invoices: Invoice[];
  payments: any[];
  maintenancePlans: MaintenancePlan[];
  organizations: Organization[];
  metrics: FinanceMetrics;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "trinity-red",
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  trend?: "up" | "down";
  trendValue?: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    "trinity-red": "text-trinity-red bg-trinity-red/20",
    green: "text-green-400 bg-green-500/20",
    yellow: "text-yellow-400 bg-yellow-500/20",
    cyan: "text-cyan-400 bg-cyan-500/20",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border-2 border-gray-700 glass-effect p-6 hover:border-trinity-red/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span
                className={`text-sm ${
                  trend === "up" ? "text-green-400" : "text-red-400"
                }`}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

export function FinanceDashboard({
  invoices,
  payments,
  maintenancePlans,
  organizations,
  metrics,
}: FinanceDashboardProps) {
  const [activeTab, setActiveTab] = useState<"invoices" | "subscriptions">(
    "invoices"
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredInvoices =
    statusFilter === "all"
      ? invoices
      : invoices.filter((inv) => inv.status === statusFilter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
            Financial Overview
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">
            Finance Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-trinity-red px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-trinity-maroon hover:shadow-large"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-sm font-medium text-white transition-all hover:border-trinity-red/50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="This Month"
          value={currencyFormatter.format(metrics.thisMonthRevenue)}
          trend={metrics.percentChange >= 0 ? "up" : "down"}
          trendValue={`${Math.abs(metrics.percentChange).toFixed(1)}% vs last month`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Outstanding"
          value={currencyFormatter.format(metrics.outstandingAmount)}
          subtitle={`${metrics.overdueCount} overdue`}
          icon={Clock}
          color={metrics.overdueCount > 0 ? "yellow" : "cyan"}
        />
        <StatCard
          title="Monthly Recurring"
          value={currencyFormatter.format(metrics.monthlyRecurringRevenue)}
          subtitle={`${metrics.activeSubscriptions} active plans`}
          icon={RefreshCw}
          color="cyan"
        />
        <StatCard
          title="Total Collected"
          value={currencyFormatter.format(
            invoices
              .filter((inv) => inv.status === "PAID")
              .reduce((sum, inv) => sum + inv.total, 0)
          )}
          subtitle={`${metrics.totalPaidInvoices} invoices paid`}
          icon={CreditCard}
          color="green"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Invoices & Subscriptions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-gray-700 pb-4">
            <button
              onClick={() => setActiveTab("invoices")}
              className={`text-sm font-semibold transition-colors ${
                activeTab === "invoices"
                  ? "text-trinity-red"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`text-sm font-semibold transition-colors ${
                activeTab === "subscriptions"
                  ? "text-trinity-red"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Subscriptions
            </button>
          </div>

          {activeTab === "invoices" && (
            <>
              {/* Filter */}
              <div className="flex items-center gap-2">
                {["all", "DRAFT", "SENT", "PAID", "OVERDUE"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === status
                        ? "bg-trinity-red text-white"
                        : "bg-[#1a2235] text-gray-400 hover:text-white hover:bg-[#1e2840]"
                    }`}
                  >
                    {status === "all" ? "All" : status}
                  </button>
                ))}
              </div>

              <InvoicesTable invoices={filteredInvoices} />
            </>
          )}

          {activeTab === "subscriptions" && (
            <SubscriptionsTable subscriptions={maintenancePlans} />
          )}
        </div>

        {/* Revenue Breakdown */}
        <div className="space-y-6">
          <RevenueBreakdown invoices={invoices} />

          {/* Recent Payments */}
          <section className="rounded-2xl border-2 border-gray-700 glass-effect p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Payments
            </h3>
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#1a2235] border border-gray-800"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {payment.invoice?.title || `Invoice ${payment.invoice?.number}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.processedAt || payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-400">
                    +{currencyFormatter.format(payment.amount)}
                  </span>
                </div>
              ))}
              {payments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent payments
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          organizations={organizations}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

export default FinanceDashboard;







