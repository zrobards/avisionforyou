'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Calendar, Heart, LogOut, Settings } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'upcoming' | 'my-meetings'>('upcoming')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch meetings
      let meetingsData: Meeting[] = []
      let userRsvpIds: string[] = []
      try {
        const meetingsRes = await fetch('/api/meetings', {
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })
        if (meetingsRes.ok) {
          const data = await meetingsRes.json()
          meetingsData = data.meetings || []
          userRsvpIds = meetingsData
            .filter((m: any) => m.userRsvpStatus)
            .map((m: any) => m.id)
        }
      } catch (error) {
        console.error('Failed to fetch meetings:', error)
      }
      setMeetings(meetingsData)
      setUserRsvps(userRsvpIds)

      // Fetch assessment
      try {
        const assessmentRes = await fetch('/api/assessment', {
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })
        if (assessmentRes.ok) {
          const data = await assessmentRes.json()
          setAssessment(data.assessment)
        }
      } catch (error) {
        console.error('Failed to fetch assessment:', error)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const upcomingMeetings = meetings.filter(m => new Date(m.startTime) > new Date())
  const filteredMeetings = filter === 'all' ? upcomingMeetings : upcomingMeetings.filter(m => m.format === filter.toUpperCase())

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-8 border-b border-purple-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}!</h1>
            <p className="text-purple-100 mt-2">Your personal recovery dashboard</p>
          </div>
          <div className="flex gap-4">
            <Link href="/admission" className="flex items-center gap-2 bg-brand-green text-brand-purple px-4 py-2 rounded-lg font-semibold hover:bg-green-400 transition">
              <Settings className="w-4 h-4" />
              Apply for Admission
            </Link>
            <Link href="/assessment" className="flex items-center gap-2 bg-brand-green text-brand-purple px-4 py-2 rounded-lg font-semibold hover:bg-green-400 transition">
              <Settings className="w-4 h-4" />
              Reassess
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Application Status */}
        {assessment ? (
          <div className="mb-8 bg-green-50 border border-brand-green rounded-lg p-6">
            <div className="flex gap-4">
              <Heart className="w-6 h-6 text-brand-green flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Application Submitted</h3>
                <p className="text-gray-700">Based on your application, we recommend the <strong>{assessment.recommendedProgram}</strong> program. You can view upcoming sessions below.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-purple-50 border border-brand-purple rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Complete Your Application</h3>
                <p className="text-gray-700">Fill out our brief application to help us match you with the best program for your needs.</p>
              </div>
              <Link href="/assessment" className="bg-brand-purple text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-800 transition">
                Start Application
              </Link>
            </div>
          </div>
        )}

        {/* Meetings Section with Tabs */}
        <div className="mb-12">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 px-2 font-semibold transition ${
                activeTab === 'upcoming'
                  ? 'text-brand-purple border-b-2 border-brand-purple'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming Sessions
            </button>
            <button
              onClick={() => setActiveTab('my-meetings')}
              className={`pb-3 px-2 font-semibold transition ${
                activeTab === 'my-meetings'
                  ? 'text-brand-purple border-b-2 border-brand-purple'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Meetings
            </button>
          </div>

          {/* Upcoming Sessions Tab */}
          {activeTab === 'upcoming' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${filter === 'all' ? 'bg-brand-purple text-white' : 'bg-white text-gray-700 border border-gray-300 hover:border-brand-purple'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('online')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${filter === 'online' ? 'bg-brand-purple text-white' : 'bg-white text-gray-700 border border-gray-300 hover:border-brand-purple'}`}
                  >
                    Online
                  </button>
                  <button
                    onClick={() => setFilter('in_person')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${filter === 'in_person' ? 'bg-brand-purple text-white' : 'bg-white text-gray-700 border border-gray-300 hover:border-brand-purple'}`}
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
                    <div key={meeting.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-brand-purple">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{meeting.title}</h3>
                          <p className="text-gray-600">{meeting.description}</p>
                        </div>
                        <span className="bg-purple-100 text-brand-purple px-3 py-1 rounded-full text-sm font-semibold">
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
                        <div className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <p className="text-sm text-gray-700"><strong>Meeting Link:</strong> <a href={meeting.link} className="text-brand-purple hover:underline">{meeting.link}</a></p>
                        </div>
                      )}

                      {meeting.format === 'IN_PERSON' && meeting.location && (
                        <div className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <p className="text-sm text-gray-700"><strong>Location:</strong> {meeting.location}</p>
                        </div>
                      )}

                      <button
                        onClick={() => handleRsvp(meeting.id)}
                        className={`w-full py-2 rounded-lg font-semibold transition ${
                          userRsvps.includes(meeting.id)
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gradient-to-r from-brand-purple to-purple-700 text-white hover:from-purple-800 hover:to-purple-900'
                        }`}
                      >
                        {userRsvps.includes(meeting.id) ? '✓ RSVP\'d' : 'RSVP'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* My Meetings Tab */}
          {activeTab === 'my-meetings' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Meetings</h2>
              {userRsvps.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">You haven't RSVP'd to any meetings yet.</p>
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className="inline-block bg-brand-purple text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
                  >
                    Browse Upcoming Sessions
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {meetings
                    .filter(m => userRsvps.includes(m.id))
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map(meeting => (
                    <div key={meeting.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-brand-green">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{meeting.title}</h3>
                          <p className="text-gray-600">{meeting.description}</p>
                        </div>
                        <span className="bg-green-100 text-brand-green px-3 py-1 rounded-full text-sm font-semibold">
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
                        <div className="mb-4 bg-green-50 p-3 rounded-lg border border-green-200">
                          <p className="text-sm text-gray-700"><strong>Meeting Link:</strong> <a href={meeting.link} className="text-brand-green hover:underline">{meeting.link}</a></p>
                        </div>
                      )}

                      {meeting.format === 'IN_PERSON' && meeting.location && (
                        <div className="mb-4 bg-green-50 p-3 rounded-lg border border-green-200">
                          <p className="text-sm text-gray-700"><strong>Location:</strong> {meeting.location}</p>
                        </div>
                      )}

                      <button
                        onClick={() => handleRsvp(meeting.id)}
                        className="w-full py-2 rounded-lg font-semibold transition bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        ✓ Cancel RSVP
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
