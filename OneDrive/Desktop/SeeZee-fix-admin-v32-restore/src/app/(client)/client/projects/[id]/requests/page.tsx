/**
 * Project Requests Page
 * Full-page view of AI-powered request management
 */

import { RequestsPanel } from "@/components/client/RequestsPanel";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectRequestsPage({
  params,
}: PageProps) {
  const { id: projectId } = await params;

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/client/projects/${projectId}`}
          className="glass-panel p-2 rounded-lg hover:border-purple-500/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Change Requests</h1>
          <p className="text-zinc-400 mt-1">
            Submit and manage change requests for your project
          </p>
        </div>
      </div>

      {/* Requests Panel */}
      <RequestsPanel projectId={projectId} />
    </div>
  );
}
