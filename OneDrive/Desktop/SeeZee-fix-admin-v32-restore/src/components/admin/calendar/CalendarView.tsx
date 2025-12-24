"use client";

import { useState, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views, SlotInfo } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CreateEventModal } from "./CreateEventModal";
import { EventDetailModal } from "./EventDetailModal";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { "en-US": enUS },
});

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

interface Organization {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  organizations: Organization[];
  projects: Project[];
  currentUserId: string;
}

// Color mapping for event types
const eventColors: Record<string, string> = {
  meeting: "#3b82f6",      // Blue
  deadline: "#ef4444",     // Red
  milestone: "#22c55e",    // Green
  reminder: "#f59e0b",     // Yellow
  internal: "#8b5cf6",     // Purple
  default: "#dc2626",      // Trinity Red
};

export function CalendarView({
  events,
  organizations,
  projects,
  currentUserId,
}: CalendarViewProps) {
  const [currentView, setCurrentView] = useState<any>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Transform events for react-big-calendar
  const calendarEvents = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      allDay: event.allDay,
      resource: event,
    }));
  }, [events]);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedSlot({ start: slotInfo.start, end: slotInfo.end });
    setShowCreateModal(true);
  }, []);

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event.resource);
  }, []);

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleViewChange = useCallback((view: any) => {
    setCurrentView(view);
  }, []);

  // Custom event styling
  const eventStyleGetter = useCallback((event: any) => {
    const color = event.resource?.color || eventColors.default;
    return {
      style: {
        backgroundColor: color,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
        fontSize: "12px",
        fontWeight: 500,
      },
    };
  }, []);

  // Custom day cell styling
  const dayPropGetter = useCallback((date: Date) => {
    const isToday =
      format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
    return {
      style: {
        backgroundColor: isToday ? "rgba(220, 38, 38, 0.1)" : undefined,
      },
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => {
            setSelectedSlot(null);
            setShowCreateModal(true);
          }}
          className="px-4 py-2 rounded-lg bg-trinity-red text-white hover:bg-trinity-maroon transition text-sm font-medium"
        >
          + New Event
        </button>
      </div>

      {/* Calendar */}
      <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-4 overflow-hidden">
        <style jsx global>{`
          .rbc-calendar {
            font-family: inherit;
            color: #fff;
          }
          .rbc-header {
            padding: 10px 4px;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            color: #9ca3af;
            border-bottom: 1px solid #374151;
          }
          .rbc-month-view {
            border: none;
          }
          .rbc-day-bg {
            background-color: #151b2e;
            border-color: #374151;
          }
          .rbc-off-range-bg {
            background-color: #0a0e1a;
          }
          .rbc-today {
            background-color: rgba(220, 38, 38, 0.1) !important;
          }
          .rbc-row-content {
            z-index: auto;
          }
          .rbc-event {
            padding: 2px 5px;
          }
          .rbc-event:focus {
            outline: 2px solid #dc2626;
          }
          .rbc-month-row {
            border-color: #374151;
          }
          .rbc-date-cell {
            padding: 4px 8px;
            color: #9ca3af;
            font-size: 13px;
          }
          .rbc-date-cell.rbc-now {
            color: #dc2626;
            font-weight: 600;
          }
          .rbc-toolbar {
            margin-bottom: 20px;
          }
          .rbc-toolbar button {
            color: #fff;
            background-color: #1a2235;
            border: 1px solid #374151;
            padding: 8px 16px;
            font-size: 13px;
          }
          .rbc-toolbar button:hover {
            background-color: #374151;
          }
          .rbc-toolbar button.rbc-active {
            background-color: #dc2626;
            border-color: #dc2626;
          }
          .rbc-time-view {
            border-color: #374151;
          }
          .rbc-time-header {
            border-color: #374151;
          }
          .rbc-time-content {
            border-color: #374151;
          }
          .rbc-timeslot-group {
            border-color: #374151;
          }
          .rbc-time-slot {
            color: #6b7280;
          }
          .rbc-current-time-indicator {
            background-color: #dc2626;
          }
          .rbc-agenda-view table.rbc-agenda-table {
            border-color: #374151;
          }
          .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
            border-color: #374151;
            padding: 12px;
          }
          .rbc-agenda-date-cell, .rbc-agenda-time-cell {
            color: #9ca3af;
          }
        `}</style>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          view={currentView}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
        {Object.entries(eventColors).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: color }}
            />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          initialDate={selectedSlot?.start || new Date()}
          organizations={organizations}
          projects={projects}
          currentUserId={currentUserId}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedSlot(null);
          }}
          onCreated={() => window.location.reload()}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdated={() => window.location.reload()}
          onDeleted={() => window.location.reload()}
        />
      )}
    </div>
  );
}

export default CalendarView;








