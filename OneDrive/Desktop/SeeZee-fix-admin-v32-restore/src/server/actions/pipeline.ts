"use server";

/**
 * Server actions for Pipeline management
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { revalidateTag } from "next/cache";
import { tags } from "@/lib/tags";
import { logActivity } from "./activity";
import { UserRole, InvoiceStatus, ServiceCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { toPlain } from "@/lib/serialize";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL_SENT"
  | "CONVERTED"
  | "LOST";

// Helper function to create activity
async function createActivity(data: any) {
  return await logActivity({
    type: data.type,
    title: data.title,
    description: data.description,
    userId: data.userId,
    metadata: data.metadata,
  });
}

// Helper function to normalize and validate invoice status
function normalizeInvoiceStatus(status: string): InvoiceStatus {
  const normalized = status.toUpperCase() as InvoiceStatus;
  const validStatuses: InvoiceStatus[] = [
    InvoiceStatus.DRAFT,
    InvoiceStatus.SENT,
    InvoiceStatus.PAID,
    InvoiceStatus.OVERDUE,
    InvoiceStatus.CANCELLED,
  ];
  
  if (!validStatuses.includes(normalized)) {
    throw new Error(`Invalid invoice status: ${status}. Valid statuses are: ${validStatuses.join(", ")}`);
  }
  
  return normalized;
}

/**
 * Get all leads organized by pipeline stage
 */
export async function getPipeline() {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const [leads, projectRequests] = await Promise.all([
      db.lead.findMany({
        include: {
          organization: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.projectRequest.findMany({
        where: {
          status: {
            not: "DRAFT"
          }
        },
        orderBy: {
          createdAt: "desc",
        }
      })
    ]);

    // Normalize ProjectRequests to Lead format
    const mappedRequests = projectRequests.map(req => ({
      id: req.id,
      name: req.name || req.title || "New Project Request",
      email: req.email || req.contactEmail || "",
      phone: null,
      company: req.company,
      status: "NEW", // Map all submitted requests to NEW lead status
      source: "Project Request",
      message: req.description,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      convertedAt: null,
      organizationId: null,
      organization: null,
      requirements: null,
      serviceType: req.services.join(", "),
      timeline: req.timeline,
      budget: req.budget,
      metadata: {
        originalId: req.id,
        type: "ProjectRequest",
        projectType: req.projectType,
        goal: req.goal,
        resourcesUrl: req.resourcesUrl
      }
    }));

    // Combine and sort
    const allItems = [...leads, ...mappedRequests].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Ensure all values are JSON-serializable for client-side consumption
    const plainLeads = toPlain(allItems);

    // Group by status
    const pipeline = {
      NEW: plainLeads.filter((l: any) => l.status === "NEW"),
      CONTACTED: plainLeads.filter((l: any) => l.status === "CONTACTED"),
      QUALIFIED: plainLeads.filter((l: any) => l.status === "QUALIFIED"),
      PROPOSAL_SENT: plainLeads.filter((l: any) => l.status === "PROPOSAL_SENT"),
      CONVERTED: plainLeads.filter((l: any) => l.status === "CONVERTED"),
      LOST: plainLeads.filter((l: any) => l.status === "LOST"),
    };

    return { success: true, pipeline, leads: plainLeads };
  } catch (error) {
    console.error("Failed to fetch pipeline:", error);
    return { success: false, error: "Failed to fetch pipeline", pipeline: null, leads: [] };
  }
}

/**
 * Update lead status (move in pipeline)
 */
export async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
  const user = await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return { success: false, error: "Lead not found" };
    }

    const oldStatus = lead.status;

    const updatedLead = await db.lead.update({
      where: { id: leadId },
      data: {
        status: newStatus,
        ...(newStatus === "CONVERTED" && { convertedAt: new Date() }),
      },
    });

    // Create activity log
    await createActivity({
      type: "LEAD_UPDATED",
      title: `Lead moved from ${oldStatus} to ${newStatus}`,
      description: `${lead.name} (${lead.email})`,
      userId: user.id,
      entityType: "Lead",
      entityId: leadId,
      metadata: {
        oldStatus,
        newStatus,
        leadName: lead.name,
      },
    });

    revalidatePath("/admin/pipeline");
    return { success: true, lead: updatedLead };
  } catch (error) {
    console.error("Failed to update lead status:", error);
    return { success: false, error: "Failed to update lead status" };
  }
}

/**
 * Get single lead details
 */
export async function getLeadDetails(leadId: string) {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        organization: true,
        project: true,
      },
    });

    if (!lead) {
      return { success: false, error: "Lead not found", lead: null };
    }

    return { success: true, lead };
  } catch (error) {
    console.error("Failed to fetch lead details:", error);
    return { success: false, error: "Failed to fetch lead details", lead: null };
  }
}

/**
 * Add notes to a lead
 */
export async function updateLeadNotes(leadId: string, notes: string) {
  const user = await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const lead = await db.lead.update({
      where: { id: leadId },
      data: {
        message: notes, // Storing in message field for now
      },
    });

    revalidatePath("/admin/pipeline");
    return { success: true, lead };
  } catch (error) {
    console.error("Failed to update lead notes:", error);
    return { success: false, error: "Failed to update lead notes" };
  }
}

/**
 * Get all projects
 */
export async function getProjects() {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    // Use explicit select to avoid issues with columns that may not exist in production
    const projects = await db.project.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        budget: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
        assigneeId: true,
        leadId: true,
        organizationId: true,
        questionnaireId: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        maintenancePlan: true,
        maintenanceStatus: true,
        nextBillingDate: true,
        githubRepo: true,
        organization: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        lead: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Decimal budget to number for client components
    // Explicitly construct objects to avoid passing Prisma Decimal objects
    const serializedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      // Send budget as string to avoid precision loss and Decimal crossing
      budget: project.budget ? project.budget.toString() : null,
      startDate: project.startDate,
      endDate: project.endDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      assigneeId: project.assigneeId,
      leadId: project.leadId,
      organizationId: project.organizationId,
      questionnaireId: project.questionnaireId,
      stripeCustomerId: project.stripeCustomerId,
      stripeSubscriptionId: project.stripeSubscriptionId,
      maintenancePlan: project.maintenancePlan,
      maintenanceStatus: project.maintenanceStatus,
      nextBillingDate: project.nextBillingDate,
      githubRepo: project.githubRepo,
      organization: project.organization,
      assignee: project.assignee,
      lead: project.lead,
    }));

    return { success: true, projects: serializedProjects };
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return { success: false, error: "Failed to fetch projects", projects: [] };
  }
}

/**
 * Create invoice from project
 */
export async function createInvoiceFromProject(projectId: string, data: {
  title: string;
  description?: string;
  amount: number;
  dueDate: Date;
}) {
  const user = await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { organization: true },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Generate invoice number
    const invoiceCount = await db.invoice.count();
    const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(5, '0')}`;

    const invoice = await db.invoice.create({
      data: {
        number: invoiceNumber,
        title: data.title,
        description: data.description,
        amount: data.amount,
        tax: data.amount * 0.0, // Add tax calculation if needed
        total: data.amount,
        status: "DRAFT",
        dueDate: data.dueDate,
        organizationId: project.organizationId,
        projectId: projectId,
      },
    });

    // Create activity log
    await createActivity({
      type: "INVOICE_PAID",
      title: `Invoice created for ${project.name}`,
      description: `${invoiceNumber} - $${data.amount}`,
      userId: user.id,
      metadata: {
        invoiceId: invoice.id,
        projectId,
        amount: data.amount,
      },
    });

    revalidatePath("/admin/pipeline");
    revalidatePath("/admin/pipeline/invoices");
    revalidatePath("/admin/pipeline/projects");
    return { success: true, invoice };
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return { success: false, error: "Failed to create invoice" };
  }
}

/**
 * Create invoice with line items
 */
export async function createInvoiceWithLineItems(data: {
  projectId: string;
  organizationId: string;
  title: string;
  description?: string;
  dueDate: Date;
  tax?: number;
  invoiceType?: string;
  isFirstInvoice?: boolean;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}) {
  const user = await requireRole([ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH, ROLE.CEO]);

  try {
    // Validate project and organization
    const project = await db.project.findUnique({
      where: { id: data.projectId },
      include: { organization: true },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    if (project.organizationId !== data.organizationId) {
      return { success: false, error: "Organization mismatch" };
    }

    // Generate invoice number
    const invoiceCount = await db.invoice.count();
    const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(5, '0')}`;

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = data.tax || 0;
    const total = subtotal + taxAmount;

    // Create invoice with line items
    const invoice = await db.invoice.create({
      data: {
        number: invoiceNumber,
        title: data.title,
        description: data.description,
        amount: subtotal,
        tax: taxAmount,
        total: total,
        status: "SENT",
        dueDate: data.dueDate,
        organizationId: data.organizationId,
        projectId: data.projectId,
        invoiceType: data.invoiceType || "custom",
        sentAt: new Date(),
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Create activity log
    await createActivity({
      type: "INVOICE_PAID",
      title: `Invoice created for ${project.name}`,
      description: `${invoiceNumber} - $${total.toFixed(2)}`,
      userId: user.id,
      metadata: {
        invoiceId: invoice.id,
        projectId: data.projectId,
        amount: total,
        itemCount: data.items.length,
      },
    });

    revalidatePath("/admin/pipeline");
    revalidatePath("/admin/pipeline/invoices");
    revalidatePath("/admin/pipeline/projects");
    return { success: true, invoice };
  } catch (error) {
    console.error("Failed to create invoice with line items:", error);
    return { success: false, error: "Failed to create invoice" };
  }
}

/**
 * Get all invoices
 */
export async function getInvoices() {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const invoices = await db.invoice.findMany({
      include: {
        organization: true,
        project: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Use toPlain to recursively serialize all Decimal, Date, and BigInt fields
    // This ensures nested objects like project.budget are also serialized
    const serializedInvoices = invoices.map((invoice) => toPlain(invoice));

    return { success: true, invoices: serializedInvoices };
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return { success: false, error: "Failed to fetch invoices", invoices: [] };
  }
}

/**
 * Delete a lead (CEO only)
 * Handles both actual Leads and ProjectRequests that are displayed as leads
 */
export async function deleteLead(leadId: string) {
  const user = await requireRole([ROLE.CEO]);

  try {
    // First, try to find it as a Lead
    const lead = await db.lead.findUnique({
      where: { id: leadId },
    });

    if (lead) {
      await db.lead.delete({
        where: { id: leadId },
      });

      // Create activity log
      await createActivity({
        type: "LEAD_UPDATED",
        title: `Lead deleted`,
        description: `${lead.name} (${lead.email})`,
        userId: user.id,
        entityType: "Lead",
        entityId: leadId,
        metadata: {
          action: "DELETE",
          leadName: lead.name,
        },
      });

      revalidatePath("/admin/pipeline/leads");
      revalidatePath("/admin/pipeline");
      
      return { success: true };
    }

    // Not found as Lead, check if it's a ProjectRequest
    const projectRequest = await db.projectRequest.findUnique({
      where: { id: leadId },
    });

    if (projectRequest) {
      await db.projectRequest.delete({
        where: { id: leadId },
      });

      // Create activity log
      await createActivity({
        type: "LEAD_UPDATED",
        title: `Project request deleted`,
        description: `${projectRequest.name || projectRequest.title || "Project Request"} (${projectRequest.email || projectRequest.contactEmail || ""})`,
        userId: user.id,
        entityType: "ProjectRequest",
        entityId: leadId,
        metadata: {
          action: "DELETE",
          projectRequestName: projectRequest.name || projectRequest.title,
        },
      });

      revalidatePath("/admin/pipeline/leads");
      revalidatePath("/admin/pipeline");
      
      return { success: true };
    }

    // Not found in either table
    return { success: false, error: "Lead not found" };
  } catch (error) {
    console.error("Failed to delete lead:", error);
    return { success: false, error: "Failed to delete lead" };
  }
}

/**
 * Update a lead (CEO only - full edit)
 */
export async function updateLead(leadId: string, data: {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  status?: LeadStatus;
  source?: string;
  serviceType?: ServiceCategory | null;
  timeline?: string;
  budget?: string;
}) {
  const user = await requireRole([ROLE.CEO]);

  try {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return { success: false, error: "Lead not found" };
    }

    const updatedLead = await db.lead.update({
      where: { id: leadId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.message !== undefined && { message: data.message }),
        ...(data.status !== undefined && { 
          status: data.status,
          ...(data.status === "CONVERTED" && !lead.convertedAt ? { convertedAt: new Date() } : {}),
        }),
        ...(data.source !== undefined && { source: data.source }),
        ...(data.serviceType !== undefined && { 
          serviceType: data.serviceType as ServiceCategory | null 
        }),
        ...(data.timeline !== undefined && { timeline: data.timeline }),
        ...(data.budget !== undefined && { budget: data.budget }),
      },
    });

    // Create activity log
    await createActivity({
      type: "LEAD_UPDATED",
      title: `Lead updated`,
      description: `${updatedLead.name} (${updatedLead.email})`,
      userId: user.id,
      entityType: "Lead",
      entityId: leadId,
      metadata: {
        action: "UPDATE",
        changes: data,
      },
    });

    revalidatePath("/admin/pipeline/leads");
    revalidatePath("/admin/pipeline");
    return { success: true, lead: updatedLead };
  } catch (error) {
    console.error("Failed to update lead:", error);
    return { success: false, error: "Failed to update lead" };
  }
}

/**
 * Delete an invoice (CEO only)
 */
export async function deleteInvoice(invoiceId: string) {
  const user = await requireRole([ROLE.CEO]);

  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        organization: true,
        project: true,
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    await db.invoice.delete({
      where: { id: invoiceId },
    });

    // Create activity log
    await createActivity({
      type: "INVOICE_PAID",
      title: `Invoice deleted`,
      description: `${invoice.number} - ${invoice.title}`,
      userId: user.id,
      entityType: "Invoice",
      entityId: invoiceId,
      metadata: {
        action: "DELETE",
        invoiceNumber: invoice.number,
        amount: Number(invoice.total),
      },
    });

    revalidatePath("/admin/pipeline/invoices");
    revalidatePath("/admin/pipeline");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    return { success: false, error: "Failed to delete invoice" };
  }
}

/**
 * Update an invoice (CEO only - full edit)
 */
export async function updateInvoice(invoiceId: string, data: {
  title?: string;
  description?: string;
  amount?: number;
  tax?: number;
  total?: number;
  status?: string;
  dueDate?: Date;
}) {
  const user = await requireRole([ROLE.CEO]);

  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.tax !== undefined) updateData.tax = data.tax;
    if (data.total !== undefined) updateData.total = data.total;
    if (data.status !== undefined) {
      const normalizedStatus = normalizeInvoiceStatus(data.status);
      updateData.status = normalizedStatus;
      if (normalizedStatus === InvoiceStatus.PAID && !invoice.paidAt) {
        updateData.paidAt = new Date();
      }
      if (normalizedStatus === InvoiceStatus.SENT && !invoice.sentAt) {
        updateData.sentAt = new Date();
      }
    }
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

    const updatedInvoice = await db.invoice.update({
      where: { id: invoiceId },
      data: updateData,
    });

    // Create activity log
    await createActivity({
      type: "INVOICE_PAID",
      title: `Invoice updated`,
      description: `${updatedInvoice.number} - ${updatedInvoice.title}`,
      userId: user.id,
      entityType: "Invoice",
      entityId: invoiceId,
      metadata: {
        action: "UPDATE",
        changes: data,
      },
    });

    revalidatePath("/admin/pipeline/invoices");
    revalidatePath("/admin/pipeline");
    return { success: true, invoice: updatedInvoice };
  } catch (error) {
    console.error("Failed to update invoice:", error);
    return { success: false, error: "Failed to update invoice" };
  }
}
