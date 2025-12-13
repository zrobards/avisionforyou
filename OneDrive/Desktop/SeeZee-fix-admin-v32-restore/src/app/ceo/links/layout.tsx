/**
 * CEO Links Page Layout - Custom layout for CEO links page
 */

import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

export default async function CEOLinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // CEO-only access check
  await requireRole([ROLE.CEO]);
  
  return <>{children}</>;
}

