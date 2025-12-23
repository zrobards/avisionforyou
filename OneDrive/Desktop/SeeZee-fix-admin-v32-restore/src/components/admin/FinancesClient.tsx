"use client";

import { motion } from "framer-motion";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatCard } from "@/components/admin/StatCard";
import { DollarSign, CreditCard, TrendingDown, Download } from "lucide-react";
import { formatCurrency } from "@/lib/ui";
import { arrayToCSV, downloadCSV, formatCurrencyForCSV, formatDateForCSV } from "@/lib/csv-export";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface FinancesClientProps {
  metrics: {
    totalIncome: number;
    pendingPayments: number;
    refunds: number;
    growthPercent: number;
    thisMonthRevenue?: number;
    lastMonthRevenue?: number;
    monthlyRecurringRevenue?: number;
    activeSubscriptions?: number;
    totalPaidInvoices?: number;
    percentChange?: number;
    accountInfo: {
      accountId: string;
      payoutSchedule: string;
      lastPayout: Date | null;
      lastPayoutAmount: number;
    };
    revenueVsExpenses?: Array<{ month: string; revenue: number; expenses: number }>;
    cashFlowTimeline?: Array<{ month: string; cashFlow: number }>;
    invoiceStatusBreakdown?: {
      PAID: number;
      SENT: number;
      OVERDUE: number;
      DRAFT: number;
    };
    paymentMethodDistribution?: {
      card: number;
      bank_transfer: number;
      other: number;
    };
    mrrTrend?: Array<{ month: string; mrr: number }>;
  };
  payouts: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    arrivalDate: Date;
    description: string | null;
  }>;
}

export function FinancesClient({ metrics, payouts }: FinancesClientProps) {
  const formatRelativeTime = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const handleExport = () => {
    const data = [
      {
        metric: "Total Income",
        value: formatCurrencyForCSV(metrics.totalIncome),
      },
      {
        metric: "Pending Payments",
        value: formatCurrencyForCSV(metrics.pendingPayments),
      },
      {
        metric: "Refunds (30d)",
        value: formatCurrencyForCSV(metrics.refunds),
      },
      {
        metric: "Growth %",
        value: `${metrics.growthPercent}%`,
      },
      {
        metric: "Account ID",
        value: metrics.accountInfo.accountId,
      },
      {
        metric: "Payout Schedule",
        value: metrics.accountInfo.payoutSchedule,
      },
      {
        metric: "Last Payout Amount",
        value: formatCurrencyForCSV(metrics.accountInfo.lastPayoutAmount),
      },
      {
        metric: "Last Payout Date",
        value: formatDateForCSV(metrics.accountInfo.lastPayout),
      },
    ];

    // Add payout data if available
    if (payouts.length > 0) {
      payouts.forEach((payout, index) => {
        data.push({
          metric: `Payout ${index + 1} - Amount`,
          value: formatCurrencyForCSV(payout.amount),
        });
        data.push({
          metric: `Payout ${index + 1} - Status`,
          value: payout.status,
        });
        data.push({
          metric: `Payout ${index + 1} - Date`,
          value: formatDateForCSV(payout.arrivalDate),
        });
      });
    }

    // Add revenue vs expenses data if available
    if (metrics.revenueVsExpenses && metrics.revenueVsExpenses.length > 0) {
      metrics.revenueVsExpenses.forEach((item) => {
        data.push({
          metric: `${item.month} - Revenue`,
          value: formatCurrencyForCSV(item.revenue),
        });
        data.push({
          metric: `${item.month} - Expenses`,
          value: formatCurrencyForCSV(item.expenses),
        });
      });
    }

    const headers = [
      { key: "metric" as const, label: "Metric" },
      { key: "value" as const, label: "Value" },
    ];

    const csvContent = arrayToCSV(data, headers);
    const filename = `finances-${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  return (
    <div className="space-y-6">
      {/* Premium Header with Animated Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-seezee-red/20 via-seezee-blue/10 to-seezee-navy-deep" />
        <div className="absolute inset-0 bg-gradient-to-t from-seezee-navy-deep via-seezee-navy-deep/50 to-transparent" />
        
        {/* Animated glow orbs */}
        <motion.div 
          className="absolute -top-24 -left-24 w-48 h-48 bg-seezee-red/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-24 -right-24 w-48 h-48 bg-seezee-blue/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <div className="relative z-10 p-8 backdrop-blur-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-3 rounded-xl bg-gradient-to-br from-seezee-red to-seezee-blue"
              >
                <DollarSign className="w-6 h-6 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold gradient-text">
                Finances
              </h1>
            </div>
            <p className="text-slate-400 text-lg ml-[60px]">
              Stripe integration and financial overview
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="relative group px-6 py-3 rounded-xl bg-seezee-red text-white font-medium shadow-lg shadow-seezee-red/25 overflow-hidden"
          >
            <div className="absolute inset-0 bg-seezee-red/90 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Financial KPIs - Aligned with Finance Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <StatCard
          label={metrics.thisMonthRevenue !== undefined ? "This Month" : "Total Income"}
          value={formatCurrency(metrics.thisMonthRevenue ?? metrics.totalIncome)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={
            (metrics.percentChange !== undefined && metrics.percentChange !== 0) || metrics.growthPercent !== 0
              ? { 
                  value: metrics.percentChange ?? metrics.growthPercent, 
                  label: metrics.thisMonthRevenue !== undefined ? "vs last month" : "this quarter" 
                }
              : undefined
          }
        />
        <StatCard
          label="Pending Payments"
          value={formatCurrency(metrics.pendingPayments)}
          icon={<CreditCard className="w-5 h-5" />}
        />
        {metrics.monthlyRecurringRevenue !== undefined ? (
          <StatCard
            label="Monthly Recurring"
            value={formatCurrency(metrics.monthlyRecurringRevenue)}
            icon={<CreditCard className="w-5 h-5" />}
          />
        ) : (
          <StatCard
            label="Refunds (30d)"
            value={formatCurrency(metrics.refunds)}
            icon={<TrendingDown className="w-5 h-5" />}
          />
        )}
        <StatCard
          label={metrics.totalPaidInvoices !== undefined ? "Total Collected" : "Available Balance"}
          value={formatCurrency(metrics.totalIncome)}
          icon={<DollarSign className="w-5 h-5" />}
        />
      </motion.div>

      {/* Stripe Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SectionCard title="Stripe Summary">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-slate-400">Connected Account</span>
            <span className="text-white font-medium">
              {metrics.accountInfo.accountId}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-slate-400">Payout Schedule</span>
            <span className="text-white font-medium">
              {metrics.accountInfo.payoutSchedule}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-400">Last Payout</span>
            <span className="text-white font-medium">
              {metrics.accountInfo.lastPayout
                ? `${formatCurrency(metrics.accountInfo.lastPayoutAmount)} • ${formatRelativeTime(metrics.accountInfo.lastPayout)}`
                : "No payouts yet"}
            </span>
          </div>
        </div>
      </SectionCard>
      </motion.div>

      {/* Revenue vs Expenses Chart */}
      {metrics.revenueVsExpenses && metrics.revenueVsExpenses.length > 0 && (
        <SectionCard title="Revenue vs Expenses">
          <div style={{ width: '100%', height: '300px', minWidth: 0, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
              data={metrics.revenueVsExpenses}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6EE7FF"
                strokeWidth={2}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#F59E0B"
                strokeWidth={2}
                name="Expenses"
              />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}

      {/* Cash Flow Timeline */}
      {metrics.cashFlowTimeline && metrics.cashFlowTimeline.length > 0 && (
        <SectionCard title="Cash Flow Timeline">
          <div style={{ width: '100%', height: '300px', minWidth: 0, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
              data={metrics.cashFlowTimeline}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCashFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={metrics.cashFlowTimeline.some((item) => item.cashFlow < 0) ? "#F59E0B" : "#10B981"}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={metrics.cashFlowTimeline.some((item) => item.cashFlow < 0) ? "#F59E0B" : "#10B981"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area
                type="monotone"
                dataKey="cashFlow"
                stroke={
                  metrics.cashFlowTimeline.some((item) => item.cashFlow < 0)
                    ? "#F59E0B"
                    : "#10B981"
                }
                fillOpacity={1}
                fill="url(#colorCashFlow)"
              />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}

      {/* Invoice Status Breakdown & Payment Method Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics.invoiceStatusBreakdown && (
          <SectionCard title="Invoice Status Breakdown">
            <div style={{ width: '100%', height: '300px', minWidth: 0, minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                  data={[
                    {
                      name: "Paid",
                      value: metrics.invoiceStatusBreakdown.PAID || 0,
                    },
                    {
                      name: "Sent",
                      value: metrics.invoiceStatusBreakdown.SENT || 0,
                    },
                    {
                      name: "Overdue",
                      value: metrics.invoiceStatusBreakdown.OVERDUE || 0,
                    },
                    {
                      name: "Draft",
                      value: metrics.invoiceStatusBreakdown.DRAFT || 0,
                    },
                  ].filter((item) => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const { name, percent } = entry;
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: "Paid", color: "#10B981" },
                    { name: "Sent", color: "#6EE7FF" },
                    { name: "Overdue", color: "#EF4444" },
                    { name: "Draft", color: "#94a3b8" },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        )}

        {metrics.paymentMethodDistribution && (
          <SectionCard title="Payment Method Distribution">
            <div style={{ width: '100%', height: '300px', minWidth: 0, minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                  data={[
                    {
                      name: "Card",
                      value: metrics.paymentMethodDistribution.card || 0,
                    },
                    {
                      name: "Bank Transfer",
                      value: metrics.paymentMethodDistribution.bank_transfer || 0,
                    },
                    {
                      name: "Other",
                      value: metrics.paymentMethodDistribution.other || 0,
                    },
                  ].filter((item) => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  labelLine={false}
                  label={(entry: any) => {
                    const { name, percent } = entry;
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: "Card", color: "#6EE7FF" },
                    { name: "Bank Transfer", color: "#00D9FF" },
                    { name: "Other", color: "#94a3b8" },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        )}
      </div>

      {/* MRR Trend */}
      {metrics.mrrTrend && metrics.mrrTrend.length > 0 && (
        <SectionCard title="Monthly Recurring Revenue (MRR) Trend">
          <div style={{ width: '100%', height: '300px', minWidth: 0, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
              data={metrics.mrrTrend}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6EE7FF" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6EE7FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area
                type="monotone"
                dataKey="mrr"
                stroke="#6EE7FF"
                fillOpacity={1}
                fill="url(#colorMRR)"
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </SectionCard>
      )}

      {/* Recent Payouts */}
      {payouts.length > 0 && (
        <SectionCard title="Recent Payouts">
          <div className="space-y-2">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
              >
                <div>
                  <div className="text-white font-medium">
                    {formatCurrency(payout.amount)} {payout.currency}
                  </div>
                  <div className="text-xs text-slate-400">
                    {payout.arrivalDate.toLocaleDateString()} • {payout.status}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    payout.status === "paid"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : payout.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                  }`}
                >
                  {payout.status}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

