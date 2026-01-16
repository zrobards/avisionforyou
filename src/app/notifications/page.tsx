'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Clock, Bell, X } from 'lucide-react'

interface RSVP {
  id: string
  meetingTitle: string
  startDate: string
  location?: string
  format: string
  link?: string
  reminder24hSent: boolean
  reminder1hSent: boolean
  status: string
}

interface Meeting {
  id: string
  title: string
  description: string
  startDate: string
  location?: string
  format: string
  link?: string
  status: string
  userRsvpStatus?: string | null
  reminderStatus?: {
    reminder24h: boolean
    reminder1h: boolean
  } | null
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
  }, [status])

  useEffect(() => {
    const fetchRsvps = async () => {
      try {
        const response = await fetch('/api/rsvp/user')
        if (!response.ok) throw new Error('Failed to fetch RSVPs')

        const data = await response.json()
        setRsvps(data.rsvps || [])
      } catch (err) {
        console.error('Error fetching RSVPs:', err)
        setError('Failed to load your RSVPs')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.email) {
      fetchRsvps()
      // Refresh every 30 seconds
      const interval = setInterval(fetchRsvps, 30000)
      return () => clearInterval(interval)
    }
  }, [session?.user?.email])

  const handleCancelRsvp = async (rsvpId: string) => {
    if (!confirm('Are you sure you want to cancel this RSVP?')) {
      return
    }

    setCancellingId(rsvpId)
    setError(null)

    try {
      const response = await fetch('/api/rsvp/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvpId })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel RSVP')
      }

      // Remove the cancelled RSVP from the list
      setRsvps(rsvps.filter(rsvp => rsvp.id !== rsvpId))
    } catch (err: any) {
      setError(err.message || 'Failed to cancel RSVP')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Upcoming Meetings
          </h1>
          <p className="text-lg text-gray-600">
            Manage your RSVPs and stay updated on upcoming meetings
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* RSVPs List */}
        {rsvps.length > 0 ? (
          <div className="space-y-4">
            {rsvps.map((rsvp) => (
              <RSVPCard 
                key={rsvp.id} 
                rsvp={rsvp} 
                onCancel={handleCancelRsvp}
                isCancelling={cancellingId === rsvp.id}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No upcoming meetings
            </h3>
            <p className="text-gray-600 mb-4">
              You haven't RSVP'd to any upcoming meetings yet.
            </p>
            <Link
              href="/meetings"
              className="inline-block bg-brand-purple text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Browse Meetings
            </Link>
          </div>
        )}

        {/* Reminder Settings Info */}
        <div className="mt-12 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-start">
            <Bell className="w-6 h-6 text-brand-purple mt-1 mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Notification Preferences
              </h3>
              <p className="text-gray-700 mb-3">
                We automatically send email reminders:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-brand-green rounded-full mr-2" />
                  24 hours before your RSVP'd meeting
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-brand-green rounded-full mr-2" />
                  1 hour before the meeting starts
                </li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                Make sure your email in your profile is up to date to receive reminders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RSVPCard({ 
  rsvp, 
  onCancel, 
  isCancelling 
}: { 
  rsvp: RSVP
  onCancel: (id: string) => void
  isCancelling: boolean
}) {
  const startDate = new Date(rsvp.startDate)
  const now = new Date()
  const hoursUntil = Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60 * 60))
  
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const isOnline = rsvp.format === 'ONLINE'
  const isUpcoming = hoursUntil > 0
  const isSoon = hoursUntil <= 24 && hoursUntil > 0

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border-l-4 border-brand-purple">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {rsvp.meetingTitle}
            </h2>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {formattedDate} at {formattedTime}
            </div>
            {isSoon && (
              <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                Starting in {hoursUntil} hour{hoursUntil !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              ✓ Confirmed
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {isOnline ? (
            <>
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 mr-2 text-brand-purple" />
                <span>Online Meeting</span>
              </div>
              {rsvp.link && (
                <a
                  href={rsvp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-brand-purple hover:text-purple-700 underline text-sm font-medium"
                >
                  Join Meeting →
                </a>
              )}
            </>
          ) : (
            <div className="flex items-center text-gray-700">
              <MapPin className="w-5 h-5 mr-2 text-brand-purple" />
              <span>{rsvp.location || 'Location TBD'}</span>
            </div>
          )}
        </div>

        {/* Reminder Status */}
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center text-sm text-gray-700 mb-1">
            <Bell className="w-4 h-4 mr-2 text-brand-purple" />
            <span className="font-semibold">Reminder Status:</span>
          </div>
          <div className="ml-6 space-y-1 text-sm">
            <div className="flex items-center">
              {rsvp.reminder24hSent ? (
                <span className="text-green-600">✓ 24-hour reminder sent</span>
              ) : (
                <span className="text-gray-500">○ 24-hour reminder pending</span>
              )}
            </div>
            <div className="flex items-center">
              {rsvp.reminder1hSent ? (
                <span className="text-green-600">✓ 1-hour reminder sent</span>
              ) : (
                <span className="text-gray-500">○ 1-hour reminder pending</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={() => onCancel(rsvp.id)}
            disabled={isCancelling || !isUpcoming}
            className="flex-1 px-4 py-2 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel RSVP'}
          </button>
          <Link
            href="/meetings"
            className="flex-1 px-4 py-2 text-center bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            View All Meetings
          </Link>
        </div>
      </div>
    </div>
  )
}
