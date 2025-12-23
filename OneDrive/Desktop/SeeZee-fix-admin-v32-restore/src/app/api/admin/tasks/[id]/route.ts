import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/admin/tasks/[id]
 * Update a task
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();

    // Map status to column if needed
    const statusToColumn: Record<string, string> = {
      TODO: "todo",
      IN_PROGRESS: "in-progress",
      SUBMITTED: "review",
      DONE: "done",
    };

    const updateData: any = {};
    
    if (body.status) {
      updateData.status = body.status;
      if (statusToColumn[body.status]) {
        updateData.column = statusToColumn[body.status];
      }
    }
    if (body.column !== undefined) {
      updateData.column = body.column;
    }
    if (body.position !== undefined) {
      updateData.position = body.position;
    }
    if (body.assignedToId !== undefined) {
      updateData.assignedToId = body.assignedToId;
    }
    if (body.assignedToRole !== undefined) {
      updateData.assignedToRole = body.assignedToRole;
    }
    if (body.assignedToTeamId !== undefined) {
      updateData.assignedToTeamId = body.assignedToTeamId;
    }
    if (body.priority !== undefined) {
      updateData.priority = body.priority;
    }
    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }
    if (body.estimatedHours !== undefined) {
      updateData.estimatedHours = body.estimatedHours;
    }
    if (body.actualHours !== undefined) {
      updateData.actualHours = body.actualHours;
    }
    if (body.completedAt !== undefined && body.status === "DONE") {
      updateData.completedAt = new Date();
    }

    const task = await prisma.todo.update({
      where: { id },
      data: updateData,
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
    });

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        assignedTo: task.assignedTo,
        assignedToRole: (task as any).assignedToRole,
        assignedToTeamId: (task as any).assignedToTeamId,
        changeRequestId: (task as any).changeRequestId,
        column: (task as any).column || "todo",
        position: (task as any).position || 0,
        estimatedHours: (task as any).estimatedHours,
        actualHours: (task as any).actualHours,
        createdBy: task.createdBy,
        project: (task as any).project,
        // changeRequest: (task as any).changeRequest,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/admin/tasks/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

