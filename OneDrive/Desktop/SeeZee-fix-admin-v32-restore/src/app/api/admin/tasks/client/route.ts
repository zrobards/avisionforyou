"use server";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createTaskAssignedNotification } from "@/lib/notifications";
import { handleCors, addCorsHeaders } from "@/lib/cors";

const VALID_STATUSES = new Set(["pending", "in_progress", "completed"]);

export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 200 });
}

/**
 * GET /api/admin/tasks/client
 * Get all client tasks for a project (or all projects)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Check if user has admin role
    const adminRoles = ["ADMIN", "CEO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];
    if (!adminRoles.includes(session.user.role || "")) {
      const response = NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const where: any = {
      assignedToClient: true,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (status && VALID_STATUSES.has(status)) {
      where.status = status;
    }

    const tasks = await prisma.clientTask.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const response = NextResponse.json({ tasks });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("[GET /api/admin/tasks/client]", error);
    const response = NextResponse.json(
      { error: "Failed to fetch client tasks" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}

/**
 * POST /api/admin/tasks/client
 * Create a new client task
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Check if user has admin role
    const adminRoles = ["ADMIN", "CEO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];
    if (!adminRoles.includes(session.user.role || "")) {
      const response = NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const body = await req.json();
    const { projectId, title, description, type, dueDate, requiresUpload, attachments } = body as {
      projectId?: string;
      title?: string;
      description?: string;
      type?: string;
      dueDate?: string;
      requiresUpload?: boolean;
      attachments?: string[];
    };

    if (!projectId || !title || !description) {
      const response = NextResponse.json(
        { error: "projectId, title, and description are required" },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        organizationId: true,
        organization: {
          select: {
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      const response = NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Get client user ID from organization members
    const clientUserId = project.organization.members[0]?.userId;
    if (!clientUserId) {
      const response = NextResponse.json(
        { error: "No client found for this project" },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Create the task with attachments stored in data field
    const task = await prisma.clientTask.create({
      data: {
        projectId,
        title,
        description,
        type: type || "general",
        status: "pending",
        dueDate: dueDate ? new Date(dueDate) : null,
        requiresUpload: requiresUpload || false,
        assignedToClient: true,
        createdById: session.user.id,
        data: attachments && attachments.length > 0 ? { attachments } : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for the client
    await createTaskAssignedNotification(
      clientUserId,
      task.id,
      projectId,
      title
    );

    const response = NextResponse.json({ task });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("[POST /api/admin/tasks/client]", error);
    const response = NextResponse.json(
      { error: "Failed to create client task" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}

/**
 * PATCH /api/admin/tasks/client
 * Update a client task
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Check if user has admin role
    const adminRoles = ["ADMIN", "CEO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];
    if (!adminRoles.includes(session.user.role || "")) {
      const response = NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const body = await req.json();
    const { taskId, title, description, status, dueDate, requiresUpload } = body as {
      taskId?: string;
      title?: string;
      description?: string;
      status?: string;
      dueDate?: string;
      requiresUpload?: boolean;
    };

    if (!taskId) {
      const response = NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Verify task exists
    const existingTask = await prisma.clientTask.findUnique({
      where: { id: taskId },
      select: { id: true, projectId: true },
    });

    if (!existingTask) {
      const response = NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined && VALID_STATUSES.has(status)) {
      updateData.status = status;
      if (status === "completed") {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (requiresUpload !== undefined) updateData.requiresUpload = requiresUpload;

    const updatedTask = await prisma.clientTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const response = NextResponse.json({ task: updatedTask });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("[PATCH /api/admin/tasks/client]", error);
    const response = NextResponse.json(
      { error: "Failed to update client task" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}

/**
 * DELETE /api/admin/tasks/client
 * Delete a client task
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Check if user has admin role
    const adminRoles = ["ADMIN", "CEO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];
    if (!adminRoles.includes(session.user.role || "")) {
      const response = NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      const response = NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Verify task exists
    const task = await prisma.clientTask.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      const response = NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    await prisma.clientTask.delete({
      where: { id: taskId },
    });

    const response = NextResponse.json({ success: true });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("[DELETE /api/admin/tasks/client]", error);
    const response = NextResponse.json(
      { error: "Failed to delete client task" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}




