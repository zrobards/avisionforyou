import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getClientAccessContext } from "@/lib/client-access";

/**
 * GET /api/client/maintenance-plans
 * Get all maintenance plans for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identity = {
      userId: session.user.id,
      email: session.user.email!,
    };

    // Get user's accessible projects
    const access = await getClientAccessContext(identity);
    
    if (access.organizationIds.length === 0 && access.leadProjectIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get all maintenance plans for accessible projects
    const plans = await prisma.maintenancePlan.findMany({
      where: {
        project: {
          OR: [
            { organizationId: { in: access.organizationIds } },
            { id: { in: access.leadProjectIds } },
          ],
        },
      },
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("[GET /api/client/maintenance-plans]", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance plans" },
      { status: 500 }
    );
  }
}





