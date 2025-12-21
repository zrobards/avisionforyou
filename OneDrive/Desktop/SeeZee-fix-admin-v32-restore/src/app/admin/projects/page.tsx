"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { getProjects } from "@/server/actions";
import { FiCalendar, FiUsers, FiTrash2, FiEdit } from "react-icons/fi";

interface ProjectRow {
  id: string;
  name: string;
  client: string;
  status: string;
  budget: number | null;
  dueDate: string | null;
  assignee: string;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function AdminProjectsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      const projectsResult = await getProjects();
      setProjects(projectsResult.success ? projectsResult.projects : []);
      setLoading(false);
    }
    loadProjects();
  }, []);

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(projectId);
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete project");
      }

      // Remove from local state
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (error: any) {
      console.error("Failed to delete project:", error);
      alert(`Failed to delete project: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const rows: ProjectRow[] = projects.map((project: any) => ({
    id: project.id,
    name: project.name,
    client: project.organization?.name ?? project.lead?.company ?? "Unassigned",
    status: String(project.status ?? ""),
    budget: project.budget != null ? Number(project.budget) : null,
    dueDate: project.dueDate ? new Date(project.dueDate).toISOString() : null,
    assignee:
      project.assignee?.name ?? project.assignee?.email ?? project.assignedToRole ?? "Unassigned",
  }));

  const columns: DataTableColumn<ProjectRow>[] = [
    {
      header: "Project",
      key: "name",
      render: (project) => (
        <div className="space-y-1">
          <p className="font-heading text-sm font-semibold text-white">{project.name}</p>
          <p className="text-xs text-gray-400">{project.client}</p>
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (project) => <StatusBadge status={project.status.toLowerCase()} size="sm" />,
    },
    {
      header: "Budget",
      key: "budget",
      render: (project) => (
        <span className="text-sm font-semibold text-white">
          {project.budget ? currencyFormatter.format(project.budget) : "—"}
        </span>
      ),
    },
    {
      header: "Due Date",
      key: "dueDate",
      render: (project) => (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <FiCalendar className="h-3.5 w-3.5 text-gray-500" />
          {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "Not set"}
        </div>
      ),
    },
    {
      header: "Owner",
      key: "assignee",
      render: (project) => (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <FiUsers className="h-3.5 w-3.5 text-gray-500" />
          {project.assignee}
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      className: "w-32",
      render: (project) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/projects/${project.id}`);
            }}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="View/Edit Project"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(project.id, project.name);
            }}
            disabled={deleting === project.id}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Project"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalBudget = rows.reduce((sum, project) => sum + (project.budget ?? 0), 0);
  const activeProjects = rows.filter((project) => !["ARCHIVED", "COMPLETED"].includes(project.status.toUpperCase())).length;

  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <header className="space-y-3 relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block">
            Delivery Operations
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">Projects</h1>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-8">
        <header className="space-y-3 relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block">
            Delivery Operations
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">Projects</h1>
          <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
            Portfolio view of every active build, including assigned owners and projected revenue impact.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">Active Projects</p>
              <div className="w-10 h-10 bg-trinity-red/20 rounded-lg flex items-center justify-center border border-trinity-red/30">
                <FiUsers className="w-5 h-5 text-trinity-red" />
              </div>
            </div>
            <p className="text-4xl font-heading font-bold text-white mb-1">{activeProjects}</p>
            <p className="text-xs text-gray-500">In progress</p>
          </div>
          <div className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">Total Budget</p>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <span className="text-green-400 text-xl font-bold">$</span>
              </div>
            </div>
            <p className="text-4xl font-heading font-bold text-white mb-1">{currencyFormatter.format(totalBudget)}</p>
            <p className="text-xs text-gray-500">Revenue pipeline</p>
          </div>
          <div className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">Total Projects</p>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                <FiCalendar className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-4xl font-heading font-bold text-white mb-1">{rows.length}</p>
            <p className="text-xs text-gray-500">All time</p>
          </div>
        </section>

        <div className="glass-effect rounded-2xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all duration-300">
          <div className="overflow-x-auto">
            <DataTable 
              columns={columns} 
              data={rows} 
              emptyMessage="No projects found"
            />
          </div>
        </div>
      </div>
  );
}

