/**
 * Community Dashboard Layout
 * Provides consistent layout for community pages with collapsible sidebar
 */

import { getCurrentUser } from "@/lib/auth/requireRole";
import { canAccessCommunityRoutes } from "@/lib/role";
import { redirect } from "next/navigation";
import { CommunityDashboardShell } from "@/components/community/CommunityDashboardShell";

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  // Check auth at layout level
  if (!user) {
    redirect("/login");
  }
  
  // ADMIN, BOARD, ALUMNI, and COMMUNITY can access community routes
  if (!canAccessCommunityRoutes(user.role)) {
    redirect("/no-access");
  }

  return (
    <CommunityDashboardShell user={user}>
      {children}
    </CommunityDashboardShell>
  );
}
