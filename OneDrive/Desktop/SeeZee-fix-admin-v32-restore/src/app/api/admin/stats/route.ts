import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const adminRoles = ["ADMIN", "CEO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];
    if (!adminRoles.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch comprehensive dashboard stats
    const [
      activeProjects,
      totalProjects,
      newLeads,
      totalLeads,
      openInvoices,
      totalInvoices,
      activePlans,
      totalMaintenance,
      openTasks,
      totalTasks,
      recentActivities,
    ] = await Promise.all([
      // Active projects (ACTIVE, REVIEW, DEPOSIT_PAID)
      prisma.project.count({
        where: {
          status: { in: ["ACTIVE", "REVIEW", "DEPOSIT_PAID"] },
        },
      }),
      // Total projects
      prisma.project.count(),
      // New leads
      prisma.lead.count({
        where: { status: "NEW" },
      }),
      // Total leads
      prisma.lead.count(),
      // Open invoices (SENT, OVERDUE, DRAFT)
      prisma.invoice.count({
        where: {
          status: { in: ["SENT", "OVERDUE", "DRAFT"] },
        },
      }),
      // Total invoices
      prisma.invoice.count(),
      // Active maintenance plans
      prisma.maintenanceSchedule.count({
        where: { status: "ACTIVE" },
      }),
      // Total maintenance schedules
      prisma.maintenanceSchedule.count(),
      // Open tasks (TODO, IN_PROGRESS)
      prisma.todo.count({
        where: {
          status: { in: ["TODO", "IN_PROGRESS"] },
        },
      }),
      // Total tasks
      prisma.todo.count(),
      // Recent activities (last 5)
      prisma.activity.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Calculate revenue stats
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [paidThisMonth, totalRevenue] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          status: "PAID",
          paidAt: { gte: firstOfMonth },
        },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { status: "PAID" },
        _sum: { total: true },
      }),
    ]);

    const stats = {
      projects: {
        active: activeProjects,
        total: totalProjects,
      },
      leads: {
        new: newLeads,
        total: totalLeads,
      },
      invoices: {
        open: openInvoices,
        total: totalInvoices,
        paidThisMonth: Number(paidThisMonth._sum.total || 0),
        totalRevenue: Number(totalRevenue._sum.total || 0),
      },
      maintenance: {
        active: activePlans,
        total: totalMaintenance,
      },
      tasks: {
        open: openTasks,
        total: totalTasks,
      },
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        createdAt: a.createdAt,
        user: a.user
          ? {
              id: a.user.id,
              name: a.user.name,
              email: a.user.email,
            }
          : null,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}