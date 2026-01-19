'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

type Meeting = {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  format: string
  location?: string | null
  link?: string | null
  capacity?: number | null
  rsvpCount: number
}

export default function Meetings() {
  const { data: session } = useSession()
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [rsvps, setRsvps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState('')
  const [error, setError] = useState('')

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings?upcoming=true', { cache: 'no-store' })
      const data = await response.json()
      setMeetings(data.meetings || [])

      if (session?.user && Array.isArray(data.meetings)) {
        const userSessionIds = data.meetings
          .filter((m: any) => m.userRsvpStatus)
          .map((m: any) => m.id)
        setRsvps(userSessionIds)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load meetings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
    const interval = setInterval(fetchMeetings, 15000)
    return () => clearInterval(interval)
  }, [session?.user])

  const handleRsvp = async (meetingId: string) => {
    if (!session?.user) {
      router.push('/login?callbackUrl=/meetings')
      return
    }

    setActionId(meetingId)
    setError('')

    try {
      const alreadyRsvpd = rsvps.includes(meetingId)
      const response = await fetch('/api/rsvp', {
        method: alreadyRsvpd ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: meetingId })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update RSVP')
        return
      }

      setRsvps(prev =>
        alreadyRsvpd
          ? prev.filter(id => id !== meetingId)
          : [...prev, meetingId]
      )

      // Refresh meeting counts after RSVP change
      fetchMeetings()
    } catch (err) {
      setError('An error occurred')
      console.error(err)
    } finally {
      setActionId('')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Upcoming Sessions</h1>
          <p className="text-xl text-purple-100">Join our community support meetings and programs</p>
          {!session?.user && <p className="text-lg mt-4 text-purple-100">📌 Sign in to RSVP for sessions</p>}
        </div>
      </section>

      {session?.user && error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          {error}
        </div>
      )}

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <p className="text-gray-600">Loading meetings...</p>
          ) : meetings.length === 0 ? (
            <p className="text-gray-600">No upcoming meetings yet. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition border-l-4 border-brand-purple">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{meeting.title}</h3>
                    {rsvps.includes(meeting.id) && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">✓ Going</span>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <span className="text-lg mr-3">🕐</span>
                      <span>
                        {new Date(meeting.startDate).toLocaleDateString()} · {new Date(meeting.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="text-lg mr-3">📍</span>
                      <span>{meeting.location || 'Online session'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="text-lg mr-3">👥</span>
                      <span>{meeting.rsvpCount} / {meeting.capacity || '∞'} RSVPs</span>
                    </div>
                  </div>

                  {!session?.user ? (
                    <Link href={`/login?callbackUrl=/meetings`} className="w-full px-4 py-3 bg-brand-purple text-white rounded-lg font-semibold hover:bg-purple-800 transition text-center block">
                      Sign In to RSVP
                    </Link>
                  ) : rsvps.includes(meeting.id) ? (
                    <button
                      onClick={() => handleRsvp(meeting.id)}
                      disabled={!!actionId}
                      className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition disabled:opacity-50"
                    >
                      {actionId === meeting.id ? 'Processing...' : 'Cancel RSVP'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRsvp(meeting.id)}
                      disabled={!!actionId}
                      className="w-full px-4 py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-green-400 transition disabled:opacity-50"
                    >
                      {actionId === meeting.id ? 'Processing...' : 'RSVP Now'}
                    </button>
                  )}
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-purple-50 to-green-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Join?</h2>
          <p className="text-lg text-gray-700 mb-8">Create an account to track your RSVPs and stay connected with our community.</p>
          {!session?.user ? (
            <Link href="/signup" className="inline-block px-8 py-4 bg-brand-purple text-white rounded-lg font-bold hover:bg-purple-800 transition">
              Create Account
            </Link>
          ) : (
            <Link href="/dashboard" className="inline-block px-8 py-4 bg-brand-purple text-white rounded-lg font-bold hover:bg-purple-800 transition">
              View My RSVPs
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
