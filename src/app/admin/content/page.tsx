'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, FileText, Type, AlignLeft } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface ContentItem {
  id: string
  key: string
  value: string
  type: 'text' | 'richtext' | 'json'
  updatedAt: string
}

export default function ContentManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  // Predefined content keys
  const contentKeys = [
    { key: 'mission', label: 'Mission Statement', type: 'richtext' as const, description: 'Organization mission statement' },
    { key: 'vision', label: 'Vision Statement', type: 'richtext' as const, description: 'Organization vision' },
    { key: 'about', label: 'About Us', type: 'richtext' as const, description: 'About the organization' },
    { key: 'contact_info', label: 'Contact Information', type: 'json' as const, description: 'Contact details (JSON)' },
    { key: 'footer_text', label: 'Footer Text', type: 'text' as const, description: 'Footer copyright text' },
    { key: 'hero_title', label: 'Hero Title', type: 'text' as const, description: 'Homepage hero section title' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'text' as const, description: 'Homepage hero section subtitle' },
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchContent()
    }
  }, [status])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/content', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        const items = Array.isArray(data) ? data : (data.data || [])
        setContent(items)
        
        // Initialize edit values
        const values: Record<string, string> = {}
        items.forEach((item: ContentItem) => {
          values[item.key] = item.value
        })
        setEditValues(values)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (key: string, type: string) => {
    setSaving(key)
    try {
      const value = editValues[key] || ''
      const existingItem = content.find(c => c.key === key)

      let response
      if (existingItem) {
        // Update existing
        response = await fetch(`/api/admin/content/${existingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value })
        })
      } else {
        // Create new
        response = await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value, type })
        })
      }

      if (response.ok) {
        showToast('Content saved successfully', 'success')
        fetchContent()
      } else {
        const error = await response.json()
        showToast(error.error || 'Failed to save content', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save content', 'error')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-6 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-gray-400">Manage site-wide content and messaging</p>
          </div>
          <Link href="/admin" className="text-blue-400 hover:text-blue-300">
            ← Back to Admin
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {contentKeys.map(({ key, label, type, description }) => {
            const existingValue = editValues[key] || ''
            const isSaving = saving === key

            return (
              <div key={key} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {type === 'text' && <Type className="w-5 h-5 text-gray-400" />}
                      {type === 'richtext' && <AlignLeft className="w-5 h-5 text-gray-400" />}
                      {type === 'json' && <FileText className="w-5 h-5 text-gray-400" />}
                      <h3 className="text-xl font-bold text-white">{label}</h3>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-400">
                        {type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{description}</p>
                  </div>
                </div>

                {type === 'text' ? (
                  <input
                    type="text"
                    value={existingValue}
                    onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white mb-3"
                    placeholder={`Enter ${label.toLowerCase()}...`}
                  />
                ) : (
                  <textarea
                    value={existingValue}
                    onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm mb-3"
                    rows={type === 'richtext' ? 8 : 4}
                    placeholder={
                      type === 'json' 
                        ? '{"phone": "555-1234", "email": "info@example.com"}'
                        : `Enter ${label.toLowerCase()}...`
                    }
                  />
                )}

                <button
                  onClick={() => handleSave(key, type)}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>

                {content.find(c => c.key === key) && (
                  <p className="mt-3 text-xs text-gray-500">
                    Last updated: {new Date(content.find(c => c.key === key)!.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
