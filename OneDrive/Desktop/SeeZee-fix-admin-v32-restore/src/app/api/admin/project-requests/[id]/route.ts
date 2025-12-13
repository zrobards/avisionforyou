import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

/**
 * GET /api/admin/project-requests/[id]
 * Get a single project request (Admin only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!projectRequest) {
      return NextResponse.json({ error: "Project request not found" }, { status: 404 });
    }

    return NextResponse.json({ projectRequest });
  } catch (error) {
    console.error("[GET /api/admin/project-requests/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch project request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/project-requests/[id]
 * Delete a project request (Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Verify project request exists
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        userId: true,
      },
    });

    if (!projectRequest) {
      return NextResponse.json({ error: "Project request not found" }, { status: 404 });
    }

    // Delete the project request
    await prisma.projectRequest.delete({
      where: { id },
    });

    // Log activity
    try {
      await prisma.systemLog.create({
        data: {
          action: "ADMIN_PROJECT_REQUEST_DELETED",
          entityType: "ProjectRequest",
          entityId: id,
          userId: session.user.id,
          metadata: { 
            requestTitle: projectRequest.title, 
            status: projectRequest.status,
            deletedBy: session.user.email,
          },
        },
      });
    } catch (logError) {
      console.error("[DELETE /api/admin/project-requests/[id]] Failed to log deletion:", logError);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Project request deleted successfully" 
    });
  } catch (error: any) {
    console.error("[DELETE /api/admin/project-requests/[id]]", error);
    
    let errorMessage = "Failed to delete project request";
    let statusCode = 500;
    
    if (error.code === "P2025") {
      errorMessage = "Project request not found or already deleted.";
      statusCode = 404;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: error.code || "UNKNOWN_ERROR",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}

