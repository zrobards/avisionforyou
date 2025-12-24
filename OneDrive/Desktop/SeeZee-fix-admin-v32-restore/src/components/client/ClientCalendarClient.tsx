"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Video,
  CreditCard,
  CalendarDays,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfDay } from "date-fns";
import Link from "next/link";

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: string;
  meetingUrl: string | null;
  project: { id: string; name: string } | null;
  organization: { id: string; name: string } | null;
  color: string | null;
  type: 'meeting' | 'billing';
};

interface ClientCalendarClientProps {
  events: CalendarEvent[];
  projects: { id: string; name: string }[];
  currentUser: {
    id: string;
    name: string | null;
    email: string;
  };
}

const eventTypeIcons: Record<string, any> = {
  meeting: Video,
  billing: CreditCard,
};

const eventTypeColors: Record<string, string> = {
  meeting: "bg-green-500/20 text-green-400 border-green-500/30",
  billing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function ClientCalendarClient({
  events,
  projects,
  currentUser,
}: ClientCalendarClientProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [eventFilter, setEventFilter] = useState<"all" | "meeting" | "billing">("all");

  // Filter events
  const filteredEvents = useMemo(() => {
    if (eventFilter === "all") return events;
    return events.filter((e) => e.type === eventFilter);
  }, [events, eventFilter]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach((event) => {
      const dateKey = format(new Date(event.startTime), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return days;
  }, [currentMonth]);

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    return eventsByDate[dateKey] || [];
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
              <CalendarDays className="w-8 h-8 text-purple-400" />
            </div>
            Calendar
          </h1>
          <p className="text-gray-400">
            View your meetings and billing dates
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEventFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              eventFilter === "all"
                ? "bg-purple-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setEventFilter("meeting")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              eventFilter === "meeting"
                ? "bg-green-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Meetings ({events.filter(e => e.type === 'meeting').length})
          </button>
          <button
            onClick={() => setEventFilter("billing")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              eventFilter === "billing"
                ? "bg-purple-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Billing ({events.filter(e => e.type === 'billing').length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-gray-900/40 border border-white/10 rounded-xl p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <h2 className="text-xl font-semibold text-white">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-400 py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    aspect-square p-2 rounded-lg transition-colors text-left
                    ${isCurrentDay ? "bg-red-500/20 border-2 border-red-500" : ""}
                    ${isSelected ? "bg-purple-500/30 border-2 border-purple-500" : "bg-gray-800/50 border border-white/5"}
                    ${!isSameMonth(day, currentMonth) ? "opacity-30" : ""}
                    hover:bg-white/10
                  `}
                >
                  <div className="text-sm font-medium text-white mb-1">
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => {
                      const Icon = eventTypeIcons[event.type] || Calendar;
                      return (
                        <div
                          key={event.id}
                          className={`
                            text-xs px-1.5 py-0.5 rounded truncate
                            ${eventTypeColors[event.type] || "bg-gray-500/20 text-gray-400"}
                          `}
                          title={event.title}
                        >
                          <Icon className="w-3 h-3 inline mr-1" />
                          {event.title.length > 15
                            ? event.title.substring(0, 15) + "..."
                            : event.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-400">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Event List */}
        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {selectedDay
              ? `Events on ${format(selectedDay, "MMM d, yyyy")}`
              : "Upcoming Events"}
          </h3>

          {selectedDay ? (
            selectedDayEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDayEvents.map((event) => {
                  const Icon = eventTypeIcons[event.type] || Calendar;
                  return (
                    <div
                      key={event.id}
                      className={`
                        p-4 rounded-lg border
                        ${eventTypeColors[event.type] || "bg-gray-800/50 border-white/5"}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white mb-1">
                            {event.title}
                          </h4>
                          {event.description && (
                            <p className="text-sm text-gray-400 mb-2">
                              {event.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{formatTime(event.startTime)}</span>
                            {event.project && (
                              <span className="truncate">
                                {event.project.name}
                              </span>
                            )}
                          </div>
                          {event.meetingUrl && (
                            <a
                              href={event.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300"
                            >
                              <Video className="w-4 h-4" />
                              Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No events on this day
              </div>
            )
          ) : (
            <div className="space-y-3">
              {filteredEvents
                .filter((e) => new Date(e.startTime) >= startOfDay(new Date()))
                .slice(0, 10)
                .map((event) => {
                  const Icon = eventTypeIcons[event.type] || Calendar;
                  return (
                    <div
                      key={event.id}
                      className={`
                        p-4 rounded-lg border
                        ${eventTypeColors[event.type] || "bg-gray-800/50 border-white/5"}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white mb-1">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{formatDate(event.startTime)}</span>
                            <span>{formatTime(event.startTime)}</span>
                          </div>
                          {event.project && (
                            <div className="text-xs text-gray-500 mt-1">
                              {event.project.name}
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
      </div>

      {/* Quick Links */}
      <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/client/meetings"
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            Request Meeting
          </Link>
          <Link
            href="/client/subscriptions"
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            View Subscriptions
          </Link>
        </div>
      </div>
    </div>
  );
}




