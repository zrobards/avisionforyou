import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Redirect from /admin/leads/[id] to /admin/pipeline/leads/[id]
 * This maintains backwards compatibility with old links
 */
export default async function AdminLeadDetailRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`/admin/pipeline/leads/${id}`);
}
