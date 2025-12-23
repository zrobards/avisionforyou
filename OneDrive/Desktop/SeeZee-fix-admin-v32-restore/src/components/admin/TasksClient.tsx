"use client";

/**
 * Tasks Client Component with Bulk Operations - Navy Theme
 */

import { useState } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { updateTaskStatus, createTask, assignTask, bulkUpdateTaskStatus, bulkAssignTasks, bulkDeleteTasks } from "@/server/actions";
import { Plus, CheckSquare, Clock, AlertCircle, Trash2, UserPlus, LayoutGrid, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TasksKanbanBoard } from "./tasks/TasksKanbanBoard";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  assignedTo: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

interface TasksClientProps {
  initialTasks: Task[];
  stats: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    overdue: number;
  };
}

const statusColors: Record<string, string> = {
  TODO: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  IN_PROGRESS: "bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30",
  DONE: "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-500/20 text-slate-400",
  MEDIUM: "bg-[#f59e0b]/20 text-[#f59e0b]",
  HIGH: "bg-[#ef4444]/20 text-[#ef4444]",
};

export function TasksClient({ initialTasks, stats }: TasksClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<"all" | "TODO" | "IN_PROGRESS" | "DONE">("all");
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  // Map tasks to kanban format
  const kanbanTasks = tasks.map((task) => ({
    ...task,
    column: task.status === "TODO" ? "todo" : 
            task.status === "IN_PROGRESS" ? "in-progress" :
            task.status === "SUBMITTED" ? "review" : "done",
    position: 0,
    estimatedHours: null,
    actualHours: null,
    assignedToRole: null,
    assignedToTeamId: null,
    changeRequestId: null,
    assignedTo: task.assignedTo ? {
      id: task.assignedTo.id,
      name: task.assignedTo.name,
      image: null, // Map email to image if needed, or set to null
    } : null,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    dependencies: [],
    attachments: [],
  }));

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setUpdating(taskId);
    const result = await updateTaskStatus(taskId, newStatus as any);

    if (result.success) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      router.refresh();
    }
    setUpdating(null);
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedTasks.length === 0) return;
    setBulkActionLoading(true);
    const result = await bulkUpdateTaskStatus(selectedTasks, status as any);
    if (result.success) {
      setSelectedTasks([]);
      router.refresh();
    }
    setBulkActionLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    if (!confirm(`Delete ${selectedTasks.length} task(s)?`)) return;
    setBulkActionLoading(true);
    const result = await bulkDeleteTasks(selectedTasks);
    if (result.success) {
      setSelectedTasks([]);
      router.refresh();
    }
    setBulkActionLoading(false);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map((t) => t.id));
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkActionLoading(true);
    
    const result = await createTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority as any,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
    });

    if (result.success) {
      setShowCreateModal(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
      router.refresh();
    }
    setBulkActionLoading(false);
  };

  const columns: Column<Task>[] = [
    {
      key: "select",
      label: "",
      render: (task) => (
        <input
          type="checkbox"
          checked={selectedTasks.includes(task.id)}
          onChange={() => toggleTaskSelection(task.id)}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-white/20 bg-[#0f172a]"
        />
      ),
    },
    {
      key: "title",
      label: "Task",
      sortable: true,
      render: (task) => (
        <div>
          <div className="font-medium text-white">{task.title}</div>
          {task.description && (
            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {task.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (task) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority] || priorityColors.MEDIUM}`}
        >
          {task.priority}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (task) => (
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(task.id, e.target.value)}
          disabled={updating === task.id}
          className={`px-2 py-1 rounded-full text-xs font-medium border bg-transparent cursor-pointer ${statusColors[task.status] || statusColors.TODO} ${updating === task.id ? "opacity-50 cursor-wait" : ""}`}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      ),
    },
    {
      key: "assignedTo",
      label: "Assignee",
      render: (task) => {
        const assignedTo = task.assignedTo?.name || task.assignedTo?.email;
        const assignedToRole = (task as any).assignedToRole;
        const assignedToTeamId = (task as any).assignedToTeamId;
        
        if (assignedTo) {
          return <div className="text-sm text-slate-300">{assignedTo}</div>;
        }
        if (assignedToRole) {
          return (
            <div className="text-sm">
              <span className="text-slate-400">Role: </span>
              <span className="text-slate-300">{assignedToRole}</span>
            </div>
          );
        }
        if (assignedToTeamId) {
          return (
            <div className="text-sm">
              <span className="text-slate-400">Team: </span>
              <span className="text-slate-300">{assignedToTeamId}</span>
            </div>
          );
        }
        return <div className="text-sm text-slate-500">Unassigned</div>;
      },
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (task) => {
        if (!task.dueDate) return <span className="text-slate-500">-</span>;
        const due = new Date(task.dueDate);
        const isOverdue = due < new Date() && task.status !== "DONE";
        return (
          <div
            className={`text-sm ${isOverdue ? "text-[#ef4444] font-medium" : "text-slate-300"}`}
          >
            {due.toLocaleDateString()}
          </div>
        );
      },
    },
  ];

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: CheckSquare,
      iconColor: "text-[#22d3ee]",
      iconBg: "bg-[#22d3ee]/20",
    },
    {
      label: "To Do",
      value: stats.todo,
      icon: Clock,
      iconColor: "text-slate-400",
      iconBg: "bg-slate-500/20",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      iconColor: "text-[#3b82f6]",
      iconBg: "bg-[#3b82f6]/20",
    },
    {
      label: "Completed",
      value: stats.done,
      icon: CheckSquare,
      iconColor: "text-[#10b981]",
      iconBg: "bg-[#10b981]/20",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertCircle,
      iconColor: "text-[#ef4444]",
      iconBg: "bg-[#ef4444]/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl group"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{stat.label}</p>
                <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-3xl font-heading font-bold text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filter Buttons and View Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1e293b]/40 p-1">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "kanban" ? "bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40" : "text-slate-400 hover:text-white"}`}
            >
              <LayoutGrid className="w-4 h-4 inline mr-1.5" />
              Kanban
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "table" ? "bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40" : "text-slate-400 hover:text-white"}`}
            >
              <List className="w-4 h-4 inline mr-1.5" />
              Table
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
          {selectedTasks.length > 0 ? (
            <>
              <span className="px-3 py-2 rounded-xl bg-[#3b82f6]/20 text-[#3b82f6] text-sm font-medium border border-[#3b82f6]/30">
                {selectedTasks.length} selected
              </span>
              <button
                onClick={() => handleBulkStatusUpdate("DONE")}
                disabled={bulkActionLoading}
                className="px-3 py-2 rounded-xl bg-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/30 text-sm font-medium transition-all disabled:opacity-50 border border-[#10b981]/30"
              >
                <CheckSquare className="w-4 h-4 inline mr-1" />
                Mark Done
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("IN_PROGRESS")}
                disabled={bulkActionLoading}
                className="px-3 py-2 rounded-xl bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30 text-sm font-medium transition-all disabled:opacity-50 border border-[#3b82f6]/30"
              >
                In Progress
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="px-3 py-2 rounded-xl bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30 text-sm font-medium transition-all disabled:opacity-50 border border-[#ef4444]/30"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Delete
              </button>
            </>
          ) : (
            <>
              {[
                { key: "all", label: `All (${tasks.length})` },
                { key: "TODO", label: `To Do (${stats.todo})` },
                { key: "IN_PROGRESS", label: `In Progress (${stats.inProgress})` },
                { key: "DONE", label: `Done (${stats.done})` },
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filter === filterOption.key ? "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/40" : "text-slate-400 border-white/10 hover:text-white hover:border-white/20 hover:bg-white/5"}`}
                >
                  {filterOption.label}
                </button>
              ))}
            </>
          )}
          </div>
        </div>

        <button 
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ef4444] text-white hover:bg-[#dc2626] text-sm font-semibold transition-all shadow-lg shadow-[#ef4444]/25 hover:shadow-xl hover:shadow-[#ef4444]/30 hover:-translate-y-0.5"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#0a1128]/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-heading font-bold text-white mb-6">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/30 focus:border-[#22d3ee]/50 transition-all"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/30 focus:border-[#22d3ee]/50 transition-all"
                  rows={3}
                  placeholder="Task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/30 focus:border-[#22d3ee]/50 transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/30 focus:border-[#22d3ee]/50 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkActionLoading}
                  className="flex-1 px-4 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] rounded-xl text-white font-semibold transition-all disabled:opacity-50 shadow-lg shadow-[#ef4444]/25"
                >
                  {bulkActionLoading ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Tasks View */}
      {view === "kanban" ? (
        <div className="rounded-2xl border border-white/10 bg-[#1e293b]/40 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20">
          <TasksKanbanBoard 
            initialTasks={kanbanTasks}
            onTaskUpdate={(taskId, updates) => {
              setTasks((prev) =>
                prev.map((t) => {
                  if (t.id === taskId) {
                    // Only update fields that exist in Task type
                    const taskUpdates: Partial<Task> = {};
                    if ('status' in updates && updates.status !== undefined) {
                      taskUpdates.status = updates.status;
                    }
                    // Convert dueDate from string to Date if present
                    if ('dueDate' in updates && updates.dueDate !== undefined) {
                      taskUpdates.dueDate = updates.dueDate 
                        ? (typeof updates.dueDate === 'string' ? new Date(updates.dueDate) : updates.dueDate)
                        : null;
                    }
                    return { ...t, ...taskUpdates };
                  }
                  return t;
                })
              );
              router.refresh();
            }}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#1e293b]/40 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20">
          <DataTable
            data={filteredTasks}
            columns={columns}
            searchPlaceholder="Search tasks..."
            onRowClick={(task) => router.push(`/admin/tasks/${task.id}`)}
          />
        </div>
      )}
    </div>
  );
}
