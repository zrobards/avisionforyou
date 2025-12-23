"use client";

/**
 * Global SeeZee Calendar Client
 * Interactive calendar view for all tasks and events
 */

import { useState, useMemo } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  Briefcase,
  Filter,
  Users,
  Video,
  Check,
  CalendarClock,
  X,
} from "lucide-react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
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

type MaintenanceSchedule = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  scheduledFor: Date;
  project: {
    id: string;
    name: string;
    description: string | null;
  };
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  organization: {
    id: string;
    name: string | null;
  };
  milestones: {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    completed: boolean;
  }[];
};

type CalendarEventData = {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  status: string;
  meetingUrl: string | null;
  project: {
    id: string;
    name: string;
  } | null;
  organization: {
    id: string;
    name: string;
  } | null;
};

interface CalendarClientProps {
  tasks: Task[];
  maintenanceSchedules: MaintenanceSchedule[];
  projects: Project[];
  calendarEvents?: CalendarEventData[];
  currentUser: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  viewMode: "organization" | "personal";
}

type CalendarEvent = {
  id: string;
  type: "task" | "maintenance" | "milestone" | "meeting";
  title: string;
  description: string | null;
  date: Date;
  priority?: string;
  status: string;
  assignee?: string | null;
  projectName?: string;
  meetingUrl?: string | null;
  originalEvent?: CalendarEventData; // Store original event data for meetings
};

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-500/20 text-slate-400 border-slate-500/40",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  HIGH: "bg-red-500/20 text-red-400 border-red-500/40",
};

const eventTypeIcons: Record<string, any> = {
  task: Clock,
  maintenance: Wrench,
  milestone: Briefcase,
  meeting: Video,
};

const eventTypeColors: Record<string, string> = {
  task: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  maintenance: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  milestone: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  meeting: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function CalendarClient({
  tasks,
  maintenanceSchedules,
  projects,
  calendarEvents = [],
  currentUser,
  viewMode,
}: CalendarClientProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [eventFilter, setEventFilter] = useState<"all" | "task" | "maintenance" | "milestone" | "meeting">("all");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<CalendarEventData | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    newStartTime: '',
    newEndTime: '',
    reason: '',
  });
  const [processing, setProcessing] = useState(false);

  // Handle approve meeting
  const handleApproveMeeting = async (meetingId: string) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/meetings/${meetingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to approve meeting');
      }

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error: any) {
      alert(error.message || 'Failed to approve meeting');
    } finally {
      setProcessing(false);
    }
  };

  // Handle reschedule meeting
  const handleRescheduleMeeting = async () => {
    if (!selectedMeeting) return;

    if (!rescheduleForm.newStartTime || !rescheduleForm.newEndTime) {
      alert('Please provide both start and end times');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/meetings/${selectedMeeting.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStartTime: rescheduleForm.newStartTime,
          newEndTime: rescheduleForm.newEndTime,
          reason: rescheduleForm.reason,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to reschedule meeting');
      }

      setShowRescheduleModal(false);
      setSelectedMeeting(null);
      setRescheduleForm({ newStartTime: '', newEndTime: '', reason: '' });
      
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error: any) {
      alert(error.message || 'Failed to reschedule meeting');
    } finally {
      setProcessing(false);
    }
  };

  // Open reschedule modal
  const openRescheduleModal = (event: CalendarEvent) => {
    if (event.originalEvent) {
      setSelectedMeeting(event.originalEvent);
      setRescheduleForm({
        newStartTime: new Date(event.originalEvent.startTime).toISOString().slice(0, 16),
        newEndTime: new Date(event.originalEvent.endTime).toISOString().slice(0, 16),
        reason: '',
      });
      setShowRescheduleModal(true);
    }
  };

  // Convert all data into calendar events
  const allEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];

    // Add tasks
    tasks.forEach((task) => {
      if (task.dueDate) {
        events.push({
          id: task.id,
          type: "task",
          title: task.title,
          description: task.description,
          date: new Date(task.dueDate),
          priority: task.priority,
          status: task.status,
          assignee: task.assignedTo?.name || task.assignedTo?.email,
        });
      }
    });

    // Add maintenance schedules
    maintenanceSchedules.forEach((maintenance) => {
      events.push({
        id: maintenance.id,
        type: "maintenance",
        title: maintenance.title,
        description: maintenance.description,
        date: new Date(maintenance.scheduledFor),
        status: maintenance.status,
        projectName: maintenance.project.name,
      });
    });

    // Add project milestones
    projects.forEach((project) => {
      project.milestones.forEach((milestone) => {
        if (milestone.dueDate) {
          events.push({
            id: milestone.id,
            type: "milestone",
            title: milestone.title,
            description: milestone.description,
            date: new Date(milestone.dueDate),
            status: milestone.completed ? "DONE" : "TODO",
            projectName: project.name,
          });
        }
      });
    });

    // Add calendar events (meetings)
    calendarEvents.forEach((event) => {
      events.push({
        id: event.id,
        type: "meeting",
        title: event.title,
        description: event.description,
        date: new Date(event.startTime),
        status: event.status,
        projectName: event.project?.name || event.organization?.name || undefined,
        meetingUrl: event.meetingUrl || undefined,
        originalEvent: event, // Store original event for actions
      });
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [tasks, maintenanceSchedules, projects, calendarEvents]);

  // Filter events
  const filteredEvents = eventFilter === "all"
    ? allEvents
    : allEvents.filter((e) => e.type === eventFilter);

  // Get events for current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for selected day
  const selectedDayEvents = selectedDay
    ? filteredEvents.filter((e) => isSameDay(e.date, selectedDay))
    : [];

  // Get event count for each day
  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((e) => isSameDay(e.date, day));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-seezee-red glow-on-hover inline-block mb-2">
            Schedule
          </span>
          <h1 className="text-3xl font-heading font-bold gradient-text flex items-center gap-3">
            <Calendar className="w-8 h-8 text-seezee-blue" />
            SeeZee Calendar
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {viewMode === "organization" ? "Organization-wide schedule" : "Your personal schedule"}
          </p>
        </div>

        {/* Event Type Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setEventFilter("all")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              eventFilter === "all"
                ? "bg-seezee-red/20 text-seezee-red border border-seezee-red/30"
                : "text-slate-400 hover:text-white hover:bg-seezee-card-bg"
            }`}
          >
            <span className="hidden sm:inline">All </span>({allEvents.length})
          </button>
          <button
            onClick={() => setEventFilter("task")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 ${
              eventFilter === "task"
                ? "bg-seezee-blue/20 text-seezee-blue border border-seezee-blue/30"
                : "text-slate-400 hover:text-white hover:bg-seezee-card-bg"
            }`}
          >
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Tasks </span>({allEvents.filter((e) => e.type === "task").length})
          </button>
          <button
            onClick={() => setEventFilter("maintenance")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 ${
              eventFilter === "maintenance"
                ? "bg-seezee-orange/20 text-seezee-orange border border-seezee-orange/30"
                : "text-slate-400 hover:text-white hover:bg-seezee-card-bg"
            }`}
          >
            <Wrench className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Maint. </span>({allEvents.filter((e) => e.type === "maintenance").length})
          </button>
          <button
            onClick={() => setEventFilter("milestone")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 ${
              eventFilter === "milestone"
                ? "bg-seezee-purple/20 text-seezee-purple border border-seezee-purple/30"
                : "text-slate-400 hover:text-white hover:bg-seezee-card-bg"
            }`}
          >
            <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Miles. </span>({allEvents.filter((e) => e.type === "milestone").length})
          </button>
          <button
            onClick={() => setEventFilter("meeting")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 ${
              eventFilter === "meeting"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "text-slate-400 hover:text-white hover:bg-seezee-card-bg"
            }`}
          >
            <Video className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Meetings </span>({allEvents.filter((e) => e.type === "meeting").length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <SectionCard>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl font-bold text-white">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white text-xs sm:text-sm font-medium transition-all"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition-all"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Day Headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-slate-400 py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={`
                      min-h-[100px] p-2 rounded-xl border transition-all
                      ${isSelected
                        ? "bg-seezee-red/20 border-seezee-red/50 shadow-lg shadow-seezee-red/20"
                        : isCurrentDay
                        ? "bg-seezee-blue/10 border-seezee-blue/30"
                        : "bg-seezee-card-bg border-white/5 hover:border-white/10 hover:bg-white/5"
                      }
                      ${!isSameMonth(day, currentMonth) ? "opacity-40" : ""}
                    `}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isCurrentDay ? "text-seezee-blue" : "text-white"
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => {
                        const Icon = eventTypeIcons[event.type];
                        return (
                          <div
                            key={event.id}
                            className={`text-xs px-1.5 py-0.5 rounded border ${eventTypeColors[event.type]} truncate flex items-center gap-1`}
                          >
                            <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{event.title}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-slate-400 font-medium">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Event Details Sidebar */}
        <div>
          <SectionCard
            title={selectedDay ? format(selectedDay, "MMMM d, yyyy") : "Select a day"}
            description={selectedDay ? `${selectedDayEvents.length} event(s)` : "Click a day to view events"}
          >
            <div className="space-y-3">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event) => {
                  const Icon = eventTypeIcons[event.type];
                  const isOverdue = event.status !== "DONE" && event.date < new Date();

                  return (
                    <div
                      key={event.id}
                      className={`p-4 rounded-xl border ${
                        isOverdue
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-slate-900/40 border-white/5"
                      } hover:border-white/10 transition-all`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg ${eventTypeColors[event.type]} flex items-center justify-center flex-shrink-0 border`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">
                            {event.title}
                          </h4>
                          {event.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                              {event.description}
                            </p>
                          )}
                          <div className="flex items-center flex-wrap gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${eventTypeColors[event.type]} capitalize`}>
                              {event.type}
                            </span>
                            {event.priority && (
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[event.priority]}`}>
                                {event.priority}
                              </span>
                            )}
                            {isOverdue && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                Overdue
                              </span>
                            )}
                          </div>
                          {(event.assignee || event.projectName) && (
                            <div className="mt-2 text-xs text-slate-400 flex items-center gap-3">
                              {event.assignee && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {event.assignee}
                                </span>
                              )}
                              {event.projectName && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" />
                                  {event.projectName}
                                </span>
                              )}
                            </div>
                          )}
                          {event.meetingUrl && (
                            <div className="mt-2">
                              <a
                                href={event.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors inline-flex items-center gap-1"
                              >
                                <Video className="w-3 h-3" />
                                Join Meeting
                              </a>
                            </div>
                          )}
                          {/* Admin actions for pending meetings */}
                          {event.type === "meeting" && event.status === "PENDING" && event.originalEvent && (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => handleApproveMeeting(event.id)}
                                disabled={processing}
                                className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => openRescheduleModal(event)}
                                disabled={processing}
                                className="text-xs px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                              >
                                <CalendarClock className="w-3 h-3" />
                                Reschedule
                              </button>
                            </div>
                          )}
                          {/* Status badge for rescheduled meetings */}
                          {event.type === "meeting" && event.status === "RESCHEDULED" && (
                            <div className="mt-2">
                              <span className="text-xs px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg inline-flex items-center gap-1">
                                <CalendarClock className="w-3 h-3" />
                                Awaiting Client Confirmation
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm">
                    {selectedDay ? "No events on this day" : "Select a day to view events"}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Upcoming Events List */}
      <SectionCard
        title="Upcoming Events"
        description="Next 30 days"
      >
        <div className="space-y-2">
          {filteredEvents
            .filter((e) => e.date >= new Date() && e.date <= addMonths(new Date(), 1))
            .slice(0, 10)
            .map((event) => {
              const Icon = eventTypeIcons[event.type];
              const isOverdue = event.status !== "DONE" && event.date < new Date();

              return (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg ${eventTypeColors[event.type]} flex items-center justify-center flex-shrink-0 border`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white mb-0.5 line-clamp-1">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{format(event.date, "MMM d, yyyy")}</span>
                      {event.assignee && <span>• {event.assignee}</span>}
                      {event.projectName && <span>• {event.projectName}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full border ${eventTypeColors[event.type]} capitalize`}>
                      {event.type}
                    </span>
                    {event.priority && (
                      <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[event.priority]}`}>
                        {event.priority}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </SectionCard>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Reschedule Meeting</h2>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedMeeting(null);
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Start Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={rescheduleForm.newStartTime}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, newStartTime: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-seezee-blue/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New End Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={rescheduleForm.newEndTime}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, newEndTime: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-seezee-blue/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reason for Rescheduling (optional)
                </label>
                <textarea
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                  placeholder="Explain why the meeting needs to be rescheduled..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-seezee-blue/50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleRescheduleMeeting}
                  disabled={processing || !rescheduleForm.newStartTime || !rescheduleForm.newEndTime}
                  className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Rescheduling...
                    </>
                  ) : (
                    <>
                      <CalendarClock className="w-5 h-5" />
                      Reschedule Meeting
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setSelectedMeeting(null);
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
