/**
 * Leads & Lead Finder
 * Combined page for viewing all leads and finding new prospects
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { ClientFinderClient } from "@/components/admin/leads/ClientFinderClient";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Only CEO, CFO, or OUTREACH roles can access this page
  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Data will be fetched client-side from API for real-time updates
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      }
    >
      <ClientFinderClient />
    </Suspense>
  );
}

