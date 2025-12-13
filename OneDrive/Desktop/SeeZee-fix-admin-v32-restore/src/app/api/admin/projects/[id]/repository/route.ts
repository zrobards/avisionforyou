import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

/**
 * PATCH /api/admin/projects/[id]/repository
 * Update the GitHub repository link for a project (Admin only)
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
    const { githubRepo } = await req.json();

    // Validate the project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Update the project with the new GitHub repo URL
    const project = await prisma.project.update({
      where: { id },
      data: { githubRepo: githubRepo || null },
      select: {
        id: true,
        name: true,
        githubRepo: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      project,
      message: githubRepo ? "Repository linked successfully" : "Repository unlinked"
    });
  } catch (error) {
    console.error("[PATCH /api/admin/projects/[id]/repository]", error);
    return NextResponse.json(
      { error: "Failed to update repository" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/projects/[id]/repository
 * Get the GitHub repository info for a project (Admin only)
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

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        githubRepo: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("[GET /api/admin/projects/[id]/repository]", error);
    return NextResponse.json(
      { error: "Failed to fetch repository info" },
      { status: 500 }
    );
  }
}
