'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, EyeOff, Save } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  category?: string
  tags?: string
  imageUrl?: string
  readTimeMinutes?: number
  views: number
  publishedAt?: string
  author: {
    name: string
    email: string
  }
}

export default function AdminBlog() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [currentSlug, setCurrentSlug] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Recovery',
    tags: '',
    imageUrl: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchPosts()
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchPosts, 30000)
      return () => clearInterval(interval)
    }
  }, [status])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog?drafts=true', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
    
    try {
      if (editing) {
        // Use currentSlug instead of looking up the post
        if (!currentSlug) {
          showToast('Error: Post slug not found', 'error')
          return
        }
        
        const response = await fetch(`/api/blog/${currentSlug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, tags })
        })

        if (response.ok) {
          const updated = await response.json()
          // Update currentSlug in case title changed
          setCurrentSlug(updated.slug)
          showToast('Blog post updated successfully', 'success')
          setEditing(null)
          resetForm()
          fetchPosts()
        } else {
          const error = await response.json()
          showToast(error.error || 'Failed to update post', 'error')
        }
      } else {
        const response = await fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, tags })
        })

        if (response.ok) {
          showToast('Blog post created successfully', 'success')
          setCreating(false)
          resetForm()
          fetchPosts()
        } else {
          const error = await response.json()
          showToast(error.error || 'Failed to create post', 'error')
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save post', 'error')
      console.error('Failed to save post:', error)
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditing(post.id)
    setCurrentSlug(post.slug)
    setCreating(true)
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      category: post.category || 'Recovery',
      tags: post.tags ? JSON.parse(post.tags).join(', ') : '',
      imageUrl: post.imageUrl || '',
      status: post.status
    })
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showToast('Blog post deleted successfully', 'success')
        fetchPosts()
      } else {
        const error = await response.json()
        showToast(error.error || 'Failed to delete post', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to delete post', 'error')
      console.error('Failed to delete post:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: 'Recovery',
      tags: '',
      imageUrl: '',
      status: 'DRAFT'
    })
    setEditing(null)
    setCurrentSlug(null)
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
            <h1 className="text-3xl font-bold">Blog Management</h1>
            <p className="text-gray-400">Create and manage blog posts</p>
          </div>
          <div className="flex gap-3">
            {!creating && (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                New Post
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
              {editing ? 'Edit Post' : 'Create New Post'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="Recovery">Recovery</option>
                    <option value="Community">Community</option>
                    <option value="Education">Education</option>
                    <option value="Stories">Stories</option>
                    <option value="Ethics">Ethics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Excerpt (optional)</label>
                <textarea
                  value={formData.excerpt}
                  onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows={2}
                  placeholder="Brief summary..."
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
                  rows={15}
                  required
                  placeholder="Write your blog post content here..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                  <label className="block text-gray-300 font-semibold mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    placeholder="recovery, support, community"
                  />
                </div>
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
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save className="w-4 h-4" />
                  {editing ? 'Update Post' : 'Create Post'}
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

        {/* Posts List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">All Posts ({posts.length})</h2>
          
          {posts.map(post => (
            <div key={post.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{post.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.status === 'PUBLISHED' ? 'bg-green-600/20 text-green-400' :
                      post.status === 'DRAFT' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                    <span>By {post.author.name}</span>
                    <span>• {post.category}</span>
                    <span>• {post.readTimeMinutes} min read</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views} views
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.slug)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
