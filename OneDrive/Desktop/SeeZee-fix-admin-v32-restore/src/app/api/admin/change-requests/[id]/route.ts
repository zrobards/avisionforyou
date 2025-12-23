import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deductHours } from "@/lib/hours/tracker";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

/**
 * GET /api/admin/change-requests/[id]
 * Get a specific change request
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

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const changeRequest = await prisma.changeRequest.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        subscription: {
          select: {
            id: true,
            planName: true,
          },
        },
      },
    });

    if (!changeRequest) {
      return NextResponse.json({ error: "Change request not found" }, { status: 404 });
    }

    return NextResponse.json({ changeRequest });
  } catch (error) {
    console.error("[GET /api/admin/change-requests/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch change request" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/change-requests/[id]
 * Update a change request (Admin only)
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

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const {
      status,
      category,
      priority,
      estimatedHours,
      actualHours,
      hoursDeducted,
      hoursSource,
      urgencyFee,
      isOverage,
      overageAmount,
      flaggedForReview,
      description,
      attachments,
    } = body;

    // Validate status if provided
    if (status) {
      const validStatuses = ["pending", "approved", "in_progress", "completed", "rejected"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Validate category if provided
    if (category) {
      const validCategories = ["CONTENT", "BUG", "FEATURE", "DESIGN", "SEO", "SECURITY", "OTHER"];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Validate priority if provided
    if (priority) {
      const validPriorities = ["LOW", "NORMAL", "HIGH", "URGENT", "EMERGENCY"];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { error: `Invalid priority. Must be one of: ${validPriorities.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};

    if (status !== undefined) {
      updateData.status = status;
      if (status === "completed") {
        updateData.completedAt = new Date();
      } else if (status !== "completed" && status !== "rejected") {
        updateData.completedAt = null;
      }
    }

    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours === null ? null : Number(estimatedHours);
    if (actualHours !== undefined) updateData.actualHours = actualHours === null ? null : Number(actualHours);
    if (hoursDeducted !== undefined) updateData.hoursDeducted = hoursDeducted === null ? null : Number(hoursDeducted);
    if (hoursSource !== undefined) updateData.hoursSource = hoursSource;
    if (urgencyFee !== undefined) updateData.urgencyFee = Number(urgencyFee) || 0;
    if (isOverage !== undefined) updateData.isOverage = Boolean(isOverage);
    if (overageAmount !== undefined) updateData.overageAmount = overageAmount === null ? null : Number(overageAmount);
    if (flaggedForReview !== undefined) updateData.flaggedForReview = Boolean(flaggedForReview);
    if (description !== undefined) updateData.description = description;
    if (attachments !== undefined) updateData.attachments = Array.isArray(attachments) ? attachments : [];

    // Get the current change request to check if we need to deduct hours
    const currentRequest = await prisma.changeRequest.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            maintenancePlanRel: true,
          },
        },
      },
    });

    if (!currentRequest) {
      return NextResponse.json({ error: "Change request not found" }, { status: 404 });
    }

    // Check if we need to deduct hours
    // Deduct hours if:
    // 1. Status is being set to "completed" OR is already "completed"
    // 2. actualHours is provided and > 0 (either in the update or already in the request)
    // 3. hoursDeducted is null or 0 (hours haven't been deducted yet)
    // 4. The project has a maintenance plan
    // 5. hoursSource is not "COMPLIMENTARY" (complimentary work doesn't deduct hours)
    const finalStatus = status !== undefined ? status : currentRequest.status;
    const finalActualHours = actualHours !== undefined ? Number(actualHours) : (currentRequest.actualHours ? Number(currentRequest.actualHours) : 0);
    const finalHoursSource = hoursSource !== undefined ? hoursSource : currentRequest.hoursSource;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'change-requests/[id]/route.ts:183',message:'ChangeRequest deduction check',data:{finalStatus,currentStatus:currentRequest.status,finalActualHours,currentActualHours:currentRequest.actualHours,hoursDeducted:currentRequest.hoursDeducted,hasPlan:!!currentRequest.project?.maintenancePlanRel,planId:currentRequest.project?.maintenancePlanRel?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    // Check if status is completed (case-insensitive)
    const isCompleted = finalStatus?.toLowerCase() === "completed";
    const shouldDeductHours = 
      isCompleted &&
      finalActualHours > 0 &&
      (!currentRequest.hoursDeducted || currentRequest.hoursDeducted === 0) &&
      currentRequest.project?.maintenancePlanRel &&
      finalHoursSource !== "COMPLIMENTARY";
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'change-requests/[id]/route.ts:190',message:'shouldDeductHours result',data:{shouldDeductHours,reason:!shouldDeductHours?{statusCheck:finalStatus==="completed",hasHours:finalActualHours>0,notDeducted:!currentRequest.hoursDeducted||currentRequest.hoursDeducted===0,hasPlan:!!currentRequest.project?.maintenancePlanRel,notComplimentary:finalHoursSource!=="COMPLIMENTARY"}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (shouldDeductHours) {
      if (finalActualHours > 0 && currentRequest.project.maintenancePlanRel) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'change-requests/[id]/route.ts:193',message:'Before deductHours for ChangeRequest',data:{planId:currentRequest.project.maintenancePlanRel.id,finalActualHours,description:`Change request: ${currentRequest.description?.substring(0,50)}`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        try {
          const deductionResult = await deductHours(
            currentRequest.project.maintenancePlanRel.id,
            finalActualHours,
            `Change request: ${currentRequest.description?.substring(0, 100) || 'Change request'}`,
            session.user.id
          );
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'change-requests/[id]/route.ts:200',message:'deductHours result for ChangeRequest',data:{success:deductionResult.success,hoursDeducted:deductionResult.hoursDeducted,source:deductionResult.source,error:deductionResult.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion

          if (deductionResult.success) {
            // Update the hoursDeducted field
            updateData.hoursDeducted = deductionResult.hoursDeducted;
            // Only set hoursSource if it wasn't explicitly provided
            if (hoursSource === undefined) {
              updateData.hoursSource = deductionResult.source;
            }
            updateData.isOverage = deductionResult.isOverage;
            if (deductionResult.isOverage && deductionResult.overageHours) {
              // Calculate overage amount if needed (you may need to get hourly rate from plan)
              // For now, we'll leave it to be set manually or via the hours logger
            }
          } else {
            console.warn(`[PATCH /api/admin/change-requests/[id]] Failed to deduct hours: ${deductionResult.error}`);
            // Still update the request, but mark that deduction failed
            updateData.hoursDeducted = 0;
          }
        } catch (error: any) {
          console.error("[PATCH /api/admin/change-requests/[id]] Error deducting hours:", error);
          // Continue with the update even if deduction fails
        }
      }
    }

    const updatedRequest = await prisma.changeRequest.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        subscription: {
          select: {
            id: true,
            planName: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.systemLog.create({
      data: {
        area: "ChangeRequest",
        refId: updatedRequest.id,
        action: "UPDATE",
        entityType: "ChangeRequest",
        entityId: updatedRequest.id,
        userId: session.user.id,
        message: `Change request updated by ${session.user.name || session.user.email}`,
        meta: {
          changes: body,
        },
      },
    });

    return NextResponse.json({
      success: true,
      changeRequest: updatedRequest,
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/change-requests/[id]]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update change request" },
      { status: 500 }
    );
  }
}




