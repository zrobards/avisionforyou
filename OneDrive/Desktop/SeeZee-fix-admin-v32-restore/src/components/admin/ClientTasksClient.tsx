"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { FiCalendar, FiFlag, FiUsers, FiCheckSquare, FiPlus, FiFile, FiDownload } from "react-icons/fi";
import { AdvancedAssignmentForm } from "./AdvancedAssignmentForm";

interface TaskRow {
  id: string;
  title: string;
  project: string;
  client: string;
  status: string;
  priority: string;
  dueDate: string | null;
  type?: string;
  requiresUpload?: boolean;
  createdAt?: string;
  completedAt?: string | null;
}

interface ClientTasksClientProps {
  rows: TaskRow[];
  overdue: number;
  openTasks: number;
}

export function ClientTasksClient({ rows, overdue, openTasks }: ClientTasksClientProps) {
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  const columns: DataTableColumn<TaskRow>[] = [
    {
      header: "Task",
      key: "title",
      render: (task) => (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{task.title}</p>
          <p className="text-xs text-gray-500">{task.project}</p>
        </div>
      ),
    },
    {
      header: "Client",
      key: "client",
      render: (task) => (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <FiUsers className="h-3.5 w-3.5 text-gray-500" />
          {task.client}
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (task) => <StatusBadge status={task.status} size="sm" />,
    },
    {
      header: "Priority",
      key: "priority",
      render: (task) => (
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
          <FiFlag className="h-3.5 w-3.5" />
          {task.priority || "unknown"}
        </span>
      ),
    },
    {
      header: "Due",
      key: "dueDate",
      render: (task) => (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <FiCalendar className="h-3.5 w-3.5 text-gray-500" />
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
        </div>
      ),
    },
    {
      header: "Type",
      key: "type",
      render: (task) => (
        <span className="text-xs text-gray-400 capitalize">
          {task.type || "general"}
        </span>
      ),
    },
  ];

  return (
    <>
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="seezee-glass seezee-border-glow rounded-2xl p-6 text-white transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">Open Tasks</p>
            <div className="w-10 h-10 bg-seezee-red/20 rounded-lg flex items-center justify-center border border-seezee-red/30">
              <FiCheckSquare className="w-5 h-5 text-seezee-red" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-white mb-1">{openTasks}</p>
          <p className="text-xs text-slate-500">Active deliverables</p>
        </div>
        <div className="seezee-glass seezee-border-glow rounded-2xl p-6 text-white transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">Overdue</p>
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
              <FiFlag className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-white mb-1">{overdue}</p>
          <p className="text-xs text-slate-500">Needs attention</p>
        </div>
        <div className="seezee-glass seezee-border-glow rounded-2xl p-6 text-white transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">Total Tasks</p>
            <div className="w-10 h-10 bg-seezee-blue/20 rounded-lg flex items-center justify-center border border-seezee-blue/30">
              <FiCalendar className="w-5 h-5 text-seezee-blue" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-white mb-1">{rows.length}</p>
          <p className="text-xs text-slate-500">All time</p>
        </div>
      </section>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">All Client Tasks</h2>
        <button
          onClick={() => setShowAssignmentForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-seezee-red hover:bg-seezee-red/90 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-seezee-red/25"
        >
          <FiPlus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      <div className="seezee-glass rounded-2xl p-6 transition-all duration-300">
        <DataTable columns={columns} data={rows} emptyMessage="No tasks found" />
      </div>

      {showAssignmentForm && (
        <AdvancedAssignmentForm
          isOpen={showAssignmentForm}
          onClose={() => setShowAssignmentForm(false)}
          onSuccess={() => {
            setShowAssignmentForm(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

