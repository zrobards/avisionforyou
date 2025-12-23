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

    // Get query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");
    const assignedToRole = searchParams.get("assignedToRole");
    const assignedToTeamId = searchParams.get("assignedToTeamId");
    const limit = searchParams.get("limit");

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (assignedTo === "me" && session.user.id) {
      where.assignedToId = session.user.id;
    } else if (assignedTo) {
      where.assignedToId = assignedTo;
    }
    if (assignedToRole) {
      where.assignedToRole = assignedToRole;
    }
    if (assignedToTeamId) {
      where.assignedToTeamId = assignedToTeamId;
    }

    // Fetch tasks
    const tasks = await prisma.todo.findMany({
      where,
      ...(limit && { take: parseInt(limit, 10) }),
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        // changeRequest: {
        //   select: {
        //     id: true,
        //     status: true,
        //     category: true,
        //     priority: true,
        //   },
        // },
      },
      orderBy: [
        { priority: "desc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    });

    // Calculate stats
    const stats = {
      total: await prisma.todo.count({ where }),
      todo: await prisma.todo.count({ where: { ...where, status: "TODO" } }),
      inProgress: await prisma.todo.count({ where: { ...where, status: "IN_PROGRESS" } }),
      done: await prisma.todo.count({ where: { ...where, status: "DONE" } }),
      overdue: await prisma.todo.count({
        where: {
          ...where,
          status: { not: "DONE" },
          dueDate: { lt: new Date() },
        },
      }),
    };

    return NextResponse.json({
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        completedAt: t.completedAt,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        assignedTo: t.assignedTo,
        assignedToRole: (t as any).assignedToRole,
        assignedToTeamId: (t as any).assignedToTeamId,
        changeRequestId: (t as any).changeRequestId,
        column: (t as any).column || "todo",
        position: (t as any).position || 0,
        estimatedHours: (t as any).estimatedHours,
        actualHours: (t as any).actualHours,
        createdBy: t.createdBy,
        project: (t as any).project,
        // changeRequest: (t as any).changeRequest,
      })),
      stats,
    });
  } catch (error) {
    console.error("[GET /api/admin/tasks]", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

