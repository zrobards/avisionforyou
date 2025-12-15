'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BarChart3, Users, Calendar, TrendingUp, Heart, Share2, Search, X, Plus, Edit2, Check } from 'lucide-react'

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

interface QuickAction {
  id: string
  label: string
  href: string
  icon: string
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [editingQuickActions, setEditingQuickActions] = useState(false)
  const [quickActions, setQuickActions] = useState<QuickAction[]>([
    { id: '1', label: 'Manage Users', href: '/admin/users', icon: 'users' },
    { id: '2', label: 'View Meetings', href: '/admin/meetings', icon: 'calendar' },
    { id: '3', label: 'Social Media', href: '/admin/social', icon: 'share' },
    { id: '4', label: 'Write Blog', href: '/admin/blog', icon: 'filetext' },
  ])

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

  const saveQuickActions = () => {
    localStorage.setItem('adminQuickActions', JSON.stringify(quickActions))
    setEditingQuickActions(false)
  }

  const removeQuickAction = (id: string) => {
    setQuickActions(quickActions.filter(qa => qa.id !== id))
  }

  const toggleQuickAction = (id: string) => {
    const action = quickActions.find(qa => qa.id === id)
    if (action) {
      removeQuickAction(id)
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm">Manage users, meetings, and content</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-stagger">
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
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-smooth card-hover">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
                      {stat.helper && <p className="text-sm text-gray-500 mt-1">{stat.helper}</p>}
                    </div>
                    <div className={`${colorMap[stat.color as keyof typeof colorMap]} p-3 rounded-lg transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-stagger">
            {/* Users Section */}
            <div className="lg:col-span-2 animate-slide-up">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 card-hover">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Recent Users</h2>
                  <Link href="/admin/users" className="text-sm text-brand-purple hover:text-brand-purple/90 font-semibold transition-smooth">View All →</Link>
                </div>
                <div className="space-y-3 mb-4 animate-stagger">
                  {data?.users.slice(0, 5).map(user => (
                    <div key={user.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-smooth hover-lift">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{user.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{user.rsvps?.length || 0} RSVPs</span>
                    </div>
                  ))}
                </div>
                <Link href="/admin/users" className="w-full text-center px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-smooth transform hover:scale-105 font-medium text-sm">
                  Manage Users
                </Link>
              </div>
            </div>

            {/* Meetings Section */}
            <div className="lg:col-span-2 animate-slide-up">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 card-hover">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Upcoming Meetings</h2>
                  <Link href="/admin/meetings" className="text-sm text-brand-purple hover:text-brand-purple/90 font-semibold transition-smooth">View All →</Link>
                </div>
                <div className="space-y-3 mb-4 animate-stagger">
                  {data?.meetings.slice(0, 5).map(meeting => (
                    <div key={meeting.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-smooth hover-lift">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{meeting.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(meeting.startTime).toLocaleDateString()}</p>
                        </div>
                        <span className="text-xs font-semibold text-gray-600">{meeting.rsvps?.length || 0} RSVPs</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/admin/meetings" className="w-full text-center px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-smooth transform hover:scale-105 font-medium text-sm">
                  Manage Meetings
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions - Customizable */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 card-hover animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
              <button
                onClick={() => setEditingQuickActions(!editingQuickActions)}
                className="text-sm px-3 py-1 text-brand-purple border border-brand-purple rounded hover:bg-brand-purple/10 transition-smooth flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                {editingQuickActions ? 'Done' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-stagger">
              {quickActions.map(action => (
                <div key={action.id} className="relative group animate-scale-in">
                  <Link
                    href={action.href}
                    className="block w-full p-4 bg-gradient-to-br from-brand-purple to-purple-700 text-white rounded-lg hover:shadow-lg transition-smooth hover-scale text-center font-medium text-sm"
                  >
                    {action.label}
                  </Link>
                  {editingQuickActions && (
                    <button
                      onClick={() => removeQuickAction(action.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-smooth scale-0 group-hover:scale-100 origin-top-right"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {editingQuickActions && (
              <div className="mt-4 flex gap-2 animate-slide-up">
                <button
                  onClick={saveQuickActions}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-smooth font-medium text-sm flex items-center gap-1 hover-scale"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
