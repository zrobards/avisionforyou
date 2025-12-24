"use client";

import { useState } from "react";
import { X, Trash2, Calendar, Clock, MapPin, Link2, Users, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: Date | string;
  endTime: Date | string;
  allDay: boolean;
  status: string;
  color: string | null;
  meetingUrl: string | null;
  attendees: string[];
  organization: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
}

interface EventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

export function EventDetailModal({
  event,
  onClose,
  onUpdated,
  onDeleted,
}: EventDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/calendar/events/${event.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onDeleted();
      } else {
        alert("Failed to delete event");
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    } finally {
      setIsDeleting(false);
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
          className="relative w-full max-w-md rounded-2xl border-2 border-gray-700 bg-[#0a0e1a] shadow-2xl overflow-hidden"
        >
          {/* Header with color bar */}
          <div
            className="h-2"
            style={{ backgroundColor: event.color || "#dc2626" }}
          />

          <div className="px-6 py-4 border-b border-gray-800 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{event.title}</h2>
              {event.status !== "SCHEDULED" && (
                <span className="text-xs text-gray-500 uppercase">
                  {event.status}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Date & Time */}
            <div className="flex items-center gap-3 text-gray-300">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">
                  {format(startTime, "EEEE, MMMM d, yyyy")}
                </p>
                {!event.allDay && (
                  <p className="text-sm text-gray-500">
                    {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                  </p>
                )}
                {event.allDay && (
                  <p className="text-sm text-gray-500">All day</p>
                )}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="text-gray-300">
                <p className="text-sm">{event.description}</p>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>{event.location}</span>
              </div>
            )}

            {/* Meeting URL */}
            {event.meetingUrl && (
              <div className="flex items-center gap-3">
                <Link2 className="w-5 h-5 text-gray-500" />
                <a
                  href={event.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-trinity-red hover:text-trinity-maroon flex items-center gap-1"
                >
                  Join Meeting
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Attendees */}
            {event.attendees.length > 0 && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="flex flex-wrap gap-2">
                  {event.attendees.map((attendee) => (
                    <span
                      key={attendee}
                      className="px-2 py-1 rounded bg-gray-800 text-xs text-gray-300"
                    >
                      {attendee}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Organization / Project */}
            {(event.organization || event.project) && (
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                {event.organization && (
                  <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                    {event.organization.name}
                  </span>
                )}
                {event.project && (
                  <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                    {event.project.name}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border-2 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default EventDetailModal;








