import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";
import { addHours, isPast, isFuture, isWithinInterval } from "date-fns";
import type { Alert, AlertType } from "@/components/admin/dashboard/AlertsPanel";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const alerts: Alert[] = [];
    const now = new Date();

    // 1. Overdue invoices
    const overdueInvoices = await db.invoice.findMany({
      where: {
        status: { in: ["SENT", "OVERDUE"] },
        dueDate: { lt: now },
      },
      include: {
        organization: { select: { name: true } },
      },
      take: 10,
      orderBy: { dueDate: "asc" },
    });

    for (const invoice of overdueInvoices) {
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      alerts.push({
        id: `invoice-${invoice.id}`,
        type: "overdue_invoice",
        title: `Invoice ${invoice.number} overdue`,
        description: `${invoice.organization.name} - $${Number(invoice.total).toLocaleString()} overdue by ${daysOverdue} day${daysOverdue !== 1 ? "s" : ""}`,
        severity: daysOverdue > 14 ? "critical" : "warning",
        link: `/admin/pipeline/invoices/${invoice.id}`,
        createdAt: invoice.dueDate,
      });
    }

    // 2. Tasks due soon (within 24 hours)
    const tasksDueSoon = await db.todo.findMany({
      where: {
        status: { not: "DONE" },
        dueDate: {
          gte: now,
          lte: addHours(now, 24),
        },
      },
      include: {
        project: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
      take: 5,
      orderBy: { dueDate: "asc" },
    });

    for (const task of tasksDueSoon) {
      alerts.push({
        id: `task-${task.id}`,
        type: "task_due",
        title: task.title,
        description: `${task.project?.name || "No project"} - Due soon${task.assignedTo ? ` (${task.assignedTo.name})` : ""}`,
        severity: "warning",
        link: `/admin/tasks/${task.id}`,
        createdAt: task.dueDate || task.createdAt,
      });
    }

    // 3. Overdue tasks
    const overdueTasks = await db.todo.findMany({
      where: {
        status: { not: "DONE" },
        dueDate: { lt: now },
      },
      include: {
        project: { select: { name: true } },
      },
      take: 5,
      orderBy: { dueDate: "asc" },
    });

    for (const task of overdueTasks) {
      alerts.push({
        id: `task-overdue-${task.id}`,
        type: "task_due",
        title: `${task.title} is overdue`,
        description: task.project?.name || "No project assigned",
        severity: "critical",
        link: `/admin/tasks/${task.id}`,
        createdAt: task.dueDate || task.createdAt,
      });
    }

    // 4. Projects needing attention (stuck in same status)
    const stuckProjects = await db.project.findMany({
      where: {
        status: { in: ["ACTIVE", "REVIEW"] },
        updatedAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Not updated in 7 days
        },
      },
      include: {
        organization: { select: { name: true } },
      },
      take: 3,
    });

    for (const project of stuckProjects) {
      alerts.push({
        id: `project-${project.id}`,
        type: "pending_approval",
        title: `Project needs attention`,
        description: `${project.name} (${project.organization.name}) - No updates in 7+ days`,
        severity: "warning",
        link: `/admin/projects/${project.id}`,
        createdAt: project.updatedAt,
      });
    }

    // 5. New leads not contacted
    const newLeads = await db.lead.findMany({
      where: {
        status: "NEW",
        createdAt: {
          lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Created 2+ days ago
        },
      },
      take: 5,
      orderBy: { createdAt: "asc" },
    });

    for (const lead of newLeads) {
      alerts.push({
        id: `lead-${lead.id}`,
        type: "new_message",
        title: `New lead needs follow-up`,
        description: `${lead.company || lead.name} - Not contacted yet`,
        severity: "info",
        link: `/admin/pipeline/leads/${lead.id}`,
        createdAt: lead.createdAt,
      });
    }

    // Sort alerts: critical first, then by date
    alerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      const aSeverity = severityOrder[a.severity];
      const bSeverity = severityOrder[b.severity];
      
      if (aSeverity !== bSeverity) return aSeverity - bSeverity;
      
      const aDate = typeof a.createdAt === "string" ? new Date(a.createdAt) : a.createdAt;
      const bDate = typeof b.createdAt === "string" ? new Date(b.createdAt) : b.createdAt;
      return bDate.getTime() - aDate.getTime();
    });

    return NextResponse.json({
      success: true,
      alerts: alerts.slice(0, 15), // Limit to 15 alerts
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

