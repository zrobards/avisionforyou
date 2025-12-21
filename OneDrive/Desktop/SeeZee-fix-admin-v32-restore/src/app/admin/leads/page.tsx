/**
 * Client Finder Tool
 * Map-based lead discovery and management
 */

import { ClientFinderClient } from "@/components/admin/leads/ClientFinderClient";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function ClientFinderPage() {
  // Auth check is handled in layout.tsx to prevent flash

  // Fetch leads with prospect data
  const leads = await db.lead.findMany({
    orderBy: [
      { leadScore: "desc" },
      { createdAt: "desc" },
    ],
    take: 500,
  });

  // Get stats
  const stats = {
    total: leads.length,
    hot: leads.filter((l) => l.leadScore >= 80).length,
    warm: leads.filter((l) => l.leadScore >= 60 && l.leadScore < 80).length,
    contacted: leads.filter((l) => l.status === "CONTACTED").length,
    converted: leads.filter((l) => l.status === "CONVERTED").length,
  };

  // Get unique categories and states for filters
  const categories = [...new Set(leads.map((l) => l.category).filter(Boolean))] as string[];
  const states = [...new Set(leads.map((l) => l.state).filter(Boolean))] as string[];

  return (
    <ClientFinderClient 
      initialLeads={leads}
      stats={stats}
      categories={categories}
      states={states}
    />
  );
}

