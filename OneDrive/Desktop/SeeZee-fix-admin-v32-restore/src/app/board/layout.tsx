/**
 * Board Member Dashboard Layout
 * Provides consistent layout for board member pages with collapsible sidebar
 */

import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE, canAccessBoardRoutes } from "@/lib/role";
import { redirect } from "next/navigation";
import { BoardDashboardShell } from "@/components/board/BoardDashboardShell";

export default async function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  // Check auth at layout level
  if (!user) {
    redirect("/login");
  }
  
  // Only ADMIN and BOARD members can access board routes
  if (!canAccessBoardRoutes(user.role)) {
    redirect("/no-access");
  }

  return (
    <BoardDashboardShell user={user}>
      {children}
    </BoardDashboardShell>
  );
}
