'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BarChart3, Users, Calendar, TrendingUp, Heart, Share2 } from 'lucide-react'

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
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 text-sm">Welcome back! Here's your overview.</p>
            </div>
            <button
              onClick={() => fetchAdminData(true)}
              disabled={refreshing}
              className="text-sm px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: Users, label: 'Total Users', value: data?.stats.totalUsers || 0, color: 'blue' },
              { icon: Calendar, label: 'Completed Assessments', value: data?.stats.completedAssessments || 0, color: 'green' },
              { icon: TrendingUp, label: 'Total RSVPs', value: data?.stats.totalRsvps || 0, color: 'purple' },
              { icon: BarChart3, label: 'Upcoming Meetings', value: data?.stats.upcomingMeetings || 0, color: 'orange' },
              { icon: Heart, label: 'Donations', value: data?.stats.totalDonations || 0, color: 'red', helper: `$${(data?.stats.donationVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` }
            ].map((stat, idx) => {
              const Icon = stat.icon
              const colorMap = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600',
                red: 'bg-red-100 text-red-600'
              }
              return (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
                      {stat.helper && <p className="text-sm text-gray-500 mt-1">{stat.helper}</p>}
                    </div>
                    <div className={`${colorMap[stat.color as keyof typeof colorMap]} p-3 rounded-lg`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Tabs */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  {['overview', 'users', 'meetings'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 font-medium text-sm transition capitalize ${
                        activeTab === tab
                          ? 'border-b-2 border-brand-purple text-brand-purple'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Active Users</p>
                        <p className="text-2xl font-bold text-gray-900">{data?.users.length || 0}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Completion Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {data?.stats.completedAssessments && data?.users.length 
                            ? Math.round((data.stats.completedAssessments / data.users.length) * 100) 
                            : 0}%
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Avg RSVPs per Meeting</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {data?.stats.totalRsvps && data?.stats.upcomingMeetings 
                            ? Math.round(data.stats.totalRsvps / data.stats.upcomingMeetings) 
                            : 0}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Total Donations</p>
                        <p className="text-2xl font-bold text-gray-900">${(data?.stats.donationVolume || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-gray-600 font-semibold">Name</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-semibold">Email</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-semibold">Assessment</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-semibold">RSVPs</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.users.slice(0, 10).map(user => (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900">{user.name}</td>
                              <td className="px-4 py-3 text-gray-700">{user.email}</td>
                              <td className="px-4 py-3">
                                {user.assessment ? (
                                  <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Completed</span>
                                ) : (
                                  <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">Pending</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-700">{user.rsvps?.length || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-gray-500">Showing 10 of {data?.users.length || 0} users</p>
                  </div>
                )}

                {/* Meetings Tab */}
                {activeTab === 'meetings' && (
                  <div className="space-y-4">
                    {data?.meetings.slice(0, 5).map(meeting => (
                      <div key={meeting.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>
                          </div>
                          <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">{meeting.format}</span>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-500 mt-3">
                          <span>📅 {new Date(meeting.startTime).toLocaleDateString()}</span>
                          <span>👥 {meeting.rsvps?.length || 0} RSVPs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Right Column - Recent Activity */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/admin/users" className="block w-full text-center px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition font-medium text-sm">
                    Manage Users
                  </Link>
                  <Link href="/admin/meetings" className="block w-full text-center px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium text-sm">
                    Create Meeting
                  </Link>
                  <Link href="/admin/blog" className="block w-full text-center px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium text-sm">
                    Write Blog Post
                  </Link>
                  <Link href="/admin/social" className="block w-full text-center px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium text-sm">
                    Social Media
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
