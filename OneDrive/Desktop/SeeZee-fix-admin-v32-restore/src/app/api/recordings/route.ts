import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin roles can access recordings
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const adminRoles = ["CEO", "CFO"];
    if (!adminRoles.includes(user?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all recordings with project and organization (client) info
    const recordings = await prisma.recording.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ recordings });
  } catch (error) {
    console.error("Error fetching recordings:", error);
    return NextResponse.json(
      { error: "Failed to fetch recordings" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin roles can delete recordings
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const adminRoles = ["CEO", "CFO"];
    if (!adminRoles.includes(user?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Recording ID is required" }, { status: 400 });
    }

    // Find the recording first to get the file path
    const recording = await prisma.recording.findUnique({
      where: { id },
    });

    if (!recording) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    // Try to delete the physical file
    try {
      let filePath = recording.filePath;
      
      // Normalize the file path
      if (!filePath.startsWith("/")) {
        filePath = "/" + filePath;
      }
      if (!filePath.startsWith("/uploads/")) {
        filePath = "/uploads" + filePath;
      }
      
      const fullPath = path.join(process.cwd(), "public", filePath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (fileError) {
      console.error("Error deleting file:", fileError);
      // Continue with DB deletion even if file deletion fails
    }

    // Delete from database
    await prisma.recording.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Recording deleted successfully" });
  } catch (error) {
    console.error("Error deleting recording:", error);
    return NextResponse.json(
      { error: "Failed to delete recording" },
      { status: 500 }
    );
  }
}
