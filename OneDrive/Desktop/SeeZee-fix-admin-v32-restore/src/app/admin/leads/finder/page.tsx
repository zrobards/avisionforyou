import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import { LeadFinderClient } from "./LeadFinderClient";

export const dynamic = "force-dynamic";

export default async function LeadFinderPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Only CEO, CFO, or OUTREACH roles can access this page
  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Fetch leads with Client Finder fields
  const leads = await prisma.lead.findMany({
    where: {
      // Only show leads that haven't been converted yet
      convertedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      message: true,
      status: true,
      source: true,
      createdAt: true,
      updatedAt: true,
      // Client Finder specific fields
      ein: true,
      websiteUrl: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      latitude: true,
      longitude: true,
      category: true,
      subcategory: true,
      annualRevenue: true,
      employeeCount: true,
      leadScore: true,
      hasWebsite: true,
      websiteQuality: true,
      needsAssessment: true,
      assignedToId: true,
      lastContactedAt: true,
      emailsSent: true,
      lastEmailSentAt: true,
      tags: true,
    },
    orderBy: [
      { leadScore: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Get statistics
  const stats = {
    total: leads.length,
    hot: leads.filter((l) => l.leadScore >= 80).length,
    warm: leads.filter((l) => l.leadScore >= 60 && l.leadScore < 80).length,
    contacted: leads.filter((l) => l.emailsSent > 0).length,
    withWebsite: leads.filter((l) => l.hasWebsite).length,
    withoutWebsite: leads.filter((l) => !l.hasWebsite).length,
  };

  // Get unique categories and states for filters
  const categories = [...new Set(leads.map((l) => l.category).filter(Boolean))];
  const states = [...new Set(leads.map((l) => l.state).filter(Boolean))];

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      }
    >
      <LeadFinderClient
        initialLeads={leads as any}
        stats={stats}
        categories={categories as string[]}
        states={states as string[]}
      />
    </Suspense>
  );
}

