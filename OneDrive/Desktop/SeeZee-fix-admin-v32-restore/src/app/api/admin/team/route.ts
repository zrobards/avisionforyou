// API Route: Get all team members
// GET /api/admin/team

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only non-client roles can view team (CEO, CFO, FRONTEND, BACKEND, OUTREACH)
    const allowedRoles = ["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"];
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users with their activity stats
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        company: true,
        twofaEnabled: true,
        createdAt: true,
        updatedAt: true,
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            assignedProjects: true,
            assignedTodos: true,
            systemLogs: true,
            projectRequests: true,
          },
        },
      },
      orderBy: [
        { role: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[TEAM_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
