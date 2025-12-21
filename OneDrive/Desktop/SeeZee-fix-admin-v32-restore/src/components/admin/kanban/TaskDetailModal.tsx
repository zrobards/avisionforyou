"use client";

import { useState } from "react";
import { X, Trash2, Clock, Play, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  column: string;
  position: number;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  assignedTo: { id: string; name: string | null; image: string | null } | null;
  dependencies: string[];
  attachments: string[];
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
}

interface TaskDetailModalProps {
  task: Task;
  projectId: string;
  teamMembers: TeamMember[];
  onClose: () => void;
  onUpdated: (task: Task) => void;
  onDeleted: (taskId: string) => void;
}

export function TaskDetailModal({
  task,
  projectId,
  teamMembers,
  onClose,
  onUpdated,
  onDeleted,
}: TaskDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStart, setTrackingStart] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    assignedToId: task.assignedTo?.id || "",
    dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    estimatedHours: task.estimatedHours?.toString() || "",
    actualHours: task.actualHours?.toString() || "",
  });

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority,
          assignedToId: formData.assignedToId || null,
          dueDate: formData.dueDate || null,
          estimatedHours: formData.estimatedHours
            ? parseFloat(formData.estimatedHours)
            : null,
          actualHours: formData.actualHours
            ? parseFloat(formData.actualHours)
            : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onUpdated(data.task);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onDeleted(task.id);
      } else {
        alert("Failed to delete task");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const startTimeTracking = () => {
    setIsTracking(true);
    setTrackingStart(new Date());
    setElapsedSeconds(0);

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Store interval ID for cleanup
    (window as any).__trackingInterval = interval;
  };

  const stopTimeTracking = async () => {
    setIsTracking(false);
    if ((window as any).__trackingInterval) {
      clearInterval((window as any).__trackingInterval);
    }

    const hours = elapsedSeconds / 3600;
    
    try {
      await fetch(`/api/projects/${projectId}/tasks/${task.id}/log-time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hours,
          startedAt: trackingStart,
          endedAt: new Date(),
        }),
      });

      // Update local state
      const newActualHours = (task.actualHours || 0) + hours;
      setFormData((prev) => ({
        ...prev,
        actualHours: newActualHours.toFixed(2),
      }));
    } catch (error) {
      console.error("Failed to log time:", error);
    }

    setElapsedSeconds(0);
    setTrackingStart(null);
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-gray-700 bg-[#0a0e1a] shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-[#0a0e1a] px-6 py-4">
            <h2 className="text-xl font-heading font-bold text-white">
              Task Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-3 text-lg font-semibold text-white focus:border-trinity-red focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add task description..."
                className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-3 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none resize-none"
              />
            </div>

            {/* Time Tracking */}
            <div className="p-4 rounded-xl border-2 border-gray-700 bg-[#151b2e]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Time Tracking
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.actualHours || 0}h logged / {formData.estimatedHours || 0}h estimated
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isTracking && (
                    <span className="text-xl font-mono text-cyan-400">
                      {formatTime(elapsedSeconds)}
                    </span>
                  )}
                  {isTracking ? (
                    <button
                      onClick={stopTimeTracking}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-2"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </button>
                  ) : (
                    <button
                      onClick={startTimeTracking}
                      className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white focus:border-trinity-red focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Assigned To
                </label>
                <select
                  value={formData.assignedToId}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedToId: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white focus:border-trinity-red focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name || member.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white focus:border-trinity-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.estimatedHours}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedHours: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white focus:border-trinity-red focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Task
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border-2 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting || !formData.title}
                  className="px-6 py-2 rounded-lg bg-trinity-red text-white font-medium hover:bg-trinity-maroon disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default TaskDetailModal;


