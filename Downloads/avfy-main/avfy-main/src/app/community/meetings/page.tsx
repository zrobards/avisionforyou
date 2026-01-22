"use client"

import { useEffect, useState } from "react"
import { Calendar, MapPin, Link as LinkIcon, CheckCircle, DollarSign, Users } from "lucide-react"
import { useRouter } from "next/navigation"

interface SessionOrClass {
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
  type: 'session' | 'class'
  userRsvpStatus: string | null
  // Class-specific fields
  price?: number
  capacity?: number
  startTime?: string
  endTime?: string
  instructor?: string | null
  spotsAvailable?: number
}

export default function CommunityMeetingsPage() {
  const router = useRouter()
  const [items, setItems] = useState<SessionOrClass[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/community/meetings?upcoming=true")
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error("Error fetching sessions and classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRsvp = async (itemId: string, itemType: 'session' | 'class') => {
    setActionId(itemId)
    setError("")

    try {
      if (itemType === 'session') {
        // Handle session RSVP
        const item = items.find(m => m.id === itemId)
        const alreadyRsvpd = item?.userRsvpStatus === "CONFIRMED"

        const response = await fetch("/api/community/rsvp", {
          method: alreadyRsvpd ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingId: itemId })
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Failed to update RSVP")
          return
        }

        // Refresh items to update RSVP status
        fetchItems()
      } else {
        // Handle class registration - redirect to registration page
        router.push(`/programs/dui-classes/register/${itemId}`)
      }
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

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sessions & Classes</h1>
        <p className="text-gray-600 mt-2">
          Browse and sign up for upcoming community sessions and DUI education classes
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No upcoming sessions or classes at this time.</p>
          <p className="text-sm text-gray-500 mt-2">Check back soon for new opportunities!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isRsvped = item.userRsvpStatus === "CONFIRMED" || item.userRsvpStatus === "PAID"
            const isProcessing = actionId === item.id
            const isClass = item.type === 'class'
            const isFull = isClass && item.spotsAvailable !== undefined && item.spotsAvailable <= 0

            return (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden ${
                  isClass ? 'border-l-4 border-purple-500' : 'border-l-4 border-green-500'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.title}
                        </h3>
                        {isRsvped && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        isClass 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {isClass ? 'DUI Class' : 'Free Session'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {formatDate(item.startDate)}
                        {isClass && item.startTime && ` • ${item.startTime} - ${item.endTime}`}
                      </span>
                    </div>

                    {item.format === "IN_PERSON" && item.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{item.location}</span>
                      </div>
                    )}

                    {item.format === "ONLINE" && item.link && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <LinkIcon className="w-4 h-4 text-gray-400" />
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 hover:underline"
                        >
                          Join Online
                        </a>
                      </div>
                    )}

                    {isClass && (
                      <>
                        {item.price && (
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span>{formatPrice(item.price)}</span>
                          </div>
                        )}
                        {item.spotsAvailable !== undefined && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>
                              {item.spotsAvailable} of {item.capacity} spots available
                            </span>
                          </div>
                        )}
                        {item.instructor && (
                          <div className="text-xs text-gray-500">
                            Instructor: {item.instructor}
                          </div>
                        )}
                      </>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                      {item.program.name}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRsvp(item.id, item.type)}
                    disabled={isProcessing || isFull}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                      isRsvped
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : isFull
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : isClass
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-green-600 text-white hover:bg-green-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isProcessing
                      ? "Processing..."
                      : isFull
                      ? "Class Full"
                      : isRsvped
                      ? isClass ? "Registered" : "Cancel RSVP"
                      : isClass
                      ? "Register Now"
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
