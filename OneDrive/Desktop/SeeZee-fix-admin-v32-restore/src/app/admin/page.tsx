/**
 * Admin Dashboard - SeeZee Studio Branded Dashboard
 * Main admin command center with stats, activities, tasks, and leads
 */

import { DashboardClient } from "@/components/admin/DashboardClient";
import { getPipeline, getProjects, getInvoices } from "@/server/actions/pipeline";
import { getTasks, getTaskStats } from "@/server/actions/tasks";
import { getActivityFeed } from "@/server/actions/activity";
import { getCurrentUser } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Get current user for personalized greeting
  const user = await getCurrentUser();

  // Fetch all data in parallel
  const [
    pipelineResult,
    projectsResult,
    invoicesResult,
    tasksResult,
    taskStatsResult,
    activityResult,
  ] = await Promise.all([
    getPipeline(),
    getProjects(),
    getInvoices(),
    getTasks(),
    getTaskStats(),
    getActivityFeed({ limit: 10 }),
  ]);

  const leads = pipelineResult.success ? pipelineResult.leads : [];
  const projects = projectsResult.success ? projectsResult.projects : [];
  const invoices = invoicesResult.success ? invoicesResult.invoices : [];
  const tasks = tasksResult.success ? tasksResult.tasks : [];
  const taskStats = taskStatsResult.success ? taskStatsResult.stats : { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };
  const activities = activityResult.success ? activityResult.activities : [];

  // Calculate stats
  const activeProjects = projects.filter((p) =>
    ["IN_PROGRESS", "ACTIVE", "DESIGN", "BUILD", "REVIEW"].includes(p.status)
  ).length;

  const paidInvoices = invoices.filter((inv) => inv.status === "PAID");
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  // Get unique clients from invoices and projects
  const clientIds = new Set<string>();
  invoices.forEach((inv) => {
    if (inv.organizationId) clientIds.add(inv.organizationId);
  });
  projects.forEach((proj) => {
    if (proj.organizationId) clientIds.add(proj.organizationId);
  });

  const unpaidInvoices = invoices.filter((inv) =>
    ["DRAFT", "SENT", "OVERDUE"].includes(inv.status)
  ).length;

  const stats = {
    activeProjects,
    totalRevenue,
    totalClients: clientIds.size,
    unpaidInvoices,
  };

  // Transform activities to match ActivityFeed format
  const transformedActivities = activities.map((activity) => ({
    id: activity.id,
    type: activity.type ? String(activity.type) : null,
    message: activity.title || activity.description || "",
    timestamp: activity.createdAt,
  }));

  // Get top tasks (high priority, not done)
  const topTasks = tasks
    .filter((task) => task.status !== "DONE")
    .sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      return bPriority - aPriority;
    })
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate 
        ? (typeof task.dueDate === 'string' ? task.dueDate : task.dueDate.toISOString())
        : null,
    }));

  // Get recent leads
  // Note: lead.createdAt is already a string from toPlain() serialization
  const recentLeads = leads.slice(0, 5).map((lead: any) => ({
    id: lead.id,
    company: lead.company,
    name: lead.name,
    status: lead.status,
    createdAt: lead.createdAt 
      ? (typeof lead.createdAt === 'string' ? lead.createdAt : lead.createdAt.toISOString())
      : null,
  }));

  // Calculate metrics
  const newLeads = leads.filter((lead: any) => lead.status === "NEW").length;
  const openTasks = tasks.filter((task: any) => task.status !== "DONE").length;
  const pipelineProjects = projects.filter((proj: any) =>
    ["LEAD", "PROPOSAL", "QUOTE"].includes(proj.status)
  ).length;

  const metrics = {
    newLeads,
    openTasks,
    pipelineProjects,
  };

  return (
    <DashboardClient
      userName={user?.name || user?.email || "there"}
      stats={stats}
      activities={transformedActivities}
      topTasks={topTasks}
      recentLeads={recentLeads}
      metrics={metrics}
    />
  );
}
