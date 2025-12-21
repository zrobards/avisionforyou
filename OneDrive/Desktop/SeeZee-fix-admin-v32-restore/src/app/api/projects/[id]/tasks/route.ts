import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    const tasks = await db.todo.findMany({
      where: { projectId },
      include: {
        assignedTo: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: [{ column: "asc" }, { position: "asc" }],
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: projectId } = await params;
    const body = await request.json();

    // Get max position for column
    const maxPositionTask = await db.todo.findFirst({
      where: { projectId, column: body.column || "todo" },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = (maxPositionTask?.position ?? -1) + 1;

    const task = await db.todo.create({
      data: {
        title: body.title,
        description: body.description || null,
        priority: body.priority || "MEDIUM",
        status: mapColumnToStatus(body.column || "todo"),
        column: body.column || "todo",
        position: newPosition,
        projectId,
        createdById: session.user.id,
        assignedToId: body.assignedToId || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        estimatedHours: body.estimatedHours || null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        column: task.column,
        position: task.position,
        dueDate: task.dueDate?.toISOString() || null,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        assignedTo: task.assignedTo,
        dependencies: task.dependencies,
        attachments: task.attachments,
        createdAt: task.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

function mapColumnToStatus(column: string): "TODO" | "IN_PROGRESS" | "SUBMITTED" | "DONE" {
  switch (column) {
    case "todo":
      return "TODO";
    case "in-progress":
      return "IN_PROGRESS";
    case "review":
      return "SUBMITTED";
    case "done":
      return "DONE";
    default:
      return "TODO";
  }
}

