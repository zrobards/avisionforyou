"use client";

import { useState } from "react";
import { X, Calendar, Clock, MapPin, Link2, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Organization {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface CreateEventModalProps {
  initialDate: Date;
  organizations: Organization[];
  projects: Project[];
  currentUserId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateEventModal({
  initialDate,
  organizations,
  projects,
  currentUserId,
  onClose,
  onCreated,
}: CreateEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: format(initialDate, "yyyy-MM-dd"),
    startTime: "09:00",
    endDate: format(initialDate, "yyyy-MM-dd"),
    endTime: "10:00",
    allDay: false,
    organizationId: "",
    projectId: "",
    meetingUrl: "",
    attendees: "",
    color: "#dc2626",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const startTime = formData.allDay
        ? new Date(`${formData.startDate}T00:00:00`)
        : new Date(`${formData.startDate}T${formData.startTime}:00`);

      const endTime = formData.allDay
        ? new Date(`${formData.endDate}T23:59:59`)
        : new Date(`${formData.endDate}T${formData.endTime}:00`);

      const attendeesList = formData.attendees
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          allDay: formData.allDay,
          organizationId: formData.organizationId || null,
          projectId: formData.projectId || null,
          meetingUrl: formData.meetingUrl || null,
          attendees: attendeesList,
          color: formData.color,
          createdBy: currentUserId,
        }),
      });

      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event");
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
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-gray-700 bg-[#0a0e1a] shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-[#0a0e1a] px-6 py-4">
            <h2 className="text-xl font-heading font-bold text-white">
              New Event
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Client Kickoff Call"
                className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
              />
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.allDay}
                onChange={(e) =>
                  setFormData({ ...formData, allDay: e.target.checked })
                }
                className="rounded border-gray-700 bg-[#151b2e] text-trinity-red focus:ring-trinity-red"
              />
              <label htmlFor="allDay" className="text-sm text-gray-400">
                All-day event
              </label>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full pl-10 rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white focus:border-trinity-red focus:outline-none"
                  />
                </div>
              </div>
              {!formData.allDay && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Start Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="w-full pl-10 rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white focus:border-trinity-red focus:outline-none"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white focus:border-trinity-red focus:outline-none"
                />
              </div>
              {!formData.allDay && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white focus:border-trinity-red focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Description */}
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
                placeholder="Event details..."
                className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Zoom, office, etc."
                  className="w-full pl-10 rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
                />
              </div>
            </div>

            {/* Meeting URL */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Meeting URL
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="url"
                  value={formData.meetingUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingUrl: e.target.value })
                  }
                  placeholder="https://zoom.us/j/..."
                  className="w-full pl-10 rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
                />
              </div>
            </div>

            {/* Link to Organization/Project */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Organization
                </label>
                <select
                  value={formData.organizationId}
                  onChange={(e) =>
                    setFormData({ ...formData, organizationId: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white focus:border-trinity-red focus:outline-none"
                >
                  <option value="">None</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Project
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData({ ...formData, projectId: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white focus:border-trinity-red focus:outline-none"
                >
                  <option value="">None</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attendees */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Attendees
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={formData.attendees}
                  onChange={(e) =>
                    setFormData({ ...formData, attendees: e.target.value })
                  }
                  placeholder="email@example.com, email2@example.com"
                  className="w-full pl-10 rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Event Color
              </label>
              <div className="flex gap-2">
                {["#dc2626", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"].map(
                  (color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 transition ${
                        formData.color === color
                          ? "border-white scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
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
                {isSubmitting ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CreateEventModal;







