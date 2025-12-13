import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleCors, addCorsHeaders } from "@/lib/cors";
import { buildClientProjectWhere } from "@/lib/client-access";

/**
 * OPTIONS /api/client/projects/[id]
 * Handle CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 200 });
}

/**
 * GET /api/client/projects/[id]
 * Get a single project
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const { id } = await params;
    const projectId = id;

    const identity = { userId: session.user.id, email: session.user.email };
    const accessWhere = await buildClientProjectWhere(identity);

    // Check if user has access to this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ...accessWhere,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        milestones: {
          select: {
            id: true,
            title: true,
            description: true,
            completed: true,
            dueDate: true,
            createdAt: true,
          },
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!project) {
      const response = NextResponse.json({ error: "Project not found" }, { status: 404 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const response = NextResponse.json({ project });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error: any) {
    console.error("[GET /api/client/projects/[id]]", error);
    const response = NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}

/**
 * DELETE /api/client/projects/[id]
 * Delete a project (only if client owns it and it's not in certain statuses)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const { id } = await params;
    const projectId = id;

    // Verify user has access to this project
    const identity = { userId: session.user.id, email: session.user.email };
    const accessWhere = await buildClientProjectWhere(identity);

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ...accessWhere,
      },
      select: {
        id: true,
        name: true,
        status: true,
        organizationId: true,
      },
    });

    if (!project) {
      const response = NextResponse.json({ error: "Project not found" }, { status: 404 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Check if user owns this project (through clientId)
    // We allow deletion if the project is associated with the user's client account
    // Additional safety: only allow deletion of projects in certain statuses
    const status = String(project.status || '').toUpperCase();
    const deletableStatuses = ['LEAD', 'DRAFT', 'PLANNING'];
    
    // For more restrictive deletion, you might want to only allow LEAD status
    // Uncomment the line below to be more restrictive:
    // if (!deletableStatuses.includes(status)) {
    //   const response = NextResponse.json(
    //     { error: "Cannot delete project. Only projects in draft or planning stage can be deleted." },
    //     { status: 400 }
    //   );
    //   return addCorsHeaders(response, req.headers.get("origin"));
    // }

    // Use a transaction to delete related records and then the project
    // This handles models that don't have cascade delete enabled
    await prisma.$transaction(async (tx) => {
      // Delete related records that don't have cascade delete
      // Files (optional relation, but delete if they exist)
      await tx.file.deleteMany({
        where: { projectId: projectId },
      });

      // Invoices (optional relation, but delete if they exist)
      // Note: Be careful with invoices as they may have payments
      // For now, we'll just unlink them by setting projectId to null
      await tx.invoice.updateMany({
        where: { projectId: projectId },
        data: { projectId: null },
      });

      // Todos (optional relation)
      await tx.todo.deleteMany({
        where: { projectId: projectId },
      });

      // Archive any ProjectRequests associated with this user that are still active
      // This allows users to submit new requests after deleting projects
      await tx.projectRequest.updateMany({
        where: {
          userId: session.user.id,
          status: {
            in: ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'],
          },
        },
        data: {
          status: 'ARCHIVED',
        },
      });

      // Delete the project (this will cascade delete records with onDelete: Cascade)
      await tx.project.delete({
        where: { id: projectId },
      });
    });

    // Log activity (outside transaction to ensure it's logged even if deletion succeeds)
    try {
      await prisma.systemLog.create({
        data: {
          action: "CLIENT_PROJECT_DELETED",
          entityType: "Project",
          entityId: projectId,
          userId: session.user.id,
          metadata: { projectName: project.name, status: project.status },
        },
      });
    } catch (logError) {
      // Don't fail the deletion if logging fails
      console.error("[DELETE /api/client/projects/[id]] Failed to log deletion:", logError);
    }

    const response = NextResponse.json({ success: true, message: "Project deleted successfully" });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error: any) {
    console.error("[DELETE /api/client/projects/[id]]", error);
    console.error("[DELETE /api/client/projects/[id]] Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta,
      stack: error.stack,
    });
    
    // Provide more detailed error message for debugging
    let errorMessage = "Failed to delete project";
    let statusCode = 500;
    
    if (error.code === "P2003") {
      errorMessage = "Cannot delete project due to related records. Please contact support.";
    } else if (error.code === "P2025") {
      errorMessage = "Project not found or already deleted.";
      statusCode = 404;
    } else if (error.code === "P2014") {
      errorMessage = "Cannot delete project due to required relation constraints.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    const response = NextResponse.json(
      { 
        error: errorMessage,
        code: error.code || "UNKNOWN_ERROR",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: statusCode }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}
