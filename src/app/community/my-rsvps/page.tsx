"use client"

import { useEffect, useState, useCallback } from "react"
import { usePolling } from '@/hooks/usePolling'
import { Calendar, MapPin, Link as LinkIcon, X } from "lucide-react"

interface RSVP {
  id: string
  status: string
  createdAt: string
  session: {
    id: string
    title: string
    description: string
    startDate: string
    endDate: string
    location: string | null
    format: string
    link: string | null
    program: {
      name: string
    }
  }
}

export default function MyRSVPsPage() {
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const fetchRSVPs = useCallback(async () => {
    try {
      const res = await fetch("/api/rsvp")
      if (res.ok) {
        const data = await res.json()
        setRsvps(data.rsvps || [])
      }
    } catch (error) {
      console.error("Error fetching RSVPs:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRSVPs()
  }, [fetchRSVPs])

  usePolling(fetchRSVPs, 60000)

  const handleCancelRsvp = async (sessionId: string) => {
    setActionId(sessionId)
    setError("")

    try {
      const response = await fetch("/api/community/rsvp", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: sessionId })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to cancel RSVP")
        return
      }

      // Refresh RSVPs
      fetchRSVPs()
    } catch (err) {
      setError("An error occurred")
      console.error(err)
    } finally {
      setActionId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  }

  const now = new Date()
  const upcomingRSVPs = rsvps.filter(
    (rsvp) =>
      rsvp.status === "CONFIRMED" && new Date(rsvp.session.startDate) >= now
  )
  const pastRSVPs = rsvps.filter(
    (rsvp) => new Date(rsvp.session.endDate) < now
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My RSVPs</h1>
        <p className="text-gray-600 mt-2">
          View and manage your meeting RSVPs
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "upcoming"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Upcoming ({upcomingRSVPs.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "past"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Past ({pastRSVPs.length})
          </button>
        </nav>
      </div>

      {/* Upcoming RSVPs */}
      {activeTab === "upcoming" && (
        <div>
          {upcomingRSVPs.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming RSVPs.</p>
              <p className="text-sm text-gray-500 mt-2">
                <a href="/community/meetings" className="text-green-600 hover:underline">
                  Browse sessions and classes
                </a>{" "}
                to RSVP
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingRSVPs.map((rsvp) => {
                const isProcessing = actionId === rsvp.session.id
                return (
                  <div
                    key={rsvp.id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {rsvp.session.title}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            {rsvp.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                          {rsvp.session.description}
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(rsvp.session.startDate)}</span>
                          </div>

                          {rsvp.session.format === "IN_PERSON" &&
                            rsvp.session.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{rsvp.session.location}</span>
                              </div>
                            )}

                          {rsvp.session.format === "ONLINE" && rsvp.session.link && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <LinkIcon className="w-4 h-4 text-gray-400" />
                              <a
                                href={rsvp.session.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700 hover:underline"
                              >
                                Join Online
                              </a>
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            Program: {rsvp.session.program.name}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelRsvp(rsvp.session.id)}
                        disabled={isProcessing}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Cancel RSVP"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Past RSVPs */}
      {activeTab === "past" && (
        <div>
          {pastRSVPs.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No past RSVPs.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastRSVPs.map((rsvp) => (
                <div
                  key={rsvp.id}
                  className="bg-white rounded-lg shadow p-6 opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rsvp.session.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            rsvp.status === "CONFIRMED"
                              ? "bg-gray-100 text-gray-800"
                              : rsvp.status === "NO_SHOW"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {rsvp.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        {rsvp.session.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(rsvp.session.startDate)}</span>
                        </div>

                        <div className="text-xs text-gray-500">
                          Program: {rsvp.session.program.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
