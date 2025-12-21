/**
 * Email Templates Manager
 * Create and manage email templates for outreach, proposals, invoices, etc.
 */

import { TemplatesClient } from "@/components/admin/templates/TemplatesClient";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  // Auth check is handled in layout.tsx to prevent flash

  // Fetch templates
  const templates = await db.emailTemplate.findMany({
    orderBy: [
      { category: "asc" },
      { name: "asc" },
    ],
  });

  // Get usage stats (campaigns using each template)
  const campaignCounts = await db.emailCampaign.groupBy({
    by: ["templateId"],
    _count: { id: true },
  });

  const templatesWithStats = templates.map((template) => ({
    ...template,
    usageCount: campaignCounts.find((c) => c.templateId === template.id)?._count.id || 0,
  }));

  return (
    <TemplatesClient templates={templatesWithStats} />
  );
}

