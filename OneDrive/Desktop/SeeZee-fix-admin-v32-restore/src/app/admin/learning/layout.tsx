/**
 * Learning Hub Layout - Provides Learning Hub tabs wrapper
 */

import LearningTabs from "./LearningTabs";

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Learning Hub</h1>
        <p className="admin-page-subtitle">
          Training modules, tools, and resources for team growth
        </p>
      </div>

      <LearningTabs />

      {children}
    </div>
  );
}
