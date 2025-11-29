"use server";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildClientProjectWhere,
  getClientProjectOrThrow,
} from "@/lib/client-access";
import { ClientAccessError } from "@/lib/client-access-types";
import { handleCors, addCorsHeaders } from "@/lib/cors";
import type { Prisma } from "@prisma/client";

const VALID_STATUSES = new Set(["pending", "in_progress", "completed"]);

export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 200 });
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    const identity = { userId: session.user.id, email: session.user.email };
    const accessWhere = await buildClientProjectWhere(identity);
    const orConditions =
      "OR" in accessWhere && Array.isArray(accessWhere.OR)
        ? accessWhere.OR
        : [];

    if (orConditions.length === 0) {
      const response = NextResponse.json({
        tasks: [],
        summary: {
          total: 0,
          pending: 0,
          in_progress: 0,
          completed: 0,
        },
      });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const projects = await prisma.project.findMany({
      where: accessWhere,
      select: {
        id: true,
        name: true,
      },
    });

    const projectIds = projects.map((project) => project.id);

    if (projectIds.length === 0) {
      const response = NextResponse.json({
        tasks: [],
        summary: {
          total: 0,
          pending: 0,
          in_progress: 0,
          completed: 0,
        },
      });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const where: Prisma.ClientTaskWhereInput = {
      projectId: {
        in: projectIds,
      },
    };

    if (statusParam && VALID_STATUSES.has(statusParam)) {
      where.status = statusParam;
    }

    const tasks = await prisma.clientTask.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        type: true,
        dueDate: true,
        completedAt: true,
        requiresUpload: true,
        submissionNotes: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const summary = tasks.reduce(
      (acc, task) => {
        acc.total += 1;
        const key = task.status as keyof typeof acc;
        if (key in acc) {
          acc[key] += 1;
        }
        return acc;
      },
      {
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
      }
    );

    const response = NextResponse.json({
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        type: task.type,
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        requiresUpload: task.requiresUpload,
        submissionNotes: task.submissionNotes,
        createdAt: task.createdAt,
        project: task.project,
      })),
      summary,
    });

    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("[GET /api/client/tasks]", error);
    const response = NextResponse.json(
      { error: "Failed to fetch client tasks" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const body = await req.json();
    const { taskId, status, submissionNotes, fileUrl } = body as {
      taskId?: string;
      status?: string;
      submissionNotes?: string;
      fileUrl?: string;
    };

    if (!taskId || !status || !VALID_STATUSES.has(status)) {
      const response = NextResponse.json(
        { error: "Invalid task update payload" },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const task = await prisma.clientTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        projectId: true,
      },
    });

    if (!task) {
      const response = NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    try {
      await getClientProjectOrThrow(
        { userId: session.user.id, email: session.user.email },
        task.projectId,
        { select: { id: true } }
      );
    } catch (error) {
      if (error instanceof ClientAccessError) {
        const response = NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
        return addCorsHeaders(response, req.headers.get("origin"));
      }
      throw error;
    }

    const updateData: any = {
      status,
      completedAt: status === "completed" ? new Date() : null,
    };

    if (submissionNotes !== undefined) {
      updateData.submissionNotes = submissionNotes;
    }

    // If file URL is provided, store it in the data JSON field
    if (fileUrl) {
      updateData.data = { fileUrl };
    }

    const updatedTask = await prisma.clientTask.update({
      where: { id: taskId },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        type: true,
        dueDate: true,
        completedAt: true,
        requiresUpload: true,
        submissionNotes: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create notification when task is completed
    if (status === "completed") {
      const { createTaskCompletedNotification, notifyProjectAdmins } = await import("@/lib/notifications");
      const project = await prisma.project.findUnique({
        where: { id: task.projectId },
        select: { assigneeId: true },
      });
      
      if (project?.assigneeId) {
        await createTaskCompletedNotification(
          project.assigneeId,
          taskId,
          task.projectId,
          updatedTask.title,
          session.user.name || undefined
        );
      }
      
      await notifyProjectAdmins(
        task.projectId,
        updatedTask.title,
        session.user.name || undefined
      );
    }

    const response = NextResponse.json({ task: updatedTask });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("[PATCH /api/client/tasks]", error);
    const response = NextResponse.json(
      { error: "Failed to update client task" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}

