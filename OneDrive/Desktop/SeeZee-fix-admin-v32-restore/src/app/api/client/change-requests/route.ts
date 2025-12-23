import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getClientAccessContext, getClientProjectOrThrow } from "@/lib/client-access";
import { ClientAccessError } from "@/lib/client-access-types";
import { NONPROFIT_TIERS, getTier } from "@/lib/config/tiers";

/**
 * POST /api/client/change-requests
 * Create a new change request for a client's active project/subscription
 */
export async function POST(req: NextRequest) {
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
      return NextResponse.json(
        { error: "No active projects found. Please contact support." },
        { status: 404 }
      );
    }

    // Get the most recent active project with an active subscription or maintenance plan
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { organizationId: { in: access.organizationIds } },
          { id: { in: access.leadProjectIds } },
        ],
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
      include: {
        subscriptions: {
          where: {
            status: 'active',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        maintenancePlanRel: {
          where: {
            status: 'ACTIVE',
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "No active project found. Please contact support." },
        { status: 404 }
      );
    }

    // Check for active subscription first, then maintenance plan
    let activeSubscription = project.subscriptions[0];
    let maintenancePlan = project.maintenancePlanRel;
    
    // If no subscription but we have a maintenance plan, create a Subscription record
    if (!activeSubscription && maintenancePlan) {
      // Create a Subscription record from the MaintenancePlan
      // This allows ChangeRequests to work with MaintenancePlans
      activeSubscription = await prisma.subscription.create({
        data: {
          projectId: project.id,
          stripeId: maintenancePlan.stripeSubscriptionId || `mp_${maintenancePlan.id}`,
          priceId: '', // Not needed for maintenance plan-based subscriptions
          status: maintenancePlan.status === 'ACTIVE' ? 'active' : 'paused',
          planName: `${maintenancePlan.tier} Monthly`,
          changeRequestsAllowed: maintenancePlan.changeRequestsIncluded || 3,
          changeRequestsUsed: maintenancePlan.changeRequestsUsed || 0,
          resetDate: maintenancePlan.currentPeriodEnd || null,
          currentPeriodEnd: maintenancePlan.currentPeriodEnd || null,
        },
      });
      
      console.log(`Created Subscription ${activeSubscription.id} from MaintenancePlan ${maintenancePlan.id}`);
    }
    
    if (!activeSubscription && !maintenancePlan) {
      return NextResponse.json(
        { error: "No active subscription or maintenance plan found for this project. Please set up a maintenance plan first." },
        { status: 400 }
      );
    }

    // Change requests are tied to hours - if you have hours available, you can make requests
    // No separate change request limit - it's all about hours
    // We'll check hours availability later in the flow

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error("[POST /api/client/change-requests] Failed to parse JSON:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.log("[POST /api/client/change-requests] Received body:", JSON.stringify(body, null, 2));

    const { 
      title, 
      description, 
      category, 
      priority, 
      estimatedHours, 
      attachments = [],
      urgencyFee = 0,
    } = body;

    // Validate required fields with detailed error messages
    const missingFields: string[] = [];
    if (!title || (typeof title === 'string' && title.trim() === '')) missingFields.push('title');
    if (!description || (typeof description === 'string' && description.trim() === '')) missingFields.push('description');
    if (!category) missingFields.push('category');
    if (!priority) missingFields.push('priority');

    if (missingFields.length > 0) {
      console.error("[POST /api/client/change-requests] Missing required fields:", missingFields);
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          received: { title: !!title, description: !!description, category: !!category, priority: !!priority }
        },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['CONTENT', 'BUG', 'FEATURE', 'DESIGN', 'SEO', 'SECURITY', 'OTHER'];
    if (!validCategories.includes(category)) {
      console.error("[POST /api/client/change-requests] Invalid category:", category, "Valid categories:", validCategories);
      return NextResponse.json(
        { 
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
          received: category,
          validCategories
        },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY'];
    if (!validPriorities.includes(priority)) {
      console.error("[POST /api/client/change-requests] Invalid priority:", priority, "Valid priorities:", validPriorities);
      return NextResponse.json(
        { 
          error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
          received: priority,
          validPriorities
        },
        { status: 400 }
      );
    }

    // Calculate urgency fee based on priority
    let calculatedUrgencyFee = urgencyFee;
    if (priority === 'HIGH') {
      calculatedUrgencyFee = 5000; // $50 in cents
    } else if (priority === 'URGENT') {
      calculatedUrgencyFee = 10000; // $100 in cents
    }

    // Check if estimated hours exceed available hours
    // Get available hours from maintenance plan if we have one
    let totalAvailableHours = 0;
    let isUnlimited = false;
    
    if (maintenancePlan) {
      // Get tier config for proper hours calculation
      const tierKey = (maintenancePlan.tier || 'ESSENTIALS').toUpperCase() as keyof typeof NONPROFIT_TIERS;
      const tierConfig = getTier(tierKey) || NONPROFIT_TIERS.ESSENTIALS;
      
      // Always use tier config values as source of truth
      const includedHours = tierConfig.supportHoursIncluded;
      isUnlimited = includedHours === -1;
      
      const rolloverHours = maintenancePlan.rolloverHours || 0;
      
      // Get active hour packs
      const hourPacks = await prisma.hourPack.findMany({
        where: {
          planId: maintenancePlan.id,
          isActive: true,
          hoursRemaining: { gt: 0 },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        select: { hoursRemaining: true },
      });
      
      const packHours = hourPacks.reduce((sum, pack) => sum + pack.hoursRemaining, 0);
      
      if (isUnlimited) {
        totalAvailableHours = -1; // Unlimited
      } else {
        totalAvailableHours = includedHours + rolloverHours + packHours;
      }
    } else {
      // No maintenance plan - default to 0 available hours
      // In this case, all requests would be considered overage
      totalAvailableHours = 0;
    }
    
    // For unlimited plans, never consider it overage
    const isOverage = !isUnlimited && estimatedHours && estimatedHours > totalAvailableHours;
    const overageHours = isOverage ? estimatedHours - totalAvailableHours : 0;
    const overageAmount = isOverage ? Math.ceil(overageHours * 75 * 100) : null; // $75/hour in cents

    // Determine if client approval is required (for >2hr estimates)
    const requiresClientApproval = estimatedHours !== null && estimatedHours > 2;

    // Create the change request
    // Note: ChangeRequest schema only has description field, so we combine title and description
    const fullDescription = `${title}\n\n${description}`;
    
    const changeRequest = await prisma.changeRequest.create({
      data: {
        projectId: project.id,
        subscriptionId: activeSubscription.id, // Use the subscription ID (created from maintenance plan if needed)
        description: fullDescription,
        status: 'pending',
        category: category as any,
        priority: priority as any,
        estimatedHours: estimatedHours || null,
        urgencyFee: calculatedUrgencyFee,
        isOverage: isOverage || false,
        overageAmount: overageAmount,
        requiresClientApproval: requiresClientApproval,
        attachments: Array.isArray(attachments) ? attachments : [],
      },
    });

    // Change requests don't have a separate counter - they're just tied to hours
    // Hours will be deducted when the work is done, not when the request is created
    // No need to increment changeRequestsUsed - it's all about available hours

    // Create system log
    await prisma.systemLog.create({
      data: {
        area: "ChangeRequest",
        refId: changeRequest.id,
        action: "CREATE",
        entityType: "ChangeRequest",
        entityId: changeRequest.id,
        userId: session.user.id,
        message: `Change request created: ${title}`,
        meta: {
          category,
          priority,
          estimatedHours,
          projectId: project.id,
        },
      },
    });

    // Notify all admins about new change request
    const { createNewChangeRequestNotification } = await import("@/lib/notifications");
    const clientName = session.user.name || project.organization?.name || "Client";
    await createNewChangeRequestNotification(
      changeRequest.id,
      project.id,
      fullDescription,
      clientName,
      priority
    ).catch(err => console.error("Failed to create change request notification:", err));

    // Auto-generate task from change request
    const { createTaskFromChangeRequest } = await import("@/server/actions/tasks");
    await createTaskFromChangeRequest(changeRequest.id).catch(err => 
      console.error("Failed to auto-generate task from change request:", err)
    );

    return NextResponse.json({
      success: true,
      changeRequest: {
        id: changeRequest.id,
        title, // Return title separately for frontend
        description: fullDescription,
        category: changeRequest.category,
        priority: changeRequest.priority,
        status: changeRequest.status,
        estimatedHours: changeRequest.estimatedHours,
        createdAt: changeRequest.createdAt,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/client/change-requests] Error:", error);
    console.error("[POST /api/client/change-requests] Error stack:", error?.stack);
    
    // Always return a proper error object with at least an error field
    let errorMessage = "Failed to create change request";
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.toString && error.toString() !== '[object Object]') {
      errorMessage = error.toString();
    }
    
    const errorResponse: any = { 
      error: errorMessage,
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error?.stack;
      errorResponse.name = error?.name;
      errorResponse.rawError = error?.toString();
    }
    
    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/client/change-requests
 * Get all change requests for the authenticated user's projects
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
      return NextResponse.json({ changeRequests: [] });
    }

    // Get all change requests for accessible projects
    const changeRequests = await prisma.changeRequest.findMany({
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
          },
        },
        subscription: {
          select: {
            id: true,
            planName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ changeRequests });
  } catch (error) {
    console.error("[GET /api/client/change-requests]", error);
    return NextResponse.json(
      { error: "Failed to fetch change requests" },
      { status: 500 }
    );
  }
}

