import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true },
    });

    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { taskId } = await params;
    const body = await request.json();
    const { hours, startedAt, endedAt, description } = body;

    // Create time log
    const timeLog = await db.timeLog.create({
      data: {
        todoId: taskId,
        hoursSpent: hours,
        description: description || null,
        performedBy: session.user.id,
        startedAt: startedAt ? new Date(startedAt) : null,
        endedAt: endedAt ? new Date(endedAt) : null,
      },
    });

    // Update task's actual hours
    const task = await db.todo.findUnique({
      where: { id: taskId },
      select: { actualHours: true },
    });

    await db.todo.update({
      where: { id: taskId },
      data: {
        actualHours: (task?.actualHours || 0) + hours,
      },
    });

    return NextResponse.json({
      success: true,
      timeLog: {
        id: timeLog.id,
        hoursSpent: timeLog.hoursSpent,
        createdAt: timeLog.createdAt,
      },
    });
  } catch (error) {
    console.error("Error logging time:", error);
    return NextResponse.json(
      { error: "Failed to log time" },
      { status: 500 }
    );
  }
}

