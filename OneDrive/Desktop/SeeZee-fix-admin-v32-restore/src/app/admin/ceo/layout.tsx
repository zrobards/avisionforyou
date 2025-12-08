/**
 * CEO Section Layout - CEO Only
 */

import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { redirect } from "next/navigation";

export default async function CEOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  // Only CEO can access - redirect to no-access to prevent loops
  if (!user || user.role !== ROLE.CEO) {
    redirect("/no-access");
  }

  return (
    <AdminAppShell user={user}>
      {children}
    </AdminAppShell>
  );
}

