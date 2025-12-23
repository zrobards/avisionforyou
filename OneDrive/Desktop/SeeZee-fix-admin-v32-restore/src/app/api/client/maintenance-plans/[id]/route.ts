import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getClientAccessContext } from "@/lib/client-access";

/**
 * GET /api/client/maintenance-plans/[id]
 * Get a specific maintenance plan (if user has access)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the maintenance plan
    const plan = await prisma.maintenancePlan.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            organization: {
              include: {
                members: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Maintenance plan not found" }, { status: 404 });
    }

    // Check if user has access to this plan's project
    const hasAccess = plan.project.organization.members.length > 0;
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("[GET /api/client/maintenance-plans/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance plan" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/client/maintenance-plans/[id]
 * Update a maintenance plan (ADMIN/CEO ONLY - SECURITY: Clients cannot modify their own hours)
 * 
 * SECURITY NOTE: This endpoint was previously vulnerable - clients could modify their own hours.
 * Now restricted to admin/CEO roles only. Hours should only be modified through:
 * - Stripe webhooks (payment processing)
 * - Admin actions (manual adjustments)
 * - System processes (monthly resets, rollover calculations)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // SECURITY: Only allow admin/CEO roles to modify maintenance plans
    const allowedRoles = ["ADMIN", "CEO", "CFO"];
    if (!allowedRoles.includes(session.user.role || "")) {
      return NextResponse.json(
        { 
          error: "Forbidden", 
          message: "Only administrators can modify maintenance plans. Hours are managed automatically through your subscription and purchases." 
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    // Get the maintenance plan
    const plan = await prisma.maintenancePlan.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Maintenance plan not found" }, { status: 404 });
    }

    // Only allow updating specific fields (with validation)
    const updateData: any = {};
    
    // Validate and set supportHoursIncluded (must be positive number or -1 for unlimited)
    if (typeof body.supportHoursIncluded === 'number') {
      if (body.supportHoursIncluded < -1 || (body.supportHoursIncluded !== -1 && body.supportHoursIncluded < 0)) {
        return NextResponse.json(
          { error: "supportHoursIncluded must be a positive number or -1 for unlimited" },
          { status: 400 }
        );
      }
      updateData.supportHoursIncluded = body.supportHoursIncluded;
    }
    
    // Validate and set changeRequestsIncluded (must be positive number or -1 for unlimited)
    if (typeof body.changeRequestsIncluded === 'number') {
      if (body.changeRequestsIncluded < -1 || (body.changeRequestsIncluded !== -1 && body.changeRequestsIncluded < 0)) {
        return NextResponse.json(
          { error: "changeRequestsIncluded must be a positive number or -1 for unlimited" },
          { status: 400 }
        );
      }
      updateData.changeRequestsIncluded = body.changeRequestsIncluded;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Log the change for audit purposes
    await prisma.systemLog.create({
      data: {
        action: "MAINTENANCE_PLAN_UPDATED",
        entityType: "MaintenancePlan",
        entityId: id,
        userId: session.user.id,
        metadata: {
          changes: updateData,
          projectId: plan.projectId,
          projectName: plan.project.name,
        },
      },
    });

    const updated = await prisma.maintenancePlan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/client/maintenance-plans/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update maintenance plan" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/client/maintenance-plans/[id]
 * Cancel/delete a maintenance plan
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the maintenance plan and check access
    const plan = await prisma.maintenancePlan.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            organization: {
              include: {
                members: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Maintenance plan not found" }, { status: 404 });
    }

    // Check if user has access
    const hasAccess = plan.project.organization.members.length > 0;
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cancel the plan (set status to CANCELLED instead of deleting)
    const cancelled = await prisma.maintenancePlan.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, plan: cancelled });
  } catch (error) {
    console.error("[DELETE /api/client/maintenance-plans/[id]]", error);
    return NextResponse.json(
      { error: "Failed to cancel maintenance plan" },
      { status: 500 }
    );
  }
}

