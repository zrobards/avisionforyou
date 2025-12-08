'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, Heart, LogOut, Settings } from 'lucide-react'

interface Meeting {
  id: string
  title: string
  description: string
  program: string
  startTime: string
  endTime: string
  format: string
  link?: string
  location?: string
  rsvps: any[]
}

interface Assessment {
  id: string
  userId: string
  answers: any
  recommendedProgram: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [userRsvps, setUserRsvps] = useState<string[]>([])
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    try {
      const [meetingsRes, assessmentRes] = await Promise.all([
        fetch('/api/meetings'),
        fetch('/api/assessment')
      ])

      if (meetingsRes.ok) {
        const data = await meetingsRes.json()
        setMeetings(data.meetings || [])
        const myRsvps = (data.meetings || [])
          .filter((m: any) => m.userRsvpStatus)
          .map((m: any) => m.id)
        setUserRsvps(myRsvps)
      }

      if (assessmentRes.ok) {
        const data = await assessmentRes.json()
        setAssessment(data.assessment)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRsvp = async (meetingId: string) => {
    try {
      const alreadyRsvpd = userRsvps.includes(meetingId)
      const response = await fetch('/api/rsvp', {
        method: alreadyRsvpd ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: meetingId })
      })

      if (response.ok) {
        setUserRsvps(prev =>
          alreadyRsvpd ? prev.filter(id => id !== meetingId) : [...prev, meetingId]
        )

        // Refresh meetings to keep RSVP counts current
        fetchData()
      }
    } catch (error) {
      console.error('RSVP failed:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const upcomingMeetings = meetings.filter(m => new Date(m.startTime) > new Date())
  const filteredMeetings = filter === 'all' ? upcomingMeetings : upcomingMeetings.filter(m => m.format === filter.toUpperCase())

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}!</h1>
            <p className="text-blue-100 mt-2">Your personal recovery dashboard</p>
          </div>
          <div className="flex gap-4">
            <Link href="/assessment" className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50">
              <Settings className="w-4 h-4" />
              Reassess
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Assessment Status */}
        {assessment ? (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex gap-4">
              <Heart className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Assessment Completed</h3>
                <p className="text-gray-700">Based on your assessment, we recommend the <strong>{assessment.recommendedProgram}</strong> program. You can view upcoming sessions below.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Complete Your Assessment</h3>
                <p className="text-gray-700">Take our quick assessment to help us match you with the best program for your recovery journey.</p>
              </div>
              <Link href="/assessment" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                Start Assessment
              </Link>
            </div>
          </div>
        )}

        {/* Upcoming Meetings */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('online')}
                className={`px-4 py-2 rounded-lg font-semibold ${filter === 'online' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
              >
                Online
              </button>
              <button
                onClick={() => setFilter('in_person')}
                className={`px-4 py-2 rounded-lg font-semibold ${filter === 'in_person' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
              >
                In-Person
              </button>
            </div>
          </div>

          {filteredMeetings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming sessions. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredMeetings.map(meeting => (
                <div key={meeting.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-blue-600">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{meeting.title}</h3>
                      <p className="text-gray-600">{meeting.description}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {meeting.format === 'ONLINE' ? '🌐 Online' : '📍 In-Person'}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div>
                      <p className="font-semibold text-gray-900">📅 When</p>
                      <p>{new Date(meeting.startTime).toLocaleDateString()} at {new Date(meeting.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">👥 Attendees</p>
                      <p>{meeting.rsvps.length} people attending</p>
                    </div>
                  </div>

                  {meeting.format === 'ONLINE' && meeting.link && (
                    <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700"><strong>Meeting Link:</strong> <a href={meeting.link} className="text-blue-600 hover:underline">{meeting.link}</a></p>
                    </div>
                  )}

                  {meeting.format === 'IN_PERSON' && meeting.location && (
                    <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700"><strong>Location:</strong> {meeting.location}</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleRsvp(meeting.id)}
                    className={`w-full py-2 rounded-lg font-semibold transition ${
                      userRsvps.includes(meeting.id)
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {userRsvps.includes(meeting.id) ? '✓ RSVP\'d' : 'RSVP'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community Link */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
          <p className="mb-6">Connect with others, attend online AA meetings, chat with peers, and find support 24/7</p>
          <a href="https://mightynetworks.com/" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition">
            Visit Mighty Networks Community
          </a>
        </div>
      </div>
    </div>
  )
}
