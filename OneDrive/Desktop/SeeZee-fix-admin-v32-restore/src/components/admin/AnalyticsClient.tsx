"use client";

import { motion } from "framer-motion";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatCard } from "@/components/admin/StatCard";
import { BarChart3, TrendingUp, Users, DollarSign, Crown } from "lucide-react";
import { formatCurrency } from "@/lib/ui";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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

interface AnalyticsClientProps {
  metrics: any;
}

export function AnalyticsClient({ metrics }: AnalyticsClientProps) {
  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Analytics</h1>
          <p className="admin-page-subtitle">
            Executive insights and business metrics
          </p>
        </div>
        <div className="text-center py-12 text-slate-500">
          No data available
        </div>
      </div>
    );
  }

  const completionRate =
    metrics.projects.total > 0
      ? (metrics.projects.completed / metrics.projects.total) * 100
      : 0;

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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        
        {/* Animated glow orbs */}
        <motion.div 
          className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl"
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
          className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/30 rounded-full blur-3xl"
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

        <div className="relative z-10 p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500"
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Analytics
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-[60px]">
            Executive insights and business metrics
          </p>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <StatCard
          label="Total Revenue"
          value={formatCurrency(metrics.revenue.total)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{
            value: Math.round(metrics.revenue.trend),
            label: "vs last period",
          }}
        />
        <StatCard
          label="Active Projects"
          value={metrics.projects.active}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Conversion Rate"
          value={`${Math.round(metrics.leads.conversionRate)}%`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Avg Project Value"
          value={formatCurrency(metrics.projects.avgValue)}
          icon={<BarChart3 className="w-5 h-5" />}
        />
      </motion.div>

      {/* Revenue Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SectionCard title="Revenue Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-slate-400 mb-2">Total Received</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(metrics.revenue.total)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Pending Payments</p>
            <p className="text-2xl font-bold text-yellow-400">
              {formatCurrency(metrics.revenue.pending)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Last 30 Days</p>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(metrics.revenue.recent)}
            </p>
          </div>
        </div>
      </SectionCard>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-6"
      >
        <SectionCard title="Project Performance">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">In Progress</span>
              <span className="text-lg font-semibold text-white">
                {metrics.projects.active}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Completed</span>
              <span className="text-lg font-semibold text-white">
                {metrics.projects.completed}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <span className="text-sm text-slate-400">Completion Rate</span>
              <span className="text-lg font-semibold text-green-400">
                {Math.round(completionRate)}%
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Task Productivity">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Tasks</span>
              <span className="text-lg font-semibold text-white">
                {metrics.tasks.total}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Completed</span>
              <span className="text-lg font-semibold text-white">
                {metrics.tasks.completed}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <span className="text-sm text-slate-400">Completion Rate</span>
              <span className="text-lg font-semibold text-green-400">
                {Math.round(metrics.tasks.completionRate)}%
              </span>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* Revenue Over Time Chart */}
      {metrics.revenue?.overTime && metrics.revenue.overTime.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SectionCard title="Revenue Over Time">
          <div style={{ width: '100%', height: '300px', minWidth: 0, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={metrics.revenue.overTime}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="revenue"
                stroke="#6EE7FF"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        </motion.div>
      )}

      {/* Project Status Breakdown */}
      {metrics.projects?.statusBreakdown && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <SectionCard title="Project Status Breakdown">
            <div style={{ width: '100%', height: '300px', minWidth: 0, minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                  data={[
                    {
                      name: "Planning",
                      value: metrics.projects.statusBreakdown.PLANNING || 0,
                    },
                    {
                      name: "In Progress",
                      value: metrics.projects.statusBreakdown.IN_PROGRESS || 0,
                    },
                    {
                      name: "On Hold",
                      value: metrics.projects.statusBreakdown.ON_HOLD || 0,
                    },
                    {
                      name: "Completed",
                      value: metrics.projects.statusBreakdown.COMPLETED || 0,
                    },
                    {
                      name: "Cancelled",
                      value: metrics.projects.statusBreakdown.CANCELLED || 0,
                    },
                  ].filter((item) => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => {
                    const percent = props.percent || 0;
                    const name = props.name || '';
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: "Planning", color: "#6EE7FF" },
                    { name: "In Progress", color: "#00D9FF" },
                    { name: "On Hold", color: "#F59E0B" },
                    { name: "Completed", color: "#10B981" },
                    { name: "Cancelled", color: "#EF4444" },
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

          {/* Monthly Comparison Chart */}
          {metrics.revenue?.monthlyComparison && (
            <SectionCard title="Monthly Revenue Comparison">
              <div style={{ width: '100%', height: '300px', minWidth: 0, minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                  data={[
                    {
                      name: metrics.revenue.monthlyComparison.previousMonth,
                      revenue: metrics.revenue.monthlyComparison.previous,
                    },
                    {
                      name: metrics.revenue.monthlyComparison.currentMonth,
                      revenue: metrics.revenue.monthlyComparison.current,
                    },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="name"
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
                  <Bar dataKey="revenue" fill="#6EE7FF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          )}
        </motion.div>
      )}

      {/* Lead Funnel Visualization */}
      {metrics.leads?.statusBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <SectionCard title="Lead Funnel">
          <div className="space-y-4">
            <div style={{ width: '100%', height: '300px', minWidth: 0, minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                data={[
                  {
                    stage: "New",
                    count: metrics.leads.statusBreakdown.NEW || 0,
                  },
                  {
                    stage: "Contacted",
                    count: metrics.leads.statusBreakdown.CONTACTED || 0,
                  },
                  {
                    stage: "Qualified",
                    count: metrics.leads.statusBreakdown.QUALIFIED || 0,
                  },
                  {
                    stage: "Proposal",
                    count: metrics.leads.statusBreakdown.PROPOSAL || 0,
                  },
                  {
                    stage: "Converted",
                    count: metrics.leads.statusBreakdown.CONVERTED || 0,
                  },
                  {
                    stage: "Lost",
                    count: metrics.leads.statusBreakdown.LOST || 0,
                  },
                ].filter((item) => item.count > 0)}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#6EE7FF" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <span className="text-sm text-slate-400">Total Leads</span>
              <span className="text-white font-medium">{metrics.leads.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Converted</span>
              <span className="text-white font-medium">
                {metrics.leads.converted}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${metrics.leads.conversionRate}%` }}
              >
                {Math.round(metrics.leads.conversionRate)}%
              </div>
            </div>
          </div>
        </SectionCard>
        </motion.div>
      )}
    </div>
  );
}
