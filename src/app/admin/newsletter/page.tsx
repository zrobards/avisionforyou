'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'
import { usePolling } from '@/hooks/usePolling'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Eye, Save, Mail, Upload, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Newsletter {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  status: 'DRAFT' | 'PUBLISHED'
  imageUrl?: string
  sentAt?: string
  sentCount: number
  publishedAt?: string
  author: {
    name: string
    email: string
  }
}

const SendButton = dynamic(() => import('./send-button').then(mod => mod.SendButton), { ssr: false })

export default function AdminNewsletter() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const displayNewsletters = Array.isArray(newsletters) ? newsletters : []
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED'
  })

  const fetchNewsletters = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/newsletter', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        // Handle potential nested successResponse shapes
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.data)
              ? data.data.data
              : (Array.isArray((data as any)?.items) ? (data as any).items : (Array.isArray((data as any)?.newsletters) ? (data as any).newsletters : []))
        setNewsletters(items)
      } else if (response.status === 401) {
        // Unauthorized - redirect to login
        router.push('/login')
      } else if (loading) {
        const error = await response.json()
        showToast(error.error || 'Failed to fetch newsletters', 'error')
      }
    } catch (error: any) {
      if (loading) {
        showToast(error.message || 'Failed to fetch newsletters', 'error')
      }
      console.error('Failed to fetch newsletters:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, showToast, router])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchNewsletters()
    }
  }, [status, router, fetchNewsletters])

  usePolling(fetchNewsletters, 30000, status === 'authenticated')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editing) {
        const newsletter = newsletters.find(n => n.id === editing)
        if (!newsletter) return
        
        const response = await fetch(`/api/admin/newsletter/${newsletter.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          showToast('Newsletter updated successfully', 'success')
          setEditing(null)
          resetForm()
          fetchNewsletters()
        } else {
          const error = await response.json()
          showToast(error.error || 'Failed to update newsletter', 'error')
        }
      } else {
        const response = await fetch('/api/admin/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          showToast('Newsletter created successfully', 'success')
          setCreating(false)
          resetForm()
          fetchNewsletters()
        } else {
          const error = await response.json()
          showToast(error.error || 'Failed to create newsletter', 'error')
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save newsletter', 'error')
      console.error('Failed to save newsletter:', error)
    }
  }

  const handleEdit = (newsletter: Newsletter) => {
    setEditing(newsletter.id)
    setCreating(true)
    setFormData({
      title: newsletter.title,
      content: newsletter.content,
      excerpt: newsletter.excerpt || '',
      imageUrl: newsletter.imageUrl || '',
      status: newsletter.status
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this newsletter?')) return

    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showToast('Newsletter deleted successfully', 'success')
        fetchNewsletters()
      } else {
        const error = await response.json()
        showToast(error.error || 'Failed to delete newsletter', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to delete newsletter', 'error')
      console.error('Failed to delete newsletter:', error)
    }
  }

  const handleSend = async (id: string) => {
    if (!confirm('Are you sure you want to send this newsletter to all subscribers? This cannot be undone.')) return

    setSending(id)
    try {
      const response = await fetch(`/api/admin/newsletter/${id}/send`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        showToast(`Newsletter sent to ${data.sentCount} subscribers!`, 'success')
        fetchNewsletters()
      } else {
        const error = await response.json()
        showToast(error.error || 'Failed to send newsletter', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to send newsletter', 'error')
      console.error('Failed to send newsletter:', error)
    } finally {
      setSending(null)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image must be under 10MB', 'error')
      return
    }
    if (!file.type.startsWith('image/')) {
      showToast('File must be an image', 'error')
      return
    }
    setUploading(true)
    try {
      const upload = new FormData()
      upload.append('file', file)
      upload.append('tags', JSON.stringify(['newsletter']))
      upload.append('usage', JSON.stringify(['newsletter-featured']))
      const res = await fetch('/api/admin/media', { method: 'POST', body: upload })
      if (res.ok) {
        const media = await res.json()
        setFormData(prev => ({ ...prev, imageUrl: media.url }))
        showToast('Image uploaded', 'success')
      } else {
        showToast('Upload failed', 'error')
      }
    } catch {
      showToast('Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      imageUrl: '',
      status: 'DRAFT'
    })
    setEditing(null)
    setCreating(false)
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
            <h1 className="text-3xl font-bold">Newsletter Management</h1>
            <p className="text-gray-400">Create and send newsletters to subscribers</p>
          </div>
          <div className="flex gap-3">
            {!creating && (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                New Newsletter
              </button>
            )}
            <Link href="/admin" className="text-blue-400 hover:text-blue-300">
              ← Back to Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {creating && (
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editing ? 'Edit Newsletter' : 'Create New Newsletter'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newsletter-title" className="block text-gray-300 font-semibold mb-2">Title</label>
                <input
                  id="newsletter-title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  required
                  placeholder="Newsletter title..."
                />
              </div>

              <div>
                <label htmlFor="newsletter-excerpt" className="block text-gray-300 font-semibold mb-2">Excerpt (Preview text)</label>
                <textarea
                  id="newsletter-excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows={2}
                  placeholder="Brief preview that appears in emails..."
                />
              </div>

              <div>
                <label htmlFor="newsletter-content" className="block text-gray-300 font-semibold mb-2">Content</label>
                <textarea
                  id="newsletter-content"
                  name="content"
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm max-h-[40vh] sm:max-h-none"
                  rows={20}
                  required
                  placeholder="Write your newsletter content here..."
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Image (optional)</label>
                {formData.imageUrl ? (
                  <div className="relative h-40">
                    <Image
                      src={formData.imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover rounded border border-gray-600"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized={formData.imageUrl.startsWith('data:')}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 bg-gray-700 border-2 border-dashed rounded-lg cursor-pointer transition ${
                      dragging ? 'border-blue-400 bg-gray-600' : 'border-gray-500 hover:border-blue-500 hover:bg-gray-600'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragging(false)
                      const file = e.dataTransfer.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                    />
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-gray-400 text-sm">
                          {dragging ? 'Drop image here' : 'Click or drag & drop image'}
                        </span>
                        <span className="text-gray-500 text-xs mt-1">JPG, PNG, WebP, GIF up to 10MB</span>
                      </>
                    )}
                  </label>
                )}
              </div>

              <div>
                <label htmlFor="newsletter-status" className="block text-gray-300 font-semibold mb-2">Status</label>
                <select
                  id="newsletter-status"
                  name="status"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save className="w-4 h-4" />
                  {editing ? 'Update Newsletter' : 'Create Newsletter'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Newsletters List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">All Newsletters ({displayNewsletters.length})</h2>
          
          {displayNewsletters.map(newsletter => (
            <div key={newsletter.id} className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{newsletter.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      newsletter.status === 'PUBLISHED' ? 'bg-green-600/20 text-green-400' :
                      'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {newsletter.status}
                    </span>
                    {newsletter.sentAt && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-600/20 text-purple-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Sent to {newsletter.sentCount}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{newsletter.excerpt}</p>
                  <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                    <span>By {newsletter.author?.name || 'Unknown'}</span>
                    {newsletter.sentAt && (
                      <span>• Sent on {new Date(newsletter.sentAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEdit(newsletter)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  {!newsletter.sentAt && (
                    <SendButton sending={sending} onSend={handleSend} id={newsletter.id} />
                  )}
                  <button
                    onClick={() => handleDelete(newsletter.id)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {newsletters.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No newsletters yet. Create your first one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
