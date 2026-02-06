"use client";

import { useState } from "react";
import Link from "next/link";

interface ProgramSession {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string | null;
  format: string;
  link: string | null;
  capacity: number | null;
  _count: { rsvps: number };
}

interface DUIClass {
  id: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  price: number;
  capacity: number;
  instructor: string | null;
  _count: { registrations: number };
}

interface Props {
  sessions: ProgramSession[];
  duiClasses: DUIClass[];
  userRsvps: string[];
  userDuiRegistrations: string[];
  isLoggedIn: boolean;
  userId?: string;
}

type FilterType = "all" | "free" | "paid";

export default function UnifiedScheduler({
  sessions,
  duiClasses,
  userRsvps,
  userDuiRegistrations,
  isLoggedIn,
  userId,
}: Props) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);
  const [localRsvps, setLocalRsvps] = useState<string[]>(userRsvps);

  // Combine and sort all events
  const allEvents = [
    ...sessions.map((s) => ({ 
      ...s, 
      eventType: "session" as const, 
      price: 0,
      date: s.startDate,
      startTime: new Date(s.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      endTime: new Date(s.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    })),
    ...duiClasses.map((d) => ({ ...d, eventType: "dui" as const })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Apply filter
  const filteredEvents = allEvents.filter((event) => {
    if (filter === "free") return event.eventType === "session";
    if (filter === "paid") return event.eventType === "dui";
    return true;
  });

  const handleRsvp = async (sessionId: string) => {
    if (!isLoggedIn) {
      window.location.href = "/login?callbackUrl=/meetings";
      return;
    }

    setRsvpLoading(sessionId);

    try {
      const isRsvped = localRsvps.includes(sessionId);
      const method = isRsvped ? "DELETE" : "POST";

      const res = await fetch("/api/rsvp", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        if (isRsvped) {
          setLocalRsvps(localRsvps.filter((id) => id !== sessionId));
        } else {
          setLocalRsvps([...localRsvps, sessionId]);
        }
      }
    } catch (error) {
      console.error("RSVP error:", error);
    } finally {
      setRsvpLoading(null);
    }
  };

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-6 py-2 rounded-full font-medium transition ${
            filter === "all"
              ? "bg-brand-purple text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Meetings & Groups
        </button>
        <button
          onClick={() => setFilter("free")}
          className={`px-6 py-2 rounded-full font-medium transition ${
            filter === "free"
              ? "bg-brand-green text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Free Meetings & Groups
        </button>
        <button
          onClick={() => setFilter("paid")}
          className={`px-6 py-2 rounded-full font-medium transition ${
            filter === "paid"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          DUI Classes ($)
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-brand-green rounded-full"></span>
          Free Meetings & Groups (RSVP)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
          Paid Classes (Registration Required)
        </span>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No upcoming meetings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const isSession = event.eventType === "session";
            const isDui = event.eventType === "dui";

            // For sessions
            const isRsvped = isSession && localRsvps.includes(event.id);
            const sessionFull =
              isSession &&
              event.capacity &&
              event._count.rsvps >= event.capacity;

            // For DUI classes
            const isRegistered = isDui && userDuiRegistrations.includes(event.id);
            const duiClass = isDui ? (event as DUIClass & { eventType: "dui" }) : null;
            const duiFull =
              isDui &&
              duiClass &&
              duiClass._count.registrations >= duiClass.capacity;
            const spotsLeft = duiClass
              ? duiClass.capacity - duiClass._count.registrations
              : null;

            return (
              <div
                key={`${event.eventType}-${event.id}`}
                className={`border rounded-lg p-6 bg-white shadow-sm ${
                  isSession ? "border-l-4 border-l-brand-green" : "border-l-4 border-l-purple-500"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          isSession
                            ? "bg-green-100 text-green-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {isSession ? "Free Session" : "DUI Class"}
                      </span>
                      {isSession && (event as any).format && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          {(event as any).format === "ONLINE" ? "🌐 Online" : "📍 In-Person"}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    {event.description && (
                      <p className="text-gray-600 mt-1">{event.description}</p>
                    )}

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                      <p>
                        📅{" "}
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p>🕐 {event.startTime} - {event.endTime}</p>
                      <p>📍 {event.location || "Online"}</p>
                      {isDui && duiClass?.instructor && (
                        <p>👤 {duiClass.instructor}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-start lg:items-end gap-2">
                    {/* Price for DUI classes */}
                    {isDui && duiClass && (
                      <p className="text-2xl font-bold text-purple-600">
                        ${(duiClass.price / 100).toFixed(2)}
                      </p>
                    )}

                    {/* Spots info */}
                    {isDui && (
                      <p
                        className={`text-sm ${
                          duiFull ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {duiFull ? "Class Full" : `${spotsLeft} spots left`}
                      </p>
                    )}
                    {isSession && event.capacity && (
                      <p
                        className={`text-sm ${
                          sessionFull ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {sessionFull
                          ? "Session Full"
                          : `${event.capacity - event._count.rsvps} spots left`}
                      </p>
                    )}

                    {/* Action Button */}
                    {isSession && (
                      <>
                        {isRsvped ? (
                          <button
                            onClick={() => handleRsvp(event.id)}
                            disabled={rsvpLoading === event.id}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                          >
                            {rsvpLoading === event.id ? "..." : "Cancel RSVP"}
                          </button>
                        ) : sessionFull ? (
                          <span className="px-6 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
                            Session Full
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRsvp(event.id)}
                            disabled={rsvpLoading === event.id}
                            className="px-6 py-2 bg-brand-green text-white rounded-lg hover:bg-green-400 transition disabled:opacity-50"
                          >
                            {rsvpLoading === event.id ? "..." : "RSVP Now"}
                          </button>
                        )}
                      </>
                    )}

                    {isDui && (
                      <>
                        {isRegistered ? (
                          <span className="px-6 py-2 bg-purple-100 text-purple-700 rounded-lg">
                            ✓ Registered
                          </span>
                        ) : duiFull ? (
                          <span className="px-6 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
                            Class Full
                          </span>
                        ) : (
                          <Link
                            href={`/programs/dui-classes/register/${event.id}`}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-center"
                          >
                            Register & Pay
                          </Link>
                        )}
                      </>
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
