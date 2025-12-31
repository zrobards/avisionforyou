'use client'

import { useState } from 'react'
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

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save stats:', error)
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
                  <label className={`block text-sm font-semibold ${platform.color} mb-2`}>
                    {platform.label}
                  </label>
                  <input
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
              <strong>Note:</strong> These counts update the social media page instantly. Changes are saved to the database and persist across sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
