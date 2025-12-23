import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deductHours } from "@/lib/hours/tracker";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

/**
 * GET /api/admin/project-requests/[id]
 * Get a single project request (Admin only)
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

    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!projectRequest) {
      return NextResponse.json({ error: "Project request not found" }, { status: 404 });
    }

    return NextResponse.json({ projectRequest });
  } catch (error) {
    console.error("[GET /api/admin/project-requests/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch project request" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/project-requests/[id]
 * Update project request status and deduct hours when completing (Admin only)
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
    const body = await req.json();
    const { status, actualHours, notes } = body;

    // Get the project request with user info
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!projectRequest) {
      return NextResponse.json({ error: "Project request not found" }, { status: 404 });
    }

    const updateData: any = {};
    
    // Update status if provided
    if (status) {
      const validStatuses = ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO', 'APPROVED', 'REJECTED', 'ARCHIVED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // Update notes if provided
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update actual hours if provided
    if (actualHours !== undefined) {
      updateData.actualHours = actualHours ? parseFloat(actualHours) : null;
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'project-requests/[id]/route.ts:119',message:'actualHours set',data:{actualHours:updateData.actualHours,status,currentHoursDeducted:projectRequest.hoursDeducted},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    }

    // If status is being set to APPROVED or COMPLETED, and hours haven't been deducted yet, deduct them
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'project-requests/[id]/route.ts:123',message:'Checking if should deduct',data:{status,currentStatus:projectRequest.status,hoursDeducted:projectRequest.hoursDeducted,willDeduct:(status === 'APPROVED' || status === 'COMPLETED') && !projectRequest.hoursDeducted},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if ((status === 'APPROVED' || status === 'COMPLETED') && !projectRequest.hoursDeducted) {
      // Find the user's maintenance plan
      const user = projectRequest.user;
      if (user) {
        // Find user's organization and maintenance plan
        const orgMember = await prisma.organizationMember.findFirst({
          where: { userId: user.id },
          include: {
            organization: {
              include: {
                projects: {
                  where: {
                    status: {
                      notIn: ['COMPLETED', 'CANCELLED'],
                    },
                  },
                  include: {
                    maintenancePlanRel: {
                      where: {
                        status: 'ACTIVE',
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (orgMember?.organization?.projects?.[0]?.maintenancePlanRel) {
          const plan = orgMember.organization.projects[0].maintenancePlanRel;
          const hoursToDeduct = actualHours || projectRequest.estimatedHours || 0;
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'project-requests/[id]/route.ts:154',message:'Before deductHours',data:{planId:plan.id,hoursToDeduct,actualHours,estimatedHours:projectRequest.estimatedHours,status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          if (hoursToDeduct > 0) {
            try {
              const deductionResult = await deductHours(
                plan.id,
                hoursToDeduct,
                `Project request: ${projectRequest.title}`,
                session.user.id
              );
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'project-requests/[id]/route.ts:163',message:'deductHours result',data:{success:deductionResult.success,hoursDeducted:deductionResult.hoursDeducted,source:deductionResult.source,error:deductionResult.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
              // #endregion
              if (deductionResult.success) {
                updateData.hoursDeducted = deductionResult.hoursDeducted;
                updateData.hoursSource = deductionResult.source;
                updateData.hourPackId = deductionResult.sourceId || null;
              } else {
                console.error('Failed to deduct hours:', deductionResult.error);
                // Continue with status update even if deduction fails
              }
            } catch (deductError) {
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'project-requests/[id]/route.ts:174',message:'deductHours error',data:{error:String(deductError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
              // #endregion
              console.error('Error deducting hours:', deductError);
              // Continue with status update even if deduction fails
            }
          }
        }
      }
    }

    // Update the project request
    const updatedRequest = await prisma.projectRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    try {
      await prisma.systemLog.create({
        data: {
          action: "ADMIN_PROJECT_REQUEST_UPDATED",
          entityType: "ProjectRequest",
          entityId: id,
          userId: session.user.id,
          message: `Project request ${status ? `status changed to ${status}` : 'updated'}`,
          metadata: {
            requestTitle: projectRequest.title,
            oldStatus: projectRequest.status,
            newStatus: status || projectRequest.status,
            actualHours: actualHours || projectRequest.actualHours,
            hoursDeducted: updateData.hoursDeducted,
          },
        },
      });
    } catch (logError) {
      console.error("[PATCH /api/admin/project-requests/[id]] Failed to log update:", logError);
    }

    return NextResponse.json({
      success: true,
      projectRequest: updatedRequest,
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/project-requests/[id]]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update project request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/project-requests/[id]
 * Delete a project request (Admin only)
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

    const { id } = await params;

    // Verify project request exists
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        userId: true,
      },
    });

    if (!projectRequest) {
      return NextResponse.json({ error: "Project request not found" }, { status: 404 });
    }

    // Delete the project request
    await prisma.projectRequest.delete({
      where: { id },
    });

    // Log activity
    try {
      await prisma.systemLog.create({
        data: {
          action: "ADMIN_PROJECT_REQUEST_DELETED",
          entityType: "ProjectRequest",
          entityId: id,
          userId: session.user.id,
          metadata: { 
            requestTitle: projectRequest.title, 
            status: projectRequest.status,
            deletedBy: session.user.email,
          },
        },
      });
    } catch (logError) {
      console.error("[DELETE /api/admin/project-requests/[id]] Failed to log deletion:", logError);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Project request deleted successfully" 
    });
  } catch (error: any) {
    console.error("[DELETE /api/admin/project-requests/[id]]", error);
    
    let errorMessage = "Failed to delete project request";
    let statusCode = 500;
    
    if (error.code === "P2025") {
      errorMessage = "Project request not found or already deleted.";
      statusCode = 404;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: error.code || "UNKNOWN_ERROR",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}

