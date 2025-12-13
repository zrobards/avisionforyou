import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

/**
 * PATCH /api/admin/requests/[id]
 * Approve or reject a change request (Admin only)
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
    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { status, notes } = await req.json();

    // Validate status
    const validStatuses = ["pending", "approved", "completed", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if it's a ChangeRequest
    const changeRequest = await prisma.changeRequest.findUnique({
      where: { id },
      select: { id: true, projectId: true },
    });

    if (changeRequest) {
      const updateData: any = {};
      if (status) {
        updateData.status = status;
        if (status === "completed") {
          updateData.completedAt = new Date();
        }
      }

      const updatedRequest = await prisma.changeRequest.update({
        where: { id },
        data: updateData,
        include: {
          project: {
            select: { id: true, name: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        request: updatedRequest,
        type: "changeRequest",
      });
    }

    // Check if it's a Request (generic project request)
    const request = await prisma.request.findUnique({
      where: { id },
      select: { id: true, projectId: true },
    });

    if (request) {
      const stateMap: Record<string, string> = {
        pending: "new",
        approved: "approved",
        completed: "completed",
        rejected: "rejected",
      };

      const updatedRequest = await prisma.request.update({
        where: { id },
        data: {
          state: status ? stateMap[status] || status : undefined,
        },
        include: {
          project: {
            select: { id: true, name: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        request: updatedRequest,
        type: "request",
      });
    }

    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  } catch (error) {
    console.error("[PATCH /api/admin/requests/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/requests/[id]
 * Get details of a specific request (Admin only)
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

    // Try ChangeRequest first
    const changeRequest = await prisma.changeRequest.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true },
        },
        subscription: {
          select: { id: true, planName: true },
        },
      },
    });

    if (changeRequest) {
      return NextResponse.json({
        request: changeRequest,
        type: "changeRequest",
      });
    }

    // Try generic Request
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (request) {
      return NextResponse.json({
        request,
        type: "request",
      });
    }

    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  } catch (error) {
    console.error("[GET /api/admin/requests/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
}
