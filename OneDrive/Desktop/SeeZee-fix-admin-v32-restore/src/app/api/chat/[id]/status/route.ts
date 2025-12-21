import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/chat/[id]/status - Update conversation status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "ACTIVE",
      "WAITING_FOR_HUMAN",
      "WITH_HUMAN",
      "RESOLVED",
      "ABANDONED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };

    // Set closedAt if resolving or abandoning
    if (status === "RESOLVED" || status === "ABANDONED") {
      updateData.closedAt = new Date();
    }

    // Mark as handed off if taking over
    if (status === "WITH_HUMAN") {
      updateData.handedOff = true;
    }

    const conversation = await prisma.aIConversation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      status: conversation.status,
      success: true,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}

