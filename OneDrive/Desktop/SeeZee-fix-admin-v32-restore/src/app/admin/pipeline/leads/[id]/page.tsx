/**
 * Lead Detail Page
 * Shows questionnaire responses, receipt, and status management
 */

import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LeadDetailClient } from "@/components/admin/LeadDetailClient";

export const dynamic = "force-dynamic";

interface LeadDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const session = await auth();
  
  if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
    redirect("/login");
  }

  try {
    const { id } = await params;
    
    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      console.error("Invalid lead ID:", id);
      notFound();
    }

    // First, try to find as a Lead
    let lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        organization: true,
        project: true,
      },
    });

    // If not found as a Lead, check if it's a ProjectRequest
    if (!lead) {
      const projectRequest = await prisma.projectRequest.findUnique({
        where: { id },
      });

      if (projectRequest) {
        // Convert ProjectRequest to Lead-like format for display
        // Prioritize name field, but extract name from title if needed (e.g., "John's Maintenance Plan Request" -> "John")
        let displayName = projectRequest.name;
        if (!displayName && projectRequest.title) {
          // Try to extract name from title (e.g., "John's Maintenance Plan Request" -> "John")
          const nameMatch = projectRequest.title.match(/^([^']+?)(?:'s|'s\s)/);
          if (nameMatch) {
            displayName = nameMatch[1].trim();
          } else {
            // If title doesn't contain a name, use the contact email username as fallback
            const emailUsername = projectRequest.contactEmail?.split('@')[0] || 'Unknown';
            displayName = emailUsername;
          }
        }
        
        lead = {
          id: projectRequest.id,
          name: displayName || "New Project Request",
          email: projectRequest.email || projectRequest.contactEmail || "",
          phone: null,
          company: projectRequest.company,
          status: "NEW" as any,
          source: "Project Request",
          message: projectRequest.description,
          notes: null,
          requirements: null,
          serviceType: Array.isArray(projectRequest.services) 
            ? projectRequest.services.join(", ") 
            : projectRequest.services || null,
          timeline: projectRequest.timeline,
          budget: projectRequest.budget,
          createdAt: projectRequest.createdAt,
          updatedAt: projectRequest.updatedAt,
          convertedAt: null,
          organizationId: null,
          organization: null,
          project: null,
          metadata: {
            type: "ProjectRequest",
            originalId: projectRequest.id,
            projectType: projectRequest.projectType,
            goal: projectRequest.goal,
            resourcesUrl: projectRequest.resourcesUrl,
          } as any,
        } as any;
      }
    }

    if (!lead) {
      console.log(`Lead or ProjectRequest not found with ID: ${id}`);
      notFound();
    }

    // Try to find the associated questionnaire
    let questionnaire = null;
    if (lead.metadata && typeof lead.metadata === 'object' && 'qid' in lead.metadata) {
      try {
        const qid = (lead.metadata as any).qid;
        if (qid && typeof qid === 'string') {
          questionnaire = await prisma.questionnaire.findUnique({
            where: { id: qid },
          });
        }
      } catch (error) {
        // If questionnaire lookup fails, just continue without it
        console.error("Error fetching questionnaire:", error);
      }
    }

    return (
      <div className="space-y-6">
        <LeadDetailClient lead={lead} questionnaire={questionnaire} />
      </div>
    );
  } catch (error) {
    console.error("Error in LeadDetailPage:", error);
    // If it's a database connection error or similar, still show 404
    // The error will be logged for debugging
    notFound();
  }
}
