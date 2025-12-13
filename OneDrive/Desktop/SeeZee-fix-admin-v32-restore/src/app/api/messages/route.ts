import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/messages - Get user's message threads
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threads = await prisma.messageThread.findMany({
      where: {
        clientId: session.user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        project: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(threads);
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/messages - Create new message
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId, content, projectId } = await req.json();

    // If no threadId, create new thread
    let thread;
    if (!threadId && projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      thread = await prisma.messageThread.create({
        data: {
          subject: `${project.name} Discussion`,
          projectId,
          clientId: session.user.id,
        },
      });
    } else if (threadId) {
      thread = await prisma.messageThread.findFirst({
        where: {
          id: threadId,
          clientId: session.user.id,
        },
      });
    }

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Determine role from session
    const role = session.user.role === "CEO" ? "ceo" : 
                 session.user.role === "CFO" ? "admin" :
                 ["FRONTEND", "BACKEND", "OUTREACH"].includes(session.user.role || "") ? "admin" : "client";

    // Create message
    const message = await prisma.threadMessage.create({
      data: {
        content,
        threadId: thread.id,
        senderId: session.user.id,
        role,
      },
    });

    // Update thread's updatedAt
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ ...message, threadId: thread.id });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
