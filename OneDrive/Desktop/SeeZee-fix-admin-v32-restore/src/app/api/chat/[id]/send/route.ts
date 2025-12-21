import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/chat/[id]/send - Send a message as admin
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { message, fromHuman } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check if conversation exists
    const conversation = await prisma.aIConversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create the message
    const chatMessage = await prisma.aIMessage.create({
      data: {
        conversationId: id,
        role: "ASSISTANT",
        content: message,
        modelUsed: fromHuman ? "human" : undefined,
      },
    });

    // Update conversation status if human is taking over
    if (fromHuman && conversation.status === "WAITING_FOR_HUMAN") {
      await prisma.aIConversation.update({
        where: { id },
        data: {
          status: "WITH_HUMAN",
          handedOff: true,
        },
      });
    }

    return NextResponse.json({
      messageId: chatMessage.id,
      success: true,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

