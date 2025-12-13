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
  LEAD: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  QUOTED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DEPOSIT_PAID: "bg-green-500/20 text-green-400 border-green-500/30",
  ACTIVE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  REVIEW: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  MAINTENANCE: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all"
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
