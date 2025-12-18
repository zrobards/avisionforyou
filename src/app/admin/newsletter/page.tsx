'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Save, Send, Mail } from 'lucide-react'
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

export default function AdminNewsletter() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED'
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchNewsletters()
    }
  }, [status])

  const fetchNewsletters = async () => {
    try {
      const response = await fetch('/api/admin/newsletter')
      if (response.ok) {
        const data = await response.json()
        setNewsletters(data)
      } else {
        const error = await response.json()
        showToast(error.error || 'Failed to fetch newsletters', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch newsletters', 'error')
      console.error('Failed to fetch newsletters:', error)
    } finally {
      setLoading(false)
    }
  }

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
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editing ? 'Edit Newsletter' : 'Create New Newsletter'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  required
                  placeholder="Newsletter title..."
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Excerpt (Preview text)</label>
                <textarea
                  value={formData.excerpt}
                  onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows={2}
                  placeholder="Brief preview that appears in emails..."
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
                  rows={20}
                  required
                  placeholder="Write your newsletter content here..."
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Image URL (optional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Status</label>
                <select
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
          <h2 className="text-2xl font-bold text-white mb-6">All Newsletters ({newsletters.length})</h2>
          
          {newsletters.map(newsletter => (
            <div key={newsletter.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
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
                    <span>By {newsletter.author.name}</span>
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
                    <button
                      onClick={() => handleSend(newsletter.id)}
                      disabled={sending === newsletter.id}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {sending === newsletter.id ? 'Sending...' : 'Send'}
                    </button>
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
