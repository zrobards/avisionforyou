import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

/**
 * GET /api/admin/project-requests
 * Get all project requests (Admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Fetch project requests
    const projectRequests = await prisma.projectRequest.findMany({
      where,
      ...(limit && { take: parseInt(limit, 10) }),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ projectRequests });
  } catch (error) {
    console.error("[GET /api/admin/project-requests]", error);
    return NextResponse.json(
      { error: "Failed to fetch project requests" },
      { status: 500 }
    );
  }
}

