import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildClientProjectWhere } from "@/lib/client-access";
import type { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get projects for the current user's organization
    const identity = { userId: session.user.id, email: session.user.email };
    const accessWhere = await buildClientProjectWhere(identity);
    const orConditions =
      "OR" in accessWhere && Array.isArray(accessWhere.OR)
        ? accessWhere.OR
        : [];

    if (orConditions.length === 0) {
      return NextResponse.json({ projects: [] });
    }

    const filters: Prisma.ProjectWhereInput[] = [
      { OR: orConditions },
      {
        status: {
          in: ["ACTIVE", "REVIEW", "DEPOSIT_PAID"],
        },
      },
    ];

    const projectsResult = await prisma.project.findMany({
      where: {
        AND: filters,
      },
      select: {
        id: true,
        name: true,
        status: true,
        milestones: {
          select: {
            id: true,
            completed: true,
          },
        },
      },
    });

    const projects = projectsResult.map((project) => {
      const completedMilestones = project.milestones.filter((m) => m.completed).length;
      const totalMilestones = project.milestones.length || 1;
      const progress = Math.round((completedMilestones / totalMilestones) * 100);

      return {
        id: project.id,
        name: project.name,
        progress,
        status: project.status,
        milestones: {
          total: totalMilestones,
          completed: completedMilestones,
        },
      };
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Failed to fetch client progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
