/**
 * Lead Detail Page
 * Shows questionnaire responses, receipt, and status management
 */

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LeadDetailClient } from "@/components/admin/LeadDetailClient";

export const dynamic = "force-dynamic";

interface LeadDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  try {
    const { id } = await params;
    
    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      console.error("Invalid lead ID:", id);
      notFound();
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        organization: true,
        project: true,
      },
    });

    if (!lead) {
      console.log(`Lead not found with ID: ${id}`);
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
