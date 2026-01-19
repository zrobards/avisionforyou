'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface BoardUpdate {
  id: string
  title: string
  content: string
  category: string
  priority: boolean
  createdAt: string
  author: {
    name: string | null
    email: string
  }
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'EXECUTIVE_DIRECTIVE', label: 'Executive Directive' },
  { value: 'BOARD_UPDATE', label: 'Board Update' },
  { value: 'FINANCIAL_SUMMARY', label: 'Financial Summary' },
  { value: 'GOVERNANCE', label: 'Governance' },
]

export default function BoardUpdatesPage() {
  const [updates, setUpdates] = useState<BoardUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUpdates() {
      try {
        const url = selectedCategory 
          ? `/api/board/updates?category=${selectedCategory}`
          : '/api/board/updates'
        
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setUpdates(data)
        }
      } catch (error) {
        console.error('Error fetching updates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpdates()
  }, [selectedCategory])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Board Updates</h1>
        <p className="text-gray-600 mt-2">
          Stay informed with the latest board communications and announcements
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Updates List */}
      {updates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No updates found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map(update => (
            <div 
              key={update.id} 
              className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                update.priority 
                  ? 'border-amber-400 bg-amber-50/30' 
                  : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">{update.title}</h2>
                      {update.priority && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-500 text-white rounded font-medium">
                          <AlertCircle className="w-3 h-3" />
                          High Priority
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                        {update.category.replace(/_/g, ' ')}
                      </span>
                      <span>
                        {new Date(update.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span>By {update.author.name || update.author.email}</span>
                    </div>
                  </div>
                </div>

                <div className={`text-gray-700 ${expandedId === update.id ? '' : 'line-clamp-3'}`}>
                  {update.content}
                </div>

                {update.content.length > 200 && (
                  <button
                    onClick={() => setExpandedId(expandedId === update.id ? null : update.id)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-3"
                  >
                    {expandedId === update.id ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
