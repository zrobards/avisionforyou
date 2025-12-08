"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { feedHelpers } from "@/lib/feed/emit";
import { Prisma, ProjectStatus } from "@prisma/client";

/**
 * SeeZee V2: Convert a lead to a project
 * CEO/CFO action to convert lead to active project with QUOTED status
 * This is the ONLY lead conversion function - all duplicates have been removed
 */
export async function convertLeadToProject(leadId: string, projectData?: { 
  estimatedBudget?: number;
  notes?: string;
}) {
  const session = await auth();
  
  // Enforce CEO/CFO role requirement
  if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
    return { success: false, error: "Unauthorized: CEO or CFO role required" };
  }

  try {
    // Get the lead with organization
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { organization: true },
    });

    if (!lead) {
      return { success: false, error: "Lead not found" };
    }

    if (lead.status === "CONVERTED") {
      return { success: false, error: "Lead already converted to project" };
    }

    // Check if project already exists
    const existingProject = await prisma.project.findFirst({
      where: { leadId },
    });

    if (existingProject) {
      return { success: false, error: "Project already exists for this lead" };
    }

    // Create organization if lead doesn't have one
    let orgId = lead.organizationId;
    if (!orgId) {
      const orgName = lead.company || `${lead.name}'s Organization`;
      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const organization = await prisma.organization.create({
        data: {
          name: orgName,
          slug: `${slug}-${Date.now()}`, // Ensure unique slug
          email: lead.email,
          phone: lead.phone,
        },
      });
      
      orgId = organization.id;
      
      // Update lead with organizationId
      await prisma.lead.update({
        where: { id: leadId },
        data: { organizationId: orgId },
      });
    }

    // Extract questionnaireId from lead metadata (legacy support)
    const questionnaireId = lead.metadata && typeof lead.metadata === 'object' && 'qid' in lead.metadata 
      ? (lead.metadata as any).qid 
      : null;

    // Check if questionnaireId is already linked to another project
    if (questionnaireId) {
      const projectWithQuestionnaire = await prisma.project.findUnique({
        where: { questionnaireId },
      });

      if (projectWithQuestionnaire) {
        return { success: false, error: "This questionnaire is already linked to another project" };
      }
    }

    // Create the project with QUOTED status (V2 workflow)
    // Budget should be set manually in admin after conversion
    const project = await prisma.project.create({
      data: {
        name: lead.company || `Project for ${lead.name}`,
        description: lead.message || `${lead.serviceType || "Web"} project`,
        status: ProjectStatus.QUOTED, // V2: Project is being quoted
        organizationId: orgId,
        leadId: lead.id,
        questionnaireId,
        // Set budget from projectData if provided, otherwise null (admin will set manually)
        budget: projectData?.estimatedBudget ? new Prisma.Decimal(projectData.estimatedBudget) : null,
        // Note: Conversion notes from projectData.notes are not stored in Project model
        // They can be accessed via the lead relationship if needed
      },
    });

    // Update lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "CONVERTED",
        convertedAt: new Date(),
      },
    });

    // Link user to organization if they exist
    // Find user by email from the lead
    const user = await prisma.user.findUnique({
      where: { email: lead.email },
    });

    if (user) {
      // Check if user is already a member of the organization
      const existingMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: user.id,
          },
        },
      });

      // If not a member, add them to the organization
      if (!existingMember) {
        await prisma.organizationMember.create({
          data: {
            organizationId: orgId,
            userId: user.id,
            role: "OWNER", // Lead creator becomes owner
          },
        });
      }
    }

    // Emit feed event
    await feedHelpers.projectCreated(project.id, project.name);

    // Revalidate all relevant pages to show new project
    revalidatePath("/admin/pipeline/leads");
    revalidatePath(`/admin/pipeline/leads/${leadId}`);
    revalidatePath("/admin/pipeline/projects");
    revalidatePath(`/admin/pipeline/projects/${project.id}`);
    revalidatePath("/admin/pipeline");
    revalidatePath("/admin/projects");
    
    // Revalidate client pages so the new project appears
    revalidatePath("/client");
    revalidatePath("/client/projects");
    revalidatePath("/client/dashboard");

    return { success: true, projectId: project.id };
  } catch (error) {
    console.error("[Convert Lead to Project Error]", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}

// Legacy alias for backward compatibility - will be removed in cleanup phase
export const approveLeadAndCreateProject = convertLeadToProject;
