"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiDollarSign,
  FiFileText,
  FiFolder,
  FiLayers,
  FiMessageSquare,
  FiTrendingUp,
  FiPlus,
  FiMail,
  FiMapPin,
  FiMic,
  FiPieChart,
  FiUsers,
} from "react-icons/fi";
import ActivityFeed, {
  ActivityItem,
} from "@/components/admin/dashboard/ActivityFeed";
import StatsCards, {
  AdminStats,
} from "@/components/admin/dashboard/StatsCards";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { AlertsPanel, Alert } from "@/components/admin/dashboard/AlertsPanel";

// Get current date formatted nicely
function getCurrentDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

interface DashboardTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string | null;
}

interface DashboardLead {
  id: string;
  company?: string | null;
  name?: string | null;
  status?: string | null;
  createdAt?: string | null;
}

interface DashboardClientProps {
  stats: AdminStats;
  activities: ActivityItem[];
  topTasks: DashboardTask[];
  recentLeads: DashboardLead[];
  metrics: {
    newLeads: number;
    openTasks: number;
    pipelineProjects: number;
  };
}

const quickActions = [
  {
    href: "/admin/pipeline",
    label: "View Pipeline",
    description: "Manage leads and track deal flow",
    icon: FiTrendingUp,
    accent: "from-trinity-red/20 via-trinity-red/10 to-transparent text-trinity-red",
  },
  {
    href: "/admin/leads/finder",
    label: "🗺️ Lead Finder",
    description: "Discover nonprofits that need websites",
    icon: FiMapPin,
    accent: "from-green-500/20 via-green-500/10 to-transparent text-green-400",
  },
  {
    href: "/admin/marketing",
    label: "📧 Email Marketing",
    description: "Create campaigns & templates",
    icon: FiMail,
    accent: "from-purple-500/20 via-purple-500/10 to-transparent text-purple-400",
  },
];

const moreFeatures = [
  {
    href: "/admin/analytics",
    label: "📊 Analytics",
    description: "Revenue, leads & metrics",
    icon: FiPieChart,
    accent: "from-cyan-500/20 via-cyan-500/10 to-transparent text-cyan-400",
  },
  {
    href: "/admin/team",
    label: "👥 Team",
    description: "Manage team & workload",
    icon: FiUsers,
    accent: "from-blue-500/20 via-blue-500/10 to-transparent text-blue-400",
  },
  {
    href: "/admin/recordings",
    label: "🎙️ Recordings",
    description: "AI transcription & summaries",
    icon: FiMic,
    accent: "from-pink-500/20 via-pink-500/10 to-transparent text-pink-400",
  },
  {
    href: "/admin/calendar",
    label: "📅 Calendar",
    description: "Schedule & meetings",
    icon: FiCalendar,
    accent: "from-amber-500/20 via-amber-500/10 to-transparent text-amber-400",
  },
  {
    href: "/admin/invoices",
    label: "💰 Invoices",
    description: "Billing & payments",
    icon: FiFileText,
    accent: "from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-400",
  },
  {
    href: "/admin/projects",
    label: "📁 Projects",
    description: "Active client work",
    icon: FiFolder,
    accent: "from-orange-500/20 via-orange-500/10 to-transparent text-orange-400",
  },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function DashboardClient({
  stats,
  activities,
  topTasks,
  recentLeads,
  metrics,
}: DashboardClientProps) {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(true);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);

  useEffect(() => {
    // Fetch revenue data
    async function fetchRevenue() {
      try {
        const res = await fetch("/api/admin/revenue?months=6");
        const data = await res.json();
        if (data.success) {
          setRevenueData(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch revenue:", error);
      } finally {
        setIsLoadingRevenue(false);
      }
    }

    // Fetch alerts
    async function fetchAlerts() {
      try {
        const res = await fetch("/api/admin/alerts");
        const data = await res.json();
        if (data.success) {
          setAlerts(data.alerts);
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      } finally {
        setIsLoadingAlerts(false);
      }
    }

    fetchRevenue();
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-10">
      <header className="space-y-4 relative">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">{getCurrentDate()}</p>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">Sean</span>
            </h1>
            <p className="text-base text-slate-400 max-w-xl">
              Here's what's happening with your projects and clients today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/projects"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#ef4444] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ef4444]/25 transition-all duration-200 hover:bg-[#dc2626] hover:shadow-xl hover:shadow-[#ef4444]/30 hover:-translate-y-0.5"
            >
              <FiPlus className="h-4 w-4" />
              New Project
            </Link>
            <Link
              href="/admin/pipeline"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 hover:border-white/20"
            >
              View Pipeline
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <StatsCards stats={stats} />

      {/* Revenue Chart */}
      <RevenueChart data={revenueData} isLoading={isLoadingRevenue} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <ActivityFeed activities={activities} />

          <section className="rounded-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-[#22d3ee]/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-heading font-semibold text-white">Top Tasks</h2>
                <p className="text-sm text-slate-400">High-priority assignments needing attention</p>
              </div>
              <Link
                href="/admin/tasks"
                className="text-sm text-[#22d3ee] transition hover:text-[#06b6d4] font-semibold"
              >
                View all →
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {topTasks.length > 0 ? (
                topTasks.map((task) => {
                  const statusLabel =
                    task.status === "DONE"
                      ? "Completed"
                      : task.status === "IN_PROGRESS"
                      ? "In Progress"
                      : "To Do";

                  return (
                    <motion.div
                      key={task.id}
                      whileHover={{ y: -4 }}
                      className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0f172a]/60 p-4 transition-all duration-200 hover:border-white/20 hover:bg-[#1e293b]/60"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/admin/tasks/${task.id}`}
                          className="text-sm font-semibold text-white hover:text-[#22d3ee] transition"
                        >
                          {task.title}
                        </Link>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                          task.priority === "HIGH" 
                            ? "bg-[#ef4444]/20 text-[#f87171] border-[#ef4444]/30" 
                            : task.priority === "MEDIUM"
                            ? "bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b]/30"
                            : "bg-[#22d3ee]/20 text-[#22d3ee] border-[#22d3ee]/30"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-300">
                          <FiClipboard className="h-3.5 w-3.5" />
                          {statusLabel}
                        </span>
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1">
                            <FiCalendar className="h-3.5 w-3.5" />
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-[#0f172a]/40 p-8 text-center text-sm text-slate-400">
                  No active tasks — looks like you're all caught up!
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
            <h2 className="text-xl font-heading font-semibold text-white">Quick Actions</h2>
            <p className="text-sm text-slate-400">Essential workflows, one tap away</p>
            <div className="mt-5 space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f172a]/60 p-4 transition-all duration-200 hover:border-[#ef4444]/40 hover:bg-[#1e293b]/60 hover:-translate-y-1"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#ef4444]/20 to-[#ef4444]/10 border border-[#ef4444]/30">
                      <Icon className="h-5 w-5 text-[#ef4444]" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white group-hover:text-[#ef4444] transition">
                        {action.label}
                      </p>
                      <p className="text-xs text-slate-400">{action.description}</p>
                    </div>
                    <FiArrowRight className="h-4 w-4 text-slate-500 transition group-hover:text-[#ef4444] group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* More Features Grid */}
          <section className="rounded-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
            <h2 className="text-xl font-heading font-semibold text-white">More Features</h2>
            <p className="text-sm text-slate-400 mb-4">New tools and capabilities</p>
            <div className="grid grid-cols-2 gap-3">
              {moreFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link
                    key={feature.href}
                    href={feature.href}
                    className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-[#0f172a]/60 p-4 transition-all duration-200 hover:border-white/20 hover:bg-[#1e293b]/60 hover:-translate-y-1 text-center"
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${feature.accent} border border-white/10`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="text-xs font-semibold text-white group-hover:text-cyan-400 transition">
                      {feature.label}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
            <h2 className="text-xl font-heading font-semibold text-white">Pipeline Snapshot</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <div className="p-1.5 rounded-lg bg-[#22d3ee]/20">
                    <FiMessageSquare className="h-4 w-4 text-[#22d3ee]" />
                  </div>
                  New Leads
                </span>
                <span className="font-bold text-xl text-white">{metrics.newLeads}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <div className="p-1.5 rounded-lg bg-[#10b981]/20">
                    <FiCheckCircle className="h-4 w-4 text-[#10b981]" />
                  </div>
                  Active Tasks
                </span>
                <span className="font-bold text-xl text-white">{metrics.openTasks}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <div className="p-1.5 rounded-lg bg-[#3b82f6]/20">
                    <FiLayers className="h-4 w-4 text-[#3b82f6]" />
                  </div>
                  Projects in Pipeline
                </span>
                <span className="font-bold text-xl text-white">{metrics.pipelineProjects}</span>
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-[#0f172a]/60 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold">
                Recent Leads
              </p>
              <div className="mt-3 space-y-2">
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2.5 text-xs"
                    >
                      <div className="flex-1 truncate text-white">
                        {lead.company || lead.name || "Unknown"}
                      </div>
                      <span className={`ml-3 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide font-medium ${
                        lead.status === "NEW" 
                          ? "bg-[#22d3ee]/20 text-[#22d3ee]" 
                          : lead.status === "QUALIFIED"
                          ? "bg-[#10b981]/20 text-[#10b981]"
                          : "bg-white/10 text-slate-400"
                      }`}>
                        {lead.status ?? "NEW"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No recent leads</p>
                )}
              </div>
            </div>
          </section>

          {/* Alerts Panel */}
          <AlertsPanel alerts={alerts} isLoading={isLoadingAlerts} />

          <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#10b981]/20">
                <FiDollarSign className="h-5 w-5 text-[#10b981]" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-semibold text-white">Revenue Pulse</h2>
                <p className="text-sm text-slate-400">Track your earnings</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Paid this month</p>
                <p className="text-3xl font-bold text-[#10b981]">
                  {currencyFormatter.format(stats.totalRevenue ?? 0)}
                </p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-slate-400">Open invoices</span>
                <span className="font-bold text-lg text-white">{stats.unpaidInvoices ?? 0}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DashboardClient;
