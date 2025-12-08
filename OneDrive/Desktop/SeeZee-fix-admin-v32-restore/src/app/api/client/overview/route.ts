import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleCors, addCorsHeaders } from "@/lib/cors";
import { getClientAccessContext } from "@/lib/client-access";
import type { Prisma } from "@prisma/client";

/**
 * OPTIONS /api/client/overview
 * Handle CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 200 });
}

/**
 * GET /api/client/overview
 * Returns aggregated data for the client dashboard overview
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const identity = {
      userId: session.user.id,
      email: session.user.email,
    };
    const { organizationIds, leadProjectIds } = await getClientAccessContext(identity);

    if (organizationIds.length === 0 && leadProjectIds.length === 0) {
      const response = NextResponse.json({
        projects: { active: 0, total: 0 },
        invoices: { open: 0, overdue: 0, paidThisMonth: 0 },
        activity: { items: [] },
        files: { recent: [] },
        requests: { recent: [] },
      });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const projectScope: Prisma.ProjectWhereInput = {
      OR: [
        ...(organizationIds.length > 0
          ? [
              {
                organizationId: {
                  in: organizationIds,
                },
              },
            ]
          : []),
        ...(leadProjectIds.length > 0
          ? [
              {
                id: {
                  in: leadProjectIds,
                },
              },
            ]
          : []),
      ],
    };

    // Projects count
    const [activeProjects, totalProjects] = await Promise.all([
      prisma.project.count({
        where: {
          AND: [
            projectScope,
            {
              status: { in: ["ACTIVE", "REVIEW"] },
            },
          ],
        },
      }),
      prisma.project.count({
        where: projectScope,
      }),
    ]);

    // Invoices
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [openInvoices, overdueInvoices, paidThisMonth] = await Promise.all([
      prisma.invoice.count({
        where: {
          status: "SENT",
          OR: [
            ...(organizationIds.length > 0
              ? [
                  {
                    organizationId: {
                      in: organizationIds,
                    },
                  },
                ]
              : []),
            ...(leadProjectIds.length > 0
              ? [
                  {
                    projectId: {
                      in: leadProjectIds,
                    },
                  },
                ]
              : []),
          ],
        },
      }),
      prisma.invoice.count({
        where: {
          status: "OVERDUE",
          OR: [
            ...(organizationIds.length > 0
              ? [
                  {
                    organizationId: {
                      in: organizationIds,
                    },
                  },
                ]
              : []),
            ...(leadProjectIds.length > 0
              ? [
                  {
                    projectId: {
                      in: leadProjectIds,
                    },
                  },
                ]
              : []),
          ],
        },
      }),
      prisma.invoice.count({
        where: {
          status: "PAID",
          paidAt: { gte: firstOfMonth },
          OR: [
            ...(organizationIds.length > 0
              ? [
                  {
                    organizationId: {
                      in: organizationIds,
                    },
                  },
                ]
              : []),
            ...(leadProjectIds.length > 0
              ? [
                  {
                    projectId: {
                      in: leadProjectIds,
                    },
                  },
                ]
              : []),
          ],
        },
      }),
    ]);

    // Get invoice amounts
    const [invoiceAmounts, paidInvoices] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          status: { in: ["SENT", "OVERDUE"] },
          OR: [
            ...(organizationIds.length > 0
              ? [
                  {
                    organizationId: {
                      in: organizationIds,
                    },
                  },
                ]
              : []),
            ...(leadProjectIds.length > 0
              ? [
                  {
                    projectId: {
                      in: leadProjectIds,
                    },
                  },
                ]
              : []),
          ],
        },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: {
          status: "PAID",
          paidAt: { gte: firstOfMonth },
          OR: [
            ...(organizationIds.length > 0
              ? [
                  {
                    organizationId: {
                      in: organizationIds,
                    },
                  },
                ]
              : []),
            ...(leadProjectIds.length > 0
              ? [
                  {
                    projectId: {
                      in: leadProjectIds,
                    },
                  },
                ]
              : []),
          ],
        },
        _sum: { total: true },
      }),
    ]);

    // Recent activity (filtered by organization's projects)
    const accessibleProjectIds = await prisma.project
      .findMany({
        where: projectScope,
        select: { id: true },
      })
      .then((projects) => projects.map((project) => project.id));

    const activities = accessibleProjectIds.length
      ? await prisma.activity.findMany({
          where: {
            entityType: "project",
            entityId: {
              in: accessibleProjectIds,
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: { name: true, email: true, image: true },
            },
          },
        })
      : [];

    // Recent files (from accessible projects)
    const files = await prisma.file.findMany({
      where: {
        projectId: {
          in: accessibleProjectIds,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Recent requests
    const requests = await prisma.request.findMany({
      where: {
        projectId: {
          in: accessibleProjectIds,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const response = NextResponse.json({
      projects: {
        active: activeProjects,
        total: totalProjects,
      },
      invoices: {
        open: openInvoices,
        overdue: overdueInvoices,
        paidThisMonth,
        openAmount: Number(invoiceAmounts._sum.total || 0),
        paidThisMonthAmount: Number(paidInvoices._sum.total || 0),
      },
      activity: {
        items: activities.map((a) => ({
          id: a.id,
          type: a.type,
          title: a.title,
          description: a.description,
          metadata: a.metadata,
          createdAt: a.createdAt,
          user: a.user
            ? {
                name: a.user.name,
                email: a.user.email,
                image: a.user.image,
              }
            : null,
        })),
      },
      files: {
        recent: files.map((f) => ({
          id: f.id,
          name: f.name,
          size: f.size,
          mimeType: f.mimeType,
          url: f.url,
          uploadedAt: f.createdAt,
          project: f.project
            ? {
                id: f.project.id,
                name: f.project.name,
              }
            : null,
        })),
      },
      requests: {
        recent: requests.map((r) => ({
          id: r.id,
          title: r.title,
          details: r.details,
          state: r.state,
          createdAt: r.createdAt,
          project: r.project
            ? {
                id: r.project.id,
                name: r.project.name,
              }
            : null,
        })),
      },
    });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error: any) {
    console.error("[GET /api/client/overview]", error);
    const response = NextResponse.json(
      { error: "Failed to fetch overview" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}
