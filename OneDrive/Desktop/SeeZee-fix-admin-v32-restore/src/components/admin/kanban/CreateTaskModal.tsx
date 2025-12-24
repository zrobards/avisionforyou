"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamMember {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
}

interface CreateTaskModalProps {
  projectId: string;
  column: string;
  teamMembers: TeamMember[];
  onClose: () => void;
  onCreated: (task: any) => void;
}

export function CreateTaskModal({
  projectId,
  column,
  teamMembers,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assignedToId: "",
    dueDate: "",
    estimatedHours: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          column,
          estimatedHours: formData.estimatedHours
            ? parseFloat(formData.estimatedHours)
            : null,
          dueDate: formData.dueDate || null,
          assignedToId: formData.assignedToId || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onCreated(data.task);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
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
          className="relative w-full max-w-lg rounded-2xl border-2 border-gray-700 bg-[#0a0e1a] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
            <h2 className="text-xl font-heading font-bold text-white">
              Create Task
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Design homepage mockup"
                className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Task details..."
                className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none resize-none"
              />
            </div>

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
                  Assign To
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="e.g., 4"
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border-2 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title}
                className="px-6 py-2 rounded-lg bg-trinity-red text-white font-medium hover:bg-trinity-maroon disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CreateTaskModal;








