"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle2, Clock, Calendar, AlertCircle, Upload, X, Edit, Trash2, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminProjectTasksProps {
  projectId: string;
  clientTasks: Array<any>;
  adminTasks: Array<any>;
}

export function AdminProjectTasks({ projectId, clientTasks, adminTasks }: AdminProjectTasksProps) {
  const [taskFilter, setTaskFilter] = useState<"all" | "client" | "admin">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tasks, setTasks] = useState({ client: clientTasks, admin: adminTasks });
  const [loading, setLoading] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    requiresUpload: false,
  });

  useEffect(() => {
    setTasks({ client: clientTasks, admin: adminTasks });
  }, [clientTasks, adminTasks]);

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description) {
      alert("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/tasks/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: newTask.title,
          description: newTask.description,
          type: "general",
          dueDate: newTask.dueDate || null,
          requiresUpload: newTask.requiresUpload,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create task");
      }

      const data = await response.json();
      setTasks((prev) => ({
        ...prev,
        client: [data.task, ...prev.client],
      }));
      setShowCreateForm(false);
      setNewTask({ title: "", description: "", dueDate: "", requiresUpload: false });
      window.location.reload();
    } catch (error: any) {
      alert(error.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string, isClientTask: boolean) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const endpoint = isClientTask ? `/api/admin/tasks/client?taskId=${taskId}` : `/api/admin/tasks?taskId=${taskId}`;
      const response = await fetch(endpoint, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      if (isClientTask) {
        setTasks((prev) => ({
          ...prev,
          client: prev.client.filter((t) => t.id !== taskId),
        }));
      } else {
        setTasks((prev) => ({
          ...prev,
          admin: prev.admin.filter((t) => t.id !== taskId),
        }));
      }
    } catch (error) {
      alert("Failed to delete task");
    }
  };

  const filteredTasks =
    taskFilter === "all"
      ? [...tasks.client, ...tasks.admin]
      : taskFilter === "client"
      ? tasks.client
      : tasks.admin;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Tasks</h3>
          <span className="text-sm text-white/60">
            {tasks.client.length} client tasks, {tasks.admin.length} admin tasks
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Client Task
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setTaskFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                taskFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-white/60 hover:bg-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTaskFilter("client")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                taskFilter === "client"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-white/60 hover:bg-gray-700"
              }`}
            >
              Client ({tasks.client.length})
            </button>
            <button
              onClick={() => setTaskFilter("admin")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                taskFilter === "admin"
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-800 text-white/60 hover:bg-gray-700"
              }`}
            >
              Admin ({tasks.admin.length})
            </button>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">Create Client Task</h4>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center gap-2 text-white/60">
              <input
                type="checkbox"
                checked={newTask.requiresUpload}
                onChange={(e) => setNewTask({ ...newTask, requiresUpload: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Requires file upload</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTask}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {loading ? "Creating..." : "Create Task"}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <ListTodo className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No {taskFilter === "all" ? "" : taskFilter} tasks</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isClientTask = tasks.client.some((t) => t.id === task.id);
            const isOverdue = task.dueDate && task.status !== "completed" && new Date(task.dueDate) < new Date();
            const isCompleted = task.status === "completed";

            return (
              <div
                key={task.id}
                className={`p-4 bg-gray-900 hover:bg-gray-800 rounded-xl border transition-all ${
                  isOverdue ? "border-red-500/50 bg-red-500/5" : "border-gray-800"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isCompleted
                        ? "bg-emerald-500/20 border-emerald-500/50"
                        : isOverdue
                        ? "bg-red-500/20 border-red-500/50"
                        : "bg-white/5 border-white/20"
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">{task.title}</h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${
                          isClientTask
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                        }`}
                      >
                        {isClientTask ? "Client" : "Admin"}
                      </span>
                      {task.requiresUpload && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          Upload Required
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
                          Completed
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-sm text-white/60 mb-2">{task.description}</p>
                    )}
                    {task.submissionNotes && (
                      <div className="mb-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-200">
                        <strong>Client notes:</strong> {task.submissionNotes}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white/40 mb-2">
                      {task.dueDate && (
                        <div className={`flex items-center gap-1.5 ${isOverdue ? "text-red-400" : ""}`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {task.completedAt && (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed {new Date(task.completedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {task.createdBy && (
                        <div className="flex items-center gap-1.5">
                          <span>Created by {task.createdBy.name || task.createdBy.email}</span>
                        </div>
                      )}
                    </div>
                    {isClientTask && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleDeleteTask(task.id, true)}
                          className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

