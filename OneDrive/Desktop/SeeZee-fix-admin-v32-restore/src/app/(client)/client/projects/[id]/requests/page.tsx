/**
 * Project Requests Page
 * Full-page view of AI-powered request management
 */

import { RequestsPanel } from "@/components/client/RequestsPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectRequestsPage({
  params,
}: PageProps) {
  const { id: projectId } = await params;

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Requests Panel */}
      <RequestsPanel projectId={projectId} />
    </div>
  );
}
