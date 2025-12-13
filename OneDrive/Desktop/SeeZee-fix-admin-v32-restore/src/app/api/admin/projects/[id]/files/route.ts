import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

/**
 * POST /api/admin/projects/[id]/files
 * Create a file record for admin-uploaded files
 */
export async function POST(
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
    const { name, url, size, mimeType } = await req.json();

    // Validate required fields
    if (!name || !url) {
      return NextResponse.json(
        { error: "name and url are required" },
        { status: 400 }
      );
    }

    // Validate the project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Determine file type from mimeType
    const type = mimeType?.startsWith("image/") ? "IMAGE" 
      : mimeType?.startsWith("video/") ? "VIDEO"
      : mimeType?.includes("pdf") || mimeType?.includes("document") || mimeType?.includes("text") ? "DOCUMENT"
      : "OTHER";

    // Create the file record
    const file = await prisma.file.create({
      data: {
        name,
        originalName: name,
        mimeType: mimeType || "application/octet-stream",
        size: size || 0,
        type,
        url,
        projectId: id,
        uploadedById: session.user.id,
        virusScanStatus: "PENDING",
      },
    });

    return NextResponse.json({ 
      success: true, 
      file,
    });
  } catch (error) {
    console.error("[POST /api/admin/projects/[id]/files]", error);
    return NextResponse.json(
      { error: "Failed to create file record" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/projects/[id]/files
 * Get all files for a project (Admin only)
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

    const files = await prisma.file.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        originalName: true,
        mimeType: true,
        size: true,
        url: true,
        type: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error("[GET /api/admin/projects/[id]/files]", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/projects/[id]/files
 * Delete a file (Admin only)
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

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    // Verify file exists
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: { id: true },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await prisma.file.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/projects/[id]/files]", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
