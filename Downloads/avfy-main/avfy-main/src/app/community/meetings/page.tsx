"use client"

import { useEffect, useState } from "react"
import { Calendar, MapPin, Link as LinkIcon, CheckCircle } from "lucide-react"

interface Meeting {
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
    slug: string
  }
  userRsvpStatus: string | null
}

export default function CommunityMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/community/meetings?upcoming=true")
      if (res.ok) {
        const data = await res.json()
        setMeetings(data)
      }
    } catch (error) {
      console.error("Error fetching meetings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRsvp = async (meetingId: string) => {
    setActionId(meetingId)
    setError("")

    try {
      const meeting = meetings.find(m => m.id === meetingId)
      const alreadyRsvpd = meeting?.userRsvpStatus === "CONFIRMED"

      const response = await fetch("/api/community/rsvp", {
        method: alreadyRsvpd ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to update RSVP")
        return
      }

      // Refresh meetings to update RSVP status
      fetchMeetings()
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
        <h1 className="text-3xl font-bold text-gray-900">Upcoming Meetings</h1>
        <p className="text-gray-600 mt-2">
          Browse and RSVP to upcoming community meetings and sessions
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {meetings.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No upcoming meetings at this time.</p>
          <p className="text-sm text-gray-500 mt-2">Check back soon for new sessions!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => {
            const isRsvped = meeting.userRsvpStatus === "CONFIRMED"
            const isProcessing = actionId === meeting.id

            return (
              <div
                key={meeting.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {meeting.title}
                    </h3>
                    {isRsvped && (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {meeting.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(meeting.startDate)}</span>
                    </div>

                    {meeting.format === "IN_PERSON" && meeting.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{meeting.location}</span>
                      </div>
                    )}

                    {meeting.format === "ONLINE" && meeting.link && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <LinkIcon className="w-4 h-4 text-gray-400" />
                        <a
                          href={meeting.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 hover:underline"
                        >
                          Join Online
                        </a>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                      Program: {meeting.program.name}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRsvp(meeting.id)}
                    disabled={isProcessing}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                      isRsvped
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-600 text-white hover:bg-green-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isProcessing
                      ? "Processing..."
                      : isRsvped
                      ? "Cancel RSVP"
                      : "RSVP"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
