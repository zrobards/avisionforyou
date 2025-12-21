/**
 * Pipeline Layout - Provides Pipeline tabs wrapper
 */

import PipelineTabs from "./PipelineTabs";

export default function PipelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Pipeline</h1>
        <p className="admin-page-subtitle">
          Manage leads, projects, and invoices
        </p>
      </div>

      <PipelineTabs />

      {/* Content */}
      {children}
    </div>
  );
}
