'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePolling } from '@/hooks/usePolling'

interface ActivityItem {
  id: string
  type: string
  title: string
  detail: string | null
  link: string | null
  createdAt: string
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/activity')
      if (res.ok) {
        const data = await res.json()
        setActivities(data)
      }
    } catch {
      // Silently fail for polling
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  usePolling(fetchActivities, 60000)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'donation': return '💰'
      case 'campaign': return '🎯'
      case 'user_registration': return '👤'
      case 'document': return '📄'
      case 'meeting': return '📅'
      default: return '📌'
    }
  }

  const timeAgo = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>

      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-6 text-sm">No recent activity</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.slice(0, 20).map(activity => (
            <div key={activity.id} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
              <span className="text-lg flex-shrink-0">{getTypeIcon(activity.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                {activity.detail && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.detail}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{timeAgo(activity.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
