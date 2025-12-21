import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  Send,
  MousePointer,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Only CEO/CFO can access analytics
  const allowedRoles = [ROLE.CEO, ROLE.CFO];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Get date ranges
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Revenue this month
  const revenueThisMonth = await prisma.invoice.aggregate({
    where: {
      status: "PAID",
      paidAt: { gte: startOfMonth },
    },
    _sum: { total: true },
  });

  // Revenue last month
  const revenueLastMonth = await prisma.invoice.aggregate({
    where: {
      status: "PAID",
      paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
    },
    _sum: { total: true },
  });

  // New leads this month
  const leadsThisMonth = await prisma.lead.count({
    where: { createdAt: { gte: startOfMonth } },
  });

  // Leads last month
  const leadsLastMonth = await prisma.lead.count({
    where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
  });

  // Active projects
  const activeProjects = await prisma.project.count({
    where: { status: { in: ["ACTIVE", "DEPOSIT_PAID", "REVIEW"] } },
  });

  // Completed projects this month
  const completedProjects = await prisma.project.count({
    where: {
      status: "COMPLETED",
      updatedAt: { gte: startOfMonth },
    },
  });

  // Total clients
  const totalClients = await prisma.user.count({
    where: { role: "CLIENT" },
  });

  // New clients this month
  const newClients = await prisma.user.count({
    where: {
      role: "CLIENT",
      createdAt: { gte: startOfMonth },
    },
  });

  // Tasks stats
  const tasksCompleted = await prisma.todo.count({
    where: {
      status: "DONE",
      updatedAt: { gte: startOfMonth },
    },
  });

  const tasksPending = await prisma.todo.count({
    where: { status: { not: "DONE" } },
  });

  // AI Conversations
  const chatConversations = await prisma.aIConversation.count({
    where: { createdAt: { gte: startOfMonth } },
  });

  // Email campaigns stats
  const emailCampaigns = await prisma.emailCampaign.aggregate({
    where: { createdAt: { gte: startOfMonth } },
    _sum: {
      totalSent: true,
      opened: true,
      clicked: true,
    },
  });

  // Calculate changes
  const revenueChange = calculateChange(
    Number(revenueThisMonth._sum.total || 0),
    Number(revenueLastMonth._sum.total || 0)
  );
  const leadsChange = calculateChange(leadsThisMonth, leadsLastMonth);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Business performance and metrics overview
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-800 border border-white/10 text-white rounded-lg hover:bg-slate-700 transition-colors">
            This Month
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Revenue"
          value={`$${(Number(revenueThisMonth._sum.total || 0) / 100).toLocaleString()}`}
          change={revenueChange}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          label="New Leads"
          value={leadsThisMonth.toString()}
          change={leadsChange}
          icon={Users}
          color="blue"
        />
        <MetricCard
          label="Active Projects"
          value={activeProjects.toString()}
          subtext={`${completedProjects} completed this month`}
          icon={Briefcase}
          color="purple"
        />
        <MetricCard
          label="Total Clients"
          value={totalClients.toString()}
          subtext={`+${newClients} this month`}
          icon={Users}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Revenue Trend
          </h3>
          <div className="h-64 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Revenue chart visualization</p>
              <p className="text-sm">Add Recharts for interactive charts</p>
            </div>
          </div>
        </div>

        {/* Leads Funnel */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Lead Funnel
          </h3>
          <div className="space-y-3">
            {await getLeadFunnel()}
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SmallMetricCard
          label="Tasks Completed"
          value={tasksCompleted}
          subtext="This month"
          icon={CheckCircle}
        />
        <SmallMetricCard
          label="Tasks Pending"
          value={tasksPending}
          subtext="Total open"
          icon={Clock}
        />
        <SmallMetricCard
          label="AI Chats"
          value={chatConversations}
          subtext="This month"
          icon={MousePointer}
        />
        <SmallMetricCard
          label="Emails Sent"
          value={emailCampaigns._sum.totalSent || 0}
          subtext={`${emailCampaigns._sum.opened || 0} opened`}
          icon={Send}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              Recent Projects
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {await getRecentProjects()}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Recent Leads
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {await getRecentLeads()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate percentage change
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Metric Card Component
function MetricCard({
  label,
  value,
  change,
  subtext,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  change?: number;
  subtext?: string;
  icon: any;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    green: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    blue: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
    purple: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    amber: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  };

  const iconColors: Record<string, string> = {
    green: "text-green-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
  };

  return (
    <div className={`p-6 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <ArrowUp className="w-4 h-4 text-green-400" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-400" />
              )}
              <span className={change >= 0 ? "text-green-400" : "text-red-400"}>
                {Math.abs(change)}%
              </span>
              <span className="text-slate-500 text-sm">vs last month</span>
            </div>
          )}
          {subtext && <p className="text-slate-500 text-sm mt-2">{subtext}</p>}
        </div>
        <Icon className={`w-8 h-8 ${iconColors[color]} opacity-80`} />
      </div>
    </div>
  );
}

// Small Metric Card
function SmallMetricCard({
  label,
  value,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: number;
  subtext: string;
  icon: any;
}) {
  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-slate-400" />
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-xs text-slate-500">{subtext}</p>
        </div>
      </div>
    </div>
  );
}

// Get lead funnel data
async function getLeadFunnel() {
  const stages = await prisma.lead.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const stageLabels: Record<string, { label: string; color: string }> = {
    NEW: { label: "New Leads", color: "bg-blue-500" },
    CONTACTED: { label: "Contacted", color: "bg-amber-500" },
    QUALIFIED: { label: "Qualified", color: "bg-purple-500" },
    CONVERTED: { label: "Converted", color: "bg-green-500" },
    LOST: { label: "Lost", color: "bg-slate-500" },
  };

  const total = stages.reduce((sum, s) => sum + s._count.id, 0) || 1;

  return stages.map((stage) => {
    const info = stageLabels[stage.status] || { label: stage.status, color: "bg-slate-500" };
    const percentage = Math.round((stage._count.id / total) * 100);

    return (
      <div key={stage.status} className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">{info.label}</span>
          <span className="text-white font-medium">{stage._count.id}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${info.color} transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  });
}

// Get recent projects
async function getRecentProjects() {
  const projects = await prisma.project.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      updatedAt: true,
    },
  });

  if (projects.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No projects yet</p>
      </div>
    );
  }

  return projects.map((project) => (
    <Link
      key={project.id}
      href={`/admin/projects/${project.id}`}
      className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
    >
      <div>
        <p className="text-white font-medium">{project.name}</p>
        <p className="text-sm text-slate-500">
          Updated {new Date(project.updatedAt).toLocaleDateString()}
        </p>
      </div>
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          project.status === "COMPLETED"
            ? "bg-green-500/20 text-green-400"
            : project.status === "ACTIVE" || project.status === "DEPOSIT_PAID" || project.status === "REVIEW"
            ? "bg-blue-500/20 text-blue-400"
            : "bg-slate-500/20 text-slate-400"
        }`}
      >
        {project.status}
      </span>
    </Link>
  ));
}

// Get recent leads
async function getRecentLeads() {
  const leads = await prisma.lead.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      source: true,
      createdAt: true,
    },
  });

  if (leads.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No leads yet</p>
      </div>
    );
  }

  return leads.map((lead) => (
    <Link
      key={lead.id}
      href={`/admin/leads/${lead.id}`}
      className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
    >
      <div>
        <p className="text-white font-medium">{lead.name || lead.email}</p>
        <p className="text-sm text-slate-500">
          {lead.source || "Unknown source"} •{" "}
          {new Date(lead.createdAt).toLocaleDateString()}
        </p>
      </div>
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          lead.status === "CONVERTED"
            ? "bg-green-500/20 text-green-400"
            : lead.status === "NEW"
            ? "bg-blue-500/20 text-blue-400"
            : lead.status === "QUALIFIED"
            ? "bg-purple-500/20 text-purple-400"
            : "bg-slate-500/20 text-slate-400"
        }`}
      >
        {lead.status}
      </span>
    </Link>
  ));
}
