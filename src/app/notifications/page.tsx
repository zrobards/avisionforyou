'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Clock, Bell, X } from 'lucide-react'

interface Meeting {
  id: string
  title: string
  description: string
  startDate: string
  location?: string
  format: string
  link?: string
  status: string
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
  }, [status])

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch('/api/meetings?upcoming=true')
        if (!response.ok) throw new Error('Failed to fetch meetings')

        const data = await response.json()
        setMeetings(data.meetings || [])
      } catch (err) {
        console.error('Error fetching meetings:', err)
        setError('Failed to load meetings')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.email) {
      fetchMeetings()
    }
  }, [session?.user?.email])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6">
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

        {/* Meetings List */}
        {meetings.length > 0 ? (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
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
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Meetings
            </Link>
          </div>
        )}

        {/* Reminder Settings Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Bell className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Notification Preferences
              </h3>
              <p className="text-gray-700 mb-3">
                We automatically send email reminders:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
                  24 hours before your RSVP'd meeting
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
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

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const startDate = new Date(meeting.startDate)
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const isOnline = meeting.format === 'ONLINE'

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {meeting.title}
            </h2>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {formattedDate} at {formattedTime}
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              ✓ Confirmed
            </span>
          </div>
        </div>

        {meeting.description && (
          <p className="text-gray-600 mb-4">{meeting.description}</p>
        )}

        <div className="space-y-2 mb-6">
          {isOnline ? (
            <>
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                <span>Online Meeting</span>
              </div>
              {meeting.link && (
                <a
                  href={meeting.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:text-blue-700 underline text-sm"
                >
                  Join Meeting →
                </a>
              )}
            </>
          ) : (
            <div className="flex items-center text-gray-700">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              <span>{meeting.location || 'Location TBD'}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium flex items-center justify-center">
            <Bell className="w-4 h-4 mr-2" />
            Notifications On
          </button>
          <button className="flex-1 px-4 py-2 text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            Modify RSVP
          </button>
        </div>
      </div>
    </div>
  )
}
