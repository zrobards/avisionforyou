"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  X,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: Date | null;
  completedAt: Date | null;
  requiresUpload: boolean;
  type: string;
  createdAt: Date;
  project?: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface AdminTaskManagerProps {
  projectId: string;
  initialTasks?: Task[];
}

export function AdminTaskManager({ projectId, initialTasks = [] }: AdminTaskManagerProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(!initialTasks.length);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "general",
    dueDate: "",
    requiresUpload: false,
  });

  useEffect(() => {
    if (!initialTasks.length) {
      fetchTasks();
    }
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tasks/client?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Title and description are required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/tasks/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          dueDate: formData.dueDate || null,
          requiresUpload: formData.requiresUpload,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks([data.task, ...tasks]);
        setShowCreateModal(false);
        resetForm();
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/tasks/client", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: editingTask.id,
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate || null,
          requiresUpload: formData.requiresUpload,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(tasks.map((t) => (t.id === editingTask.id ? data.task : t)));
        setEditingTask(null);
        resetForm();
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/admin/tasks/client?taskId=${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId));
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task");
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";

    try {
      const response = await fetch("/api/admin/tasks/client", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          status: newStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(tasks.map((t) => (t.id === task.id ? data.task : t)));
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to toggle task status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "general",
      dueDate: "",
      requiresUpload: false,
    });
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      type: task.type || "general",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      requiresUpload: task.requiresUpload,
    });
  };

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const filteredTasks =
    filter === "all" ? tasks : filter === "pending" ? pendingTasks : completedTasks;

  if (loading) {
    return (
      <div className="glass p-8 rounded-lg text-center text-slate-400">
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters and create button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-white">Client Tasks</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === "pending"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Pending ({pendingTasks.length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === "completed"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Completed ({completedTasks.length})
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="glass p-8 rounded-lg text-center text-slate-400">
          {filter === "all"
            ? "No tasks yet. Create one to get started."
            : `No ${filter} tasks.`}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isOverdue =
              task.dueDate &&
              task.status !== "completed" &&
              new Date(task.dueDate) < new Date();
            const isCompleted = task.status === "completed";

            return (
              <div
                key={task.id}
                className={`glass p-4 rounded-lg border transition-all ${
                  isOverdue
                    ? "border-red-500/50 bg-red-500/5"
                    : isCompleted
                    ? "border-slate-700 opacity-75"
                    : "border-white/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-emerald-500/20 border-emerald-500/50"
                        : isOverdue
                        ? "bg-red-500/20 border-red-500/50 hover:bg-red-500/30"
                        : "bg-white/5 border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isOverdue && !isCompleted && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4
                        className={`font-semibold text-white ${
                          isCompleted ? "line-through opacity-60" : ""
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.requiresUpload && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                          Upload Required
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full border ${
                          isCompleted
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : task.status === "in_progress"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">
                        {task.type}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-sm text-slate-400 mb-2">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {task.dueDate && (
                        <div
                          className={`flex items-center gap-1.5 ${
                            isOverdue ? "text-red-400" : ""
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {task.completedAt && (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            Completed {new Date(task.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Edit task"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTask) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTask(null);
                  resetForm();
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the task..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="general">General</option>
                    <option value="content">Content</option>
                    <option value="review">Review</option>
                    <option value="feedback">Feedback</option>
                    <option value="approval">Approval</option>
                    <option value="asset">Asset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresUpload"
                  checked={formData.requiresUpload}
                  onChange={(e) =>
                    setFormData({ ...formData, requiresUpload: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-slate-800 border-white/20"
                />
                <label htmlFor="requiresUpload" className="text-sm text-slate-300">
                  Requires file upload from client
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTask ? handleUpdateTask : handleCreateTask}
                  disabled={saving || !formData.title.trim() || !formData.description.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {saving ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
