'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, Users, Eye, Clock } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      setLoading(false)
    }
  }, [status, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-down">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-purple" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-sm">Website analytics and performance metrics</p>
        </div>

        {/* Stats Grid - Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Page Views</h3>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-500 mt-2">GA4 integration pending</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Unique Visitors</h3>
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-500 mt-2">GA4 integration pending</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Avg. Session</h3>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-500 mt-2">GA4 integration pending</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Bounce Rate</h3>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-500 mt-2">GA4 integration pending</p>
          </div>
        </div>

        {/* Integration Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Google Analytics 4 Integration</h3>
              <p className="text-blue-800 mb-4">
                This dashboard will display real-time analytics from Google Analytics 4 once the integration is configured.
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <p><strong>Next Steps:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Configure GA4 property with HIPAA-adjacent safeguards</li>
                  <li>Set up Data API credentials</li>
                  <li>Enable IP anonymization and disable user-ID tracking</li>
                  <li>Integrate GA4 Data API for real-time metrics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Chart Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 min-h-64">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h3>
            <div className="h-48 flex items-center justify-center text-gray-400">
              Chart placeholder - GA4 integration pending
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 min-h-64">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
            <div className="h-48 flex items-center justify-center text-gray-400">
              Chart placeholder - GA4 integration pending
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
