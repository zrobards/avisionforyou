import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getClientProjectOrThrow } from "@/lib/client-access";
import { ClientAccessError } from "@/lib/client-access-types";

/**
 * POST /api/client/change-requests/[id]/approve
 * Client approves a change request that requires client approval
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the change request and verify client has access to the project
    const changeRequest = await prisma.changeRequest.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!changeRequest) {
      return NextResponse.json({ error: "Change request not found" }, { status: 404 });
    }

    // Verify client has access to this project
    try {
      await getClientProjectOrThrow(
        { userId: session.user.id, email: session.user.email },
        changeRequest.projectId,
        { select: { id: true } }
      );
    } catch (error) {
      if (error instanceof ClientAccessError) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      throw error;
    }

    // Verify the change request requires client approval and is pending
    if (!changeRequest.requiresClientApproval) {
      return NextResponse.json(
        { error: "This change request does not require client approval" },
        { status: 400 }
      );
    }

    if (changeRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending change requests can be approved" },
        { status: 400 }
      );
    }

    if (changeRequest.clientApprovedAt) {
      return NextResponse.json(
        { error: "This change request has already been approved" },
        { status: 400 }
      );
    }

    // Update the change request with client approval
    const updatedRequest = await prisma.changeRequest.update({
      where: { id },
      data: {
        clientApprovedAt: new Date(),
        // Status remains pending until admin approves it
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        subscription: {
          select: {
            id: true,
            planName: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.systemLog.create({
      data: {
        area: "ChangeRequest",
        refId: updatedRequest.id,
        action: "CLIENT_APPROVE",
        entityType: "ChangeRequest",
        entityId: updatedRequest.id,
        userId: session.user.id,
        message: `Change request approved by client: ${session.user.name || session.user.email}`,
        meta: {
          changeRequestId: updatedRequest.id,
          projectId: changeRequest.projectId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      changeRequest: updatedRequest,
    });
  } catch (error: any) {
    console.error("[POST /api/client/change-requests/[id]/approve]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to approve change request" },
      { status: 500 }
    );
  }
}






