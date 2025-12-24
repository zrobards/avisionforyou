"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { emitFeedEvent } from "@/lib/feed";
import { ProjectStatus, ProjectStage, LeadStatus, InvoiceStatus, PaymentStatus, NonprofitTier, MaintenancePlanStatus } from "@prisma/client";
import { feedHelpers } from "@/lib/feed/emit";
import { Prisma } from "@prisma/client";

/**
 * Update project status and emit feed event
 */
export async function updateProjectStatus(projectId: string, newStatus: ProjectStatus) {
  const session = await auth();

  if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
    throw new Error("Unauthorized");
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { status: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const oldStatus = project.status;

    await prisma.project.update({
      where: { id: projectId },
      data: { status: newStatus },
    });

    // Emit status change event
    await emitFeedEvent(projectId, "status.changed", {
      from: oldStatus,
      to: newStatus,
      by: session.user.name,
      timestamp: new Date().toISOString(),
    });

    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/client/projects/${projectId}`);
    revalidatePath("/admin/pipeline");

    return { success: true };
  } catch (error) {
    console.error("[updateProjectStatus] Error:", error);
    throw error;
  }
}

/**
 * SeeZee V2: Update project budget and pricing configuration
 * CEO/CFO action to set manual pricing for a project
 */
export async function updateProjectBudget(
  projectId: string,
  totalPrice: number,
  depositPercent: number = 50,
  finalPercent: number = 50
) {
  const session = await auth();

  if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
    return { success: false, error: "Unauthorized: CEO or CFO role required" };
  }

  try {
    // Validate inputs
    if (totalPrice <= 0) {
      return { success: false, error: "Total price must be greater than 0" };
    }

    if (depositPercent + finalPercent !== 100) {
      return { success: false, error: "Deposit and final percentages must sum to 100" };
    }

    if (depositPercent < 0 || finalPercent < 0) {
      return { success: false, error: "Percentages must be positive" };
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Update project with new budget
    await prisma.project.update({
      where: { id: projectId },
      data: {
        budget: totalPrice,
      },
    });

    // Emit feed event
    await emitFeedEvent(projectId, "budget.set", {
      amount: totalPrice,
      depositPercent,
      finalPercent,
      setBy: session.user.name,
      timestamp: new Date().toISOString(),
    });

    // Revalidate paths
    revalidatePath(`/admin/pipeline/projects/${projectId}`);
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath("/admin/pipeline");

    return { success: true };
  } catch (error) {
    console.error("[updateProjectBudget] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}

/**
 * Complete a milestone and emit feed event
 * NOTE: Requires Milestone model in schema - currently commented out
 */
export async function completeMilestone(milestoneId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Milestone completion - model exists but needs to be verified
    // Uncomment when Milestone model relationships are confirmed in schema
    /*
    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        completed: true,
        completedAt: new Date(),
      },
      include: {
        project: { select: { id: true } },
      },
    });

    await emitFeedEvent(milestone.project.id, "milestone.completed", {
      milestoneId: milestone.id,
      title: milestone.title,
      description: milestone.description,
      completedBy: session.user.name,
    });

    revalidatePath(`/admin/projects/${milestone.project.id}`);
    revalidatePath(`/client/projects/${milestone.project.id}`);

    return { success: true };
    */
    
    throw new Error("Milestone model not yet implemented in schema");
  } catch (error) {
    console.error("[completeMilestone] Error:", error);
    throw error;
  }
}

/**
 * Comprehensive project creation for custom clients
 * Allows admin to create a complete project setup without client filling out forms
 */
export interface CreateCustomProjectParams {
  // Client/Organization Info
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  companyName?: string;
  organizationId?: string; // Use existing org if provided
  
  // Project Details
  projectName: string;
  projectDescription?: string;
  projectStatus?: ProjectStatus;
  projectStage?: ProjectStage;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  assigneeId?: string;
  isNonprofit?: boolean;
  
  // Optional Lead
  createLead?: boolean;
  leadSource?: string;
  leadMessage?: string;
  
  // Optional Milestones
  milestones?: Array<{
    title: string;
    description?: string;
    dueDate?: Date;
  }>;
  
  // Optional Invoice
  createInvoice?: boolean;
  invoiceAmount?: number;
  invoiceTitle?: string;
  invoiceDescription?: string;
  markInvoicePaid?: boolean;
  
  // Optional Maintenance Plan
  createMaintenancePlan?: boolean;
  maintenanceTier?: NonprofitTier;
  
  // Additional
  githubRepo?: string;
  vercelUrl?: string;
  internalNotes?: string;
}

export async function createCustomProject(params: CreateCustomProjectParams) {
  const session = await auth();

  if (!session?.user || !["CEO", "CFO", "ADMIN"].includes(session.user.role || "")) {
    throw new Error("Unauthorized: CEO, CFO, or Admin role required");
  }

  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      companyName,
      organizationId,
      projectName,
      projectDescription,
      projectStatus = ProjectStatus.LEAD,
      projectStage = ProjectStage.DISCOVERY,
      budget,
      startDate,
      endDate,
      assigneeId,
      isNonprofit = false,
      createLead = false,
      leadSource = "admin_created",
      leadMessage,
      milestones = [],
      createInvoice = false,
      invoiceAmount,
      invoiceTitle,
      invoiceDescription,
      markInvoicePaid = false,
      createMaintenancePlan = false,
      maintenanceTier,
      githubRepo,
      vercelUrl,
      internalNotes,
    } = params;

    // Step 1: Create or find organization
    let organization;
    if (organizationId) {
      organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });
      if (!organization) {
        throw new Error("Organization not found");
      }
    } else {
      const orgSlug = (companyName || clientName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      const uniqueSlug = `${orgSlug}-${Date.now()}`;
      
      organization = await prisma.organization.upsert({
        where: { slug: uniqueSlug },
        update: {},
        create: {
          name: companyName || `${clientName}'s Organization`,
          slug: uniqueSlug,
          email: clientEmail.toLowerCase(),
          phone: clientPhone || null,
        },
      });
    }

    // Step 2: Create or find user
    const user = await prisma.user.upsert({
      where: { email: clientEmail.toLowerCase() },
      update: {
        name: clientName,
        phone: clientPhone || undefined,
        company: companyName || undefined,
      },
      create: {
        email: clientEmail.toLowerCase(),
        name: clientName,
        role: "CLIENT",
        emailVerified: new Date(),
        phone: clientPhone || null,
        company: companyName || null,
      },
    });

    // Step 3: Add user to organization
    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        organizationId: organization.id,
        userId: user.id,
        role: "OWNER",
      },
    });

    // Step 4: Create lead (optional)
    let lead = null;
    if (createLead) {
      lead = await prisma.lead.create({
        data: {
          name: clientName,
          email: clientEmail.toLowerCase(),
          company: companyName || null,
          phone: clientPhone || null,
          message: leadMessage || `Custom project created by admin: ${projectName}`,
          status: LeadStatus.CONVERTED,
          convertedAt: new Date(),
          organizationId: organization.id,
          userId: user.id,
          source: leadSource,
          internalNotes: internalNotes || null,
        },
      });
    }

    // Step 5: Create project
    const project = await prisma.project.create({
      data: {
        name: projectName,
        description: projectDescription || null,
        status: projectStatus,
        currentStage: projectStage,
        budget: budget ? new Prisma.Decimal(budget) : null,
        startDate: startDate || null,
        endDate: endDate || null,
        assigneeId: assigneeId || null,
        isNonprofit: isNonprofit,
        organizationId: organization.id,
        leadId: lead?.id || null,
        githubRepo: githubRepo || null,
        vercelUrl: vercelUrl || null,
        milestones: milestones.length > 0 ? {
          create: milestones.map((m) => ({
            title: m.title,
            description: m.description || null,
            dueDate: m.dueDate || null,
          })),
        } : undefined,
      },
    });

    // Step 6: Create invoice (optional)
    let invoice = null;
    if (createInvoice && invoiceAmount) {
      const invoiceNumber = `INV-${Date.now()}-${project.id.slice(0, 6).toUpperCase()}`;
      invoice = await prisma.invoice.create({
        data: {
          number: invoiceNumber,
          title: invoiceTitle || `Invoice for ${projectName}`,
          description: invoiceDescription || `Initial invoice for project: ${projectName}`,
          amount: new Prisma.Decimal(invoiceAmount),
          tax: new Prisma.Decimal(0),
          total: new Prisma.Decimal(invoiceAmount),
          status: markInvoicePaid ? InvoiceStatus.PAID : InvoiceStatus.DRAFT,
          organizationId: organization.id,
          projectId: project.id,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          sentAt: markInvoicePaid ? new Date() : null,
          paidAt: markInvoicePaid ? new Date() : null,
          items: {
            create: {
              description: invoiceTitle || `Project: ${projectName}`,
              quantity: 1,
              rate: new Prisma.Decimal(invoiceAmount),
              amount: new Prisma.Decimal(invoiceAmount),
            },
          },
        },
      });

      // Create payment record if marked as paid
      if (markInvoicePaid) {
        await prisma.payment.create({
          data: {
            amount: new Prisma.Decimal(invoiceAmount),
            currency: "USD",
            status: PaymentStatus.COMPLETED,
            method: "admin_created",
            invoiceId: invoice.id,
            processedAt: new Date(),
          },
        });
      }
    }

    // Step 7: Create maintenance plan (optional)
    let maintenancePlan = null;
    if (createMaintenancePlan && maintenanceTier) {
      const tierConfig = {
        ESSENTIALS: { monthlyPrice: 50000, supportHours: 8, changeRequests: 3 },
        DIRECTOR: { monthlyPrice: 75000, supportHours: 16, changeRequests: 5 },
        COO: { monthlyPrice: 200000, supportHours: -1, changeRequests: -1 },
      }[maintenanceTier];

      if (tierConfig) {
        maintenancePlan = await prisma.maintenancePlan.create({
          data: {
            projectId: project.id,
            tier: maintenanceTier,
            monthlyPrice: new Prisma.Decimal(tierConfig.monthlyPrice),
            supportHoursIncluded: tierConfig.supportHours,
            changeRequestsIncluded: tierConfig.changeRequests,
            status: MaintenancePlanStatus.ACTIVE,
            billingDay: new Date().getDate(),
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    // Step 8: Emit feed events
    await feedHelpers.projectCreated(project.id, project.name);
    if (invoice && markInvoicePaid) {
      await feedHelpers.paymentSucceeded(project.id, invoiceAmount || 0, invoice.id);
    }

    // Step 9: Create notification for client
    await prisma.notification.create({
      data: {
        title: "Your Project Has Been Created",
        message: `Your project "${projectName}" has been set up and is ready to begin.`,
        type: "INFO",
        userId: user.id,
        projectId: project.id,
      },
    });

    // Revalidate paths
    revalidatePath("/admin/projects");
    revalidatePath("/admin/pipeline");
    revalidatePath("/client/projects");

    return {
      success: true,
      projectId: project.id,
      organizationId: organization.id,
      userId: user.id,
      leadId: lead?.id || null,
      invoiceId: invoice?.id || null,
      maintenancePlanId: maintenancePlan?.id || null,
      message: `Project "${projectName}" created successfully!`,
    };
  } catch (error) {
    console.error("[createCustomProject] Error:", error);
    throw error;
  }
}
