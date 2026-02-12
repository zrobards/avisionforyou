'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePolling } from '@/hooks/usePolling'
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react'

interface BoardUpdate {
  id: string
  title: string
  content: string
  category: string
  priority: boolean
  createdAt: string
  author: {
    name: string | null
  }
}

const CATEGORIES = [
  { value: 'EXECUTIVE_DIRECTIVE', label: 'Executive Directive' },
  { value: 'BOARD_UPDATE', label: 'Board Update' },
  { value: 'FINANCIAL_SUMMARY', label: 'Financial Summary' },
  { value: 'GOVERNANCE', label: 'Governance' },
]

export default function AdminBoardUpdatesPage() {
  const [updates, setUpdates] = useState<BoardUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUpdate, setEditingUpdate] = useState<BoardUpdate | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'BOARD_UPDATE',
    priority: false,
  })
  const [saving, setSaving] = useState(false)

  const fetchUpdates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/board/updates')
      if (res.ok) {
        const data = await res.json()
        setUpdates(data)
      }
    } catch (error) {
      console.error('Error fetching updates:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUpdates()
  }, [fetchUpdates])

  usePolling(fetchUpdates, 30000)

  function openCreateModal() {
    setEditingUpdate(null)
    setFormData({
      title: '',
      content: '',
      category: 'BOARD_UPDATE',
      priority: false,
    })
    setShowModal(true)
  }

  function openEditModal(update: BoardUpdate) {
    setEditingUpdate(update)
    setFormData({
      title: update.title,
      content: update.content,
      category: update.category,
      priority: update.priority,
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingUpdate
        ? `/api/admin/board/updates/${editingUpdate.id}`
        : '/api/admin/board/updates'
      
      const method = editingUpdate ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowModal(false)
        fetchUpdates()
      } else {
        alert('Failed to save update')
      }
    } catch (error) {
      console.error('Error saving update:', error)
      alert('Error saving update')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this update?')) return

    try {
      const res = await fetch(`/api/admin/board/updates/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchUpdates()
      } else {
        alert('Failed to delete update')
      }
    } catch (error) {
      console.error('Error deleting update:', error)
      alert('Error deleting update')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Board Updates</h1>
            <p className="text-gray-600 mt-2">Manage board communications and announcements</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Update
          </button>
        </div>

        {/* Updates Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {updates.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No updates yet. Create your first board update.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {updates.map(update => (
                    <tr key={update.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{update.title}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {update.content}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {update.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {update.priority && (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded font-medium w-fit">
                            <AlertCircle className="w-3 h-3" />
                            High Priority
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(update.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(update)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(update.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUpdate ? 'Edit Update' : 'Create Board Update'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {formData.category === 'EXECUTIVE_DIRECTIVE' && (
                  <p className="mt-2 text-sm text-amber-600 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Important:</strong> Executive Directives must be posted within 24 hours of issuance.
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  id="content"
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="priority"
                  type="checkbox"
                  checked={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="priority" className="text-sm font-medium text-gray-700">
                  Mark as high priority
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingUpdate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
