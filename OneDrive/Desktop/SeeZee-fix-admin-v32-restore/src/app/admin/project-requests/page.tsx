"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { FiTrash2, FiMail, FiUser, FiCalendar, FiDollarSign } from "react-icons/fi";

interface ProjectRequestRow {
  id: string;
  title: string;
  user: string;
  email: string;
  status: string;
  budget: string;
  createdAt: string;
}

export default function AdminProjectRequestsPage() {
  const { data: session } = useSession();
  const [projectRequests, setProjectRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjectRequests() {
      try {
        const response = await fetch("/api/admin/project-requests");
        if (response.ok) {
          const data = await response.json();
          setProjectRequests(data.projectRequests || []);
        }
      } catch (error) {
        console.error("Failed to load project requests:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProjectRequests();
  }, []);

  const handleDelete = async (requestId: string, requestTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${requestTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(requestId);
    try {
      const response = await fetch(`/api/admin/project-requests/${requestId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete project request");
      }

      // Remove from local state
      setProjectRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error: any) {
      console.error("Failed to delete project request:", error);
      alert(`Failed to delete project request: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const rows: ProjectRequestRow[] = projectRequests.map((request: any) => ({
    id: request.id,
    title: request.title || "Untitled Request",
    user: request.user?.name || request.user?.email || "Unknown",
    email: request.contactEmail || request.email || request.user?.email || "—",
    status: String(request.status || ""),
    budget: request.budget && request.budget !== "UNKNOWN" 
      ? request.budget.replace(/_/g, " ") 
      : "—",
    createdAt: request.createdAt ? new Date(request.createdAt).toISOString() : "",
  }));

  const columns: DataTableColumn<ProjectRequestRow>[] = [
    {
      header: "Request",
      key: "title",
      render: (request) => (
        <div className="space-y-1">
          <p className="font-heading text-sm font-semibold text-white">{request.title}</p>
          <p className="text-xs text-gray-400 line-clamp-1">{request.email}</p>
        </div>
      ),
    },
    {
      header: "User",
      key: "user",
      render: (request) => (
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <FiUser className="h-3.5 w-3.5 text-gray-500" />
          {request.user}
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (request) => <StatusBadge status={request.status.toLowerCase()} size="sm" />,
    },
    {
      header: "Budget",
      key: "budget",
      render: (request) => (
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <FiDollarSign className="h-3.5 w-3.5 text-gray-500" />
          {request.budget}
        </div>
      ),
    },
    {
      header: "Created",
      key: "createdAt",
      render: (request) => (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <FiCalendar className="h-3.5 w-3.5 text-gray-500" />
          {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "—"}
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (request) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(request.id, request.title);
            }}
            disabled={deleting === request.id}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Request"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const activeRequests = rows.filter((r) => 
    ["DRAFT", "SUBMITTED", "REVIEWING", "NEEDS_INFO"].includes(r.status.toUpperCase())
  ).length;

  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <header className="space-y-3 relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block">
            Client Management
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">Project Requests</h1>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading project requests...</div>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-8">
        <header className="space-y-3 relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block">
            Client Management
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">Project Requests</h1>
          <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
            Manage all project requests from clients. Delete requests that are no longer needed.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">Active Requests</p>
              <div className="w-10 h-10 bg-trinity-red/20 rounded-lg flex items-center justify-center border border-trinity-red/30">
                <FiMail className="w-5 h-5 text-trinity-red" />
              </div>
            </div>
            <p className="text-4xl font-heading font-bold text-white mb-1">{activeRequests}</p>
            <p className="text-xs text-gray-500">Awaiting review</p>
          </div>
          <div className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">Total Requests</p>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                <FiCalendar className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-4xl font-heading font-bold text-white mb-1">{rows.length}</p>
            <p className="text-xs text-gray-500">All time</p>
          </div>
        </section>

        <div className="glass-effect rounded-2xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all duration-300">
          <DataTable columns={columns} data={rows} emptyMessage="No project requests found" />
        </div>
      </div>
  );
}

