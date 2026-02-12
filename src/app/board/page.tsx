'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePolling } from '@/hooks/usePolling'
import { useSession } from 'next-auth/react'
import { DollarSign, Calendar, Users, Mail, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import ActivityFeed from '@/components/shared/ActivityFeed'

interface Metrics {
  donations: {
    amount: number
    count: number
  }
  meetingsThisMonth: number
  totalSubscribers: number
  pendingInquiries: number
}

interface BoardUpdate {
  id: string
  title: string
  content: string
  category: string
  priority: boolean
  createdAt: string
  author: {
    name: string | null
    email: string
  }
}

export default function BoardDashboard() {
  const { data: session } = useSession()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [recentUpdates, setRecentUpdates] = useState<BoardUpdate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [metricsRes, updatesRes] = await Promise.all([
        fetch('/api/board/metrics'),
        fetch('/api/board/updates?limit=5'),
      ])

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        setMetrics(metricsData)
      }

      if (updatesRes.ok) {
        const updatesData = await updatesRes.json()
        setRecentUpdates(updatesData)
      }
    } catch (error) {
      console.error('Error fetching board data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  usePolling(fetchData, 60000)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    )
  }

  const priorityUpdates = recentUpdates.filter(u => u.priority)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {session?.user?.name || 'Board Member'}
        </h1>
        <p className="text-gray-600 mt-2">
          AVFY Board Member Portal - {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* High Priority Updates */}
      {priorityUpdates.length > 0 && (
        <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-4 sm:p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-amber-900 mb-3">High Priority Updates</h2>
              <div className="space-y-3">
                {priorityUpdates.map(update => (
                  <div key={update.id} className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900">{update.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{update.content}</p>
                    <Link 
                      href="/board/updates" 
                      className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
                    >
                      Read more →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Donations This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${metrics?.donations.amount.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {metrics?.donations.count || 0} donations
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Meetings This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metrics?.meetingsThisMonth || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Program sessions</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Newsletter Subscribers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metrics?.totalSubscribers || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Active subscribers</p>
            </div>
            <Users className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Inquiries</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metrics?.pendingInquiries || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Contact requests</p>
            </div>
            <Mail className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Updates</h2>
          <Link 
            href="/board/updates" 
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all →
          </Link>
        </div>
        
        {recentUpdates.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No updates yet</p>
        ) : (
          <div className="space-y-4">
            {recentUpdates.map(update => (
              <div key={update.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{update.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{update.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                        {update.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(update.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {update.priority && (
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded font-medium flex-shrink-0">
                      High Priority
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="mb-8">
        <ActivityFeed />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Link
          href="/board/updates"
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Board Updates</h3>
          <p className="text-indigo-100">View all board communications and announcements</p>
        </Link>

        <Link
          href="/board/documents"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Documents</h3>
          <p className="text-purple-100">Access board documents and resources</p>
        </Link>

        <Link
          href="/board/team"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Team Directory</h3>
          <p className="text-blue-100">Connect with leadership and staff members</p>
        </Link>

        <Link
          href="/board/media"
          className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Media Library</h3>
          <p className="text-pink-100">Browse photos, documents, and marketing materials</p>
        </Link>

        <Link
          href="/board/donations"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Donation Reports</h3>
          <p className="text-green-100">View comprehensive donation analytics</p>
        </Link>

        <Link
          href="/board/campaigns"
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Campaign Hub</h3>
          <p className="text-orange-100">Manage fundraising campaigns</p>
        </Link>

        <Link
          href="/board/minutes"
          className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Meeting Minutes</h3>
          <p className="text-teal-100">Access board meeting records</p>
        </Link>
      </div>
    </div>
  )
}
