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
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">Vision For You</Link>
          <div className="hidden md:flex space-x-8">
            <Link href="/programs" className="text-gray-700 hover:text-blue-600 font-medium">Programs</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 font-medium">Blog</Link>
            <Link href="/donate" className="text-gray-700 hover:text-blue-600 font-medium">Donate</Link>
            {session?.user ? (
              <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Dashboard</Link>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-r from-blue-700 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Upcoming Sessions</h1>
          <p className="text-xl opacity-95">Join our community support meetings and programs</p>
          {!session?.user && <p className="text-lg mt-4 opacity-90">📌 Sign in to RSVP for sessions</p>}
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
                <div key={meeting.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition border-l-4 border-blue-600">
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
                    <Link href={`/login?callbackUrl=/meetings`} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-center block">
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
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
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

      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Join?</h2>
          <p className="text-lg text-gray-700 mb-8">Create an account to track your RSVPs and stay connected with our community.</p>
          {!session?.user ? (
            <Link href="/signup" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
              Create Account
            </Link>
          ) : (
            <Link href="/dashboard" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
              View My RSVPs
            </Link>
          )}
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div><h4 className="text-white font-bold mb-4">A Vision For You</h4><p className="text-sm">Supporting recovery and transformation for those facing homelessness, addiction, and mental health challenges.</p></div>
            <div><h4 className="text-white font-bold mb-4">Links</h4><ul className="space-y-2 text-sm"><li><Link href="/programs" className="hover:text-white">Programs</Link></li><li><Link href="/about" className="hover:text-white">About</Link></li><li><Link href="/blog" className="hover:text-white">Blog</Link></li><li><Link href="/donate" className="hover:text-white">Donate</Link></li></ul></div>
            <div><h4 className="text-white font-bold mb-4">Account</h4><ul className="space-y-2 text-sm"><li><Link href="/login" className="hover:text-white">Sign In</Link></li><li><Link href="/signup" className="hover:text-white">Create Account</Link></li></ul></div>
            <div><h4 className="text-white font-bold mb-4">Contact</h4><p className="text-sm mb-2"><strong>1675 Story Ave, Louisville, KY 40206</strong></p><p className="text-sm mb-2"><a href="tel:+15027496344" className="hover:text-white">(502) 749-6344</a></p><p className="text-sm"><a href="mailto:info@avisionforyourecovery.org" className="hover:text-white">info@avisionforyourecovery.org</a></p></div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm"><p>&copy; 2025 A Vision For You Recovery. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  )
}
