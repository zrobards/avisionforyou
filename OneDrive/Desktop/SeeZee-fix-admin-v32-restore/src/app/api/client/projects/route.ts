import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleCors, addCorsHeaders } from "@/lib/cors";
import { buildClientProjectWhere } from "@/lib/client-access";
import type { Prisma } from "@prisma/client";

/**
 * OPTIONS /api/client/projects
 * Handle CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 200 });
}

/**
 * GET /api/client/projects
 * Returns client's projects with filtering
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const identity = { userId: session.user.id, email: session.user.email };
    const accessWhere = await buildClientProjectWhere(identity);
    const orConditions =
      "OR" in accessWhere && Array.isArray(accessWhere.OR)
        ? accessWhere.OR
        : [];

    if (orConditions.length === 0) {
      const response = NextResponse.json({ items: [], total: 0 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const filters: Prisma.ProjectWhereInput[] = [{ OR: orConditions }];

    if (status) {
      filters.push({ status: status as any });
    }

    if (q) {
      filters.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          {
            assignee: {
              name: { contains: q, mode: "insensitive" },
            },
          },
        ],
      });
    }

    const projects = await prisma.project.findMany({
      where: {
        AND: filters,
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        milestones: {
          select: {
            id: true,
            title: true,
            completed: true,
            dueDate: true,
          },
          orderBy: { dueDate: "asc" },
        },
        maintenancePlanRel: {
          select: {
            id: true,
            tier: true,
            status: true,
          },
        },
        _count: {
          select: {
            files: true,
            invoices: true,
            requests: true,
            milestones: true,
          },
        },
      },
    });

    // Calculate progress for each project based on milestones
    const projectsWithProgress = projects.map((p) => {
      const totalMilestones = p.milestones.length;
      const completedMilestones = p.milestones.filter((m) => m.completed).length;
      const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        stage: p.status,
        progress,
        budget: p.budget ? Number(p.budget) : null,
        startDate: p.startDate,
        endDate: p.endDate,
        dueAt: p.endDate,
        lastUpdated: p.updatedAt,
        assignee: p.assignee
          ? {
              id: p.assignee.id,
              name: p.assignee.name,
              email: p.assignee.email,
              image: p.assignee.image,
            }
          : null,
        milestones: p.milestones.map((m) => ({
          id: m.id,
          title: m.title,
          completed: m.completed,
          dueDate: m.dueDate,
        })),
        hasMaintenancePlan: !!p.maintenancePlanRel,
        maintenancePlan: p.maintenancePlanRel
          ? {
              id: p.maintenancePlanRel.id,
              tier: p.maintenancePlanRel.tier,
              status: p.maintenancePlanRel.status,
            }
          : null,
        counts: {
          files: p._count.files,
          invoices: p._count.invoices,
          requests: p._count.requests,
          milestones: p._count.milestones,
        },
      };
    });

    const response = NextResponse.json({
      items: projectsWithProgress,
      total: projects.length,
    });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error: any) {
    console.error("[GET /api/client/projects]", error);
    const response = NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}
