import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const recording = await prisma.recording.findUnique({
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

    if (!recording) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    return NextResponse.json({ recording });
  } catch (error) {
    console.error("Error fetching recording:", error);
    return NextResponse.json(
      { error: "Failed to fetch recording" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const adminRoles = ["CEO", "CFO"];
    if (!adminRoles.includes(user?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Validate category if provided
    const validCategories = [
      'DISCOVERY_CALL', 'DESIGN_REVIEW', 'TECHNICAL_DISCUSSION', 
      'PROJECT_UPDATE', 'BRAINSTORMING', 'TRAINING', 
      'SUPPORT', 'INTERNAL', 'OTHER', null
    ];

    const updateData: any = {};

    if ('category' in body) {
      if (body.category !== null && !validCategories.includes(body.category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      updateData.category = body.category;
    }

    if ('isClientVisible' in body) {
      updateData.isClientVisible = Boolean(body.isClientVisible);
    }

    if ('projectId' in body) {
      updateData.projectId = body.projectId;
    }

    if ('title' in body) {
      updateData.title = body.title;
    }

    const recording = await prisma.recording.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ recording });
  } catch (error) {
    console.error("Error updating recording:", error);
    return NextResponse.json(
      { error: "Failed to update recording" },
      { status: 500 }
    );
  }
}
