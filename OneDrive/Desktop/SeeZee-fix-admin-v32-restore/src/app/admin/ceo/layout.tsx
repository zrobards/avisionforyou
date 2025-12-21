/**
 * CEO Section Layout - CEO Only (AdminAppShell is provided by parent layout)
 */

import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
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

  return <>{children}</>;
}

