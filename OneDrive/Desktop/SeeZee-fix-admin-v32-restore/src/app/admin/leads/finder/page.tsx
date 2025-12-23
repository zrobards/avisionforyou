import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Redirect from old Lead Finder route to combined Leads page
 */
export default async function LeadFinderPage() {
  redirect("/admin/leads");
}

