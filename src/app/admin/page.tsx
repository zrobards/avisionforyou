'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BarChart3, Users, Calendar, TrendingUp, Heart } from 'lucide-react'

interface AdminData {
  users: any[]
  meetings: any[]
  stats: {
    totalUsers: number
    completedAssessments: number
    totalRsvps: number
    upcomingMeetings: number
    totalDonations: number
    donationVolume: number
  }
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createError, setCreateError] = useState('')
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    program: 'MINDBODYSOUL_IOP',
    startTime: '',
    endTime: '',
    format: 'ONLINE',
    link: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchAdminData()
      const interval = setInterval(() => fetchAdminData(true), 15000)
      return () => clearInterval(interval)
    }
  }, [status])

  const fetchAdminData = async (isBackground = false) => {
    try {
      if (!isBackground) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      const response = await fetch('/api/admin/data')
      if (!response.ok) {
        if (response.status === 403) {
          setError('You do not have admin access.')
          router.push('/dashboard')
          return
        }
        throw new Error('Failed to fetch admin data')
      }
      const adminData = await response.json()
      setData(adminData)
    } catch (err) {
      setError('Failed to load admin data')
      console.error(err)
    } finally {
      if (!isBackground) {
        setLoading(false)
      } else {
        setRefreshing(false)
      }
    }
  }

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess(false)
    
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeeting)
      })

      const result = await response.json()

      if (response.ok) {
        setCreateSuccess(true)
        setNewMeeting({
          title: '',
          description: '',
          program: 'MINDBODYSOUL_IOP',
          startTime: '',
          endTime: '',
          format: 'ONLINE',
          link: ''
        })
        await fetchAdminData()
        
        // Clear success message after 3 seconds
        setTimeout(() => setCreateSuccess(false), 3000)
      } else {
        setCreateError(result.error || 'Failed to create meeting')
      }
    } catch (err) {
      console.error('Create meeting error:', err)
      setCreateError('Network error - failed to create meeting')
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center"><p>Loading admin panel...</p></div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">← Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-6 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-gray-400">Manage users, meetings, and content</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => fetchAdminData(true)}
              disabled={refreshing}
              className="text-sm px-4 py-2 bg-gray-700/60 hover:bg-gray-700 rounded-lg border border-gray-600 disabled:opacity-50"
            >
              {refreshing ? 'Refreshing…' : 'Refresh now'}
            </button>
            <Link href="/admin/admissions" className="flex items-center gap-2 text-white bg-purple-600/20 hover:bg-purple-600/30 px-4 py-2 rounded-lg transition-colors">
              <BarChart3 className="w-4 h-4" />
              Admissions
            </Link>
            <Link href="/admin/donations" className="flex items-center gap-2 text-white bg-red-600/20 hover:bg-red-600/30 px-4 py-2 rounded-lg transition-colors">
              <Heart className="w-4 h-4" />
              Donations
            </Link>
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">← Back to Dashboard</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Statistics */}
        <div className="grid md:grid-cols-5 gap-6 mb-12">
          {[
            { icon: Users, label: 'Total Users', value: data?.stats.totalUsers || 0, color: 'blue' },
            { icon: Calendar, label: 'Completed Assessments', value: data?.stats.completedAssessments || 0, color: 'green' },
            { icon: TrendingUp, label: 'Total RSVPs', value: data?.stats.totalRsvps || 0, color: 'purple' },
            { icon: BarChart3, label: 'Upcoming Meetings', value: data?.stats.upcomingMeetings || 0, color: 'orange' },
            { icon: Heart, label: 'Donations', value: data?.stats.totalDonations || 0, color: 'red', helper: `$${(data?.stats.donationVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` }
          ].map((stat, idx) => {
            const Icon = stat.icon
            const colorMap = {
              blue: 'bg-blue-500',
              green: 'bg-green-500',
              purple: 'bg-purple-500',
              orange: 'bg-orange-500',
              red: 'bg-red-500'
            }
            return (
              <div key={idx} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    {stat.helper && <p className="text-sm text-gray-400">{stat.helper}</p>}
                  </div>
                  <div className={`${colorMap[stat.color as keyof typeof colorMap]} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-gray-700">
          {['overview', 'users', 'meetings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Quick Stats</h2>
              <div className="space-y-3 text-gray-300">
                <p>Total active users: <span className="text-white font-bold">{data?.users.length || 0}</span></p>
                <p>Assessment completion rate: <span className="text-white font-bold">{data?.stats.completedAssessments && data?.users.length ? Math.round((data.stats.completedAssessments / data.users.length) * 100) : 0}%</span></p>
                <p>Average RSVPs per meeting: <span className="text-white font-bold">{data?.stats.totalRsvps && data?.stats.upcomingMeetings ? Math.round(data.stats.totalRsvps / data.stats.upcomingMeetings) : 0}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Registered Users</h2>
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-300 font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-semibold">Assessment</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-semibold">RSVPs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data?.users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-750 transition">
                      <td className="px-6 py-4 text-gray-200">{user.name}</td>
                      <td className="px-6 py-4 text-gray-200">{user.email}</td>
                      <td className="px-6 py-4">
                        {user.assessment ? (
                          <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-sm">Completed</span>
                        ) : (
                          <span className="bg-gray-700 text-gray-400 px-3 py-1 rounded-full text-sm">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-200">{user.rsvps?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="space-y-8">
            {/* Meeting Creation */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6">Create Meeting</h2>
              
              {createSuccess && (
                <div className="mb-4 p-4 bg-green-600/20 border border-green-600/50 rounded-lg">
                  <p className="text-green-400 font-semibold">✓ Meeting created successfully! Users can now RSVP and will receive email reminders.</p>
                </div>
              )}
              
              {createError && (
                <div className="mb-4 p-4 bg-red-600/20 border border-red-600/50 rounded-lg">
                  <p className="text-red-400 font-semibold">✗ {createError}</p>
                </div>
              )}
              
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">Title</label>
                    <input
                      type="text"
                      value={newMeeting.title}
                      onChange={e => setNewMeeting({...newMeeting, title: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">Program</label>
                    <select value={newMeeting.program} onChange={e => setNewMeeting({...newMeeting, program: e.target.value})} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                      <option value="MINDBODYSOUL_IOP">MindBodySoul IOP</option>
                      <option value="SURRENDER_PROGRAM">Surrender Program</option>
                      <option value="MOVING_MOUNTAINS">Moving Mountains</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Description</label>
                  <textarea
                    value={newMeeting.description}
                    onChange={e => setNewMeeting({...newMeeting, description: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">Start Time</label>
                    <input
                      type="datetime-local"
                      value={newMeeting.startTime}
                      onChange={e => setNewMeeting({...newMeeting, startTime: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">End Time</label>
                    <input
                      type="datetime-local"
                      value={newMeeting.endTime}
                      onChange={e => setNewMeeting({...newMeeting, endTime: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">Format</label>
                    <select value={newMeeting.format} onChange={e => setNewMeeting({...newMeeting, format: e.target.value})} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                      <option value="ONLINE">Online</option>
                      <option value="IN_PERSON">In-Person</option>
                    </select>
                  </div>
                  {newMeeting.format === 'ONLINE' && (
                    <div>
                      <label className="block text-gray-300 font-semibold mb-2">Meeting Link</label>
                      <input
                        type="url"
                        value={newMeeting.link}
                        onChange={e => setNewMeeting({...newMeeting, link: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Create Meeting
                </button>
              </form>
            </div>

            {/* Meetings List */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6">All Meetings</h2>
              <div className="space-y-4">
                {data?.meetings.map(meeting => (
                  <div key={meeting.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white">{meeting.title}</h3>
                      <span className="bg-blue-600 px-3 py-1 rounded-full text-sm text-white">{meeting.format}</span>
                    </div>
                    <p className="text-gray-300 mb-3">{meeting.description}</p>
                    <div className="flex gap-8 text-sm text-gray-400">
                      <p>📅 {new Date(meeting.startTime).toLocaleDateString()}</p>
                      <p>👥 {meeting.rsvps?.length || 0} RSVPs</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
