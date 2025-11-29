/**
 * Settings Layout - Wraps settings page with AdminAppShell
 */

import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { getCurrentUser } from "@/lib/auth/requireRole";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  return (
    <AdminAppShell user={user}>
      {children}
    </AdminAppShell>
  );
}
















