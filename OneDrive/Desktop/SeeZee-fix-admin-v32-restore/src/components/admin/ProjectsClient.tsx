"use client";

/**
 * Projects Client Component
 */

import { DataTable, type Column } from "@/components/admin/DataTable";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  budget: string | null;
  organization: {
    id: string;
    name: string;
  };
  assignee: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  createdAt: Date;
}

interface ProjectsClientProps {
  projects: Project[];
}

const statusColors: Record<string, string> = {
  LEAD: "bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30",
  QUOTED: "bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30",
  DEPOSIT_PAID: "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30",
  ACTIVE: "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30",
  REVIEW: "bg-[#f97316]/20 text-[#f97316] border-[#f97316]/30",
  COMPLETED: "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30",
  MAINTENANCE: "bg-[#22d3ee]/20 text-[#22d3ee] border-[#22d3ee]/30",
  CANCELLED: "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30",
};

const statusLabels: Record<string, string> = {
  LEAD: "Lead",
  QUOTED: "Quoted",
  DEPOSIT_PAID: "Deposit Paid",
  ACTIVE: "Active",
  REVIEW: "Review",
  COMPLETED: "Completed",
  MAINTENANCE: "Maintenance",
  CANCELLED: "Cancelled",
};

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const router = useRouter();

  const columns: Column<Project>[] = [
    { key: "name", label: "Project", sortable: true },
    {
      key: "organization",
      label: "Client",
      sortable: true,
      render: (project) => project.organization.name,
    },
    {
      key: "status",
      label: "Status",
      render: (project) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
            statusColors[project.status] || "bg-slate-500/20 text-slate-400 border-slate-500/30"
          }`}
        >
          {statusLabels[project.status] || project.status}
        </span>
      ),
    },
    {
      key: "assignee",
      label: "Assigned To",
      render: (project) => (
        <span className="text-sm text-slate-300">
          {project.assignee?.name || "Unassigned"}
        </span>
      ),
    },
    {
      key: "budget",
      label: "Budget",
      render: (project) => (
        <span className="text-sm text-slate-300">
          {project.budget ? `$${parseFloat(project.budget).toLocaleString()}` : "—"}
        </span>
      ),
    },
    {
      key: "endDate",
      label: "Due Date",
      render: (project) => (
        <span className="text-sm text-slate-300">
          {project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        data={projects}
        columns={columns}
        searchPlaceholder="Search projects..."
        actions={
          <button
            onClick={() => router.push("/admin/pipeline/leads")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-semibold transition-all shadow-lg shadow-[#ef4444]/25 hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Convert Lead
          </button>
        }
        onRowClick={(project) => router.push(`/admin/pipeline/projects/${project.id}`)}
      />
    </div>
  );
}
