/**
 * CEO Links Management Page
 * Custom CEO-only links page connected to the links database model
 */

import { getLinks } from "@/server/actions";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { CEOLinksClient } from "@/components/ceo/CEOLinksClient";

export const dynamic = "force-dynamic";

export default async function CEOLinksPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const result = await getLinks();
  const links = result.success ? result.links : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <CEOLinksClient links={links} user={user} />
    </div>
  );
}

