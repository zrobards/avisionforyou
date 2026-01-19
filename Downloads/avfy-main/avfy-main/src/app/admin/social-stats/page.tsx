'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw } from 'lucide-react'

export default function SocialStatsAdmin() {
  const [stats, setStats] = useState({
    facebook: '869',
    instagram: '112',
    twitter: '70',
    linkedin: '23',
    tiktok: '41'
  })

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    // Fetch current stats on mount
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/social-stats')
        if (response.ok) {
          const data = await response.json()
          // Handle new hardened API response format { success: true, data: {...} }
          const statsData = data.data || data
          setStats(statsData)
        } else if (response.status === 401) {
          // Unauthorized - user needs to login
          console.error('Unauthorized - please login')
        } else {
          console.error('Failed to fetch stats:', response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setFetching(false)
      }
    }
    fetchStats()
  }, [])

  const handleChange = (platform: string, value: string) => {
    setStats(prev => ({
      ...prev,
      [platform]: value
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/social-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats)
      })

      const data = await response.json()

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        // Refresh the stats to show updated values
        const refreshResponse = await fetch('/api/admin/social-stats')
        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json()
          // Handle new hardened API response format { success: true, data: {...} }
          const statsData = refreshedData.data || refreshedData
          setStats(statsData)
        }
      } else if (response.status === 401) {
        alert('Session expired. Please log in again.')
      } else {
        const errorMessage = data.details 
          ? `${data.error}: ${Array.isArray(data.details) ? data.details.join(', ') : data.details}`
          : data.error || 'Please try again.'
        alert(`Failed to save: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Failed to save stats:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error saving stats: ${errorMessage}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const platforms = [
    { key: 'facebook', label: 'Facebook', color: 'text-blue-600' },
    { key: 'instagram', label: 'Instagram', color: 'text-pink-600' },
    { key: 'twitter', label: 'Twitter / X', color: 'text-sky-500' },
    { key: 'linkedin', label: 'LinkedIn', color: 'text-blue-700' },
    { key: 'tiktok', label: 'TikTok', color: 'text-gray-800' }
  ]

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-purple mx-auto mb-4" />
          <p className="text-gray-600">Loading social stats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Stats</h1>
          <p className="text-gray-600 mb-8">Update follower counts for all platforms</p>

          <div className="space-y-6">
            {platforms.map(platform => (
              <div key={platform.key} className="flex items-end gap-4">
                <div className="flex-1">
                  <label htmlFor={`social-stats-${platform.key}`} className={`block text-sm font-semibold ${platform.color} mb-2`}>
                    {platform.label}
                  </label>
                  <input
                    id={`social-stats-${platform.key}`}
                    name={`social-stats-${platform.key}`}
                    type="number"
                    value={stats[platform.key as keyof typeof stats]}
                    onChange={(e) => handleChange(platform.key, e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-purple"
                    placeholder="Enter follower count"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-purple to-purple-700 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Updates
                </>
              )}
            </button>

            {saved && (
              <div className="flex items-center px-4 py-3 bg-green-100 text-green-700 rounded-lg font-semibold">
                ✓ Saved successfully!
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These counts update the social media page and footer instantly. Changes are saved to the database and persist across sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
