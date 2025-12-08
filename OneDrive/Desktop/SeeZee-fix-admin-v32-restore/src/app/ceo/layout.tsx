/**
 * CEO Dashboard Layout - Redirects to /admin
 * CEO features are now consolidated into /admin with role-based sections
 * Exception: /ceo/links page has its own layout and won't be redirected
 */

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

export default async function CEOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // CEO-only access check - this will redirect to /no-access if not CEO
  // or to /login if not authenticated
  await requireRole([ROLE.CEO]);
  
  // If we get here, user is CEO
  // Redirect to admin dashboard where CEO features are now located
  // Note: /ceo/links has its own layout that overrides this redirect
  redirect("/admin");
}
