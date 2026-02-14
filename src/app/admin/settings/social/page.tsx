'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Save, Loader } from 'lucide-react'

interface SocialSettings {
  instagramUrl?: string
  facebookPageUrl?: string
  tiktokUsername?: string
  snapWidgetId?: string
}

export default function AdminSocialSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  const [settings, setSettings] = useState<SocialSettings>({
    instagramUrl: 'https://www.instagram.com/avision_foryourecovery/',
    facebookPageUrl: 'https://www.facebook.com/avisionforyourecovery',
    tiktokUsername: 'avisionforyourecovery',
    snapWidgetId: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      const userRole = session?.user?.role
      if (userRole !== 'ADMIN') {
        router.push('/dashboard')
        return
      }
      fetchSettings()
    }
  }, [status, session, router])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/public/social-embed-settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      setSettings({
        instagramUrl: data.instagramUrl || '',
        facebookPageUrl: data.facebookPageUrl || '',
        tiktokUsername: data.tiktokUsername || '',
        snapWidgetId: data.snapWidgetId || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')
    setError('')

    try {
      const response = await fetch('/api/admin/settings/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save settings')
      }

      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-brand-purple" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Embed Settings</h1>
        <p className="text-gray-600">Configure social media URLs and embed settings for the homepage</p>
      </div>

      <Card className="p-6 max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Instagram Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instagram</h2>
            <div className="space-y-4">
              <Input
                label="Instagram Profile URL"
                type="url"
                value={settings.instagramUrl || ''}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                placeholder="https://www.instagram.com/avision_foryourecovery/"
              />
              <Input
                label="SnapWidget ID (Optional)"
                type="text"
                value={settings.snapWidgetId || ''}
                onChange={(e) => setSettings({ ...settings, snapWidgetId: e.target.value })}
                placeholder="Your SnapWidget widget ID"
              />
              <p className="text-sm text-gray-500">
                To get a SnapWidget ID: Sign up at{' '}
                <a href="https://snapwidget.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  snapwidget.com
                </a>
                , connect your Instagram, and create a widget.
              </p>
            </div>
          </div>

          {/* Facebook Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Facebook</h2>
            <Input
              label="Facebook Page URL"
              type="url"
              value={settings.facebookPageUrl || ''}
              onChange={(e) => setSettings({ ...settings, facebookPageUrl: e.target.value })}
                placeholder="https://www.facebook.com/avisionforyourecovery"
            />
            <p className="text-sm text-gray-500 mt-2">
              Make sure your Facebook page is public for the embed to work.
            </p>
          </div>

          {/* TikTok Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">TikTok</h2>
            <Input
              label="TikTok Username"
              type="text"
              value={settings.tiktokUsername || ''}
              onChange={(e) => setSettings({ ...settings, tiktokUsername: e.target.value })}
                placeholder="avisionforyourecovery"
            />
            <p className="text-sm text-gray-500 mt-2">
              Enter the username without the @ symbol. TikTok doesn't have a feed widget, so this will link to your profile.
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              {success}
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
