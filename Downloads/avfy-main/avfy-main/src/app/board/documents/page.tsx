'use client'

import { useEffect, useState } from 'react'
import { Download, FileText, Search } from 'lucide-react'

interface BoardDocument {
  id: string
  title: string
  description: string | null
  fileUrl: string
  fileName: string
  fileSize: number | null
  category: string
  uploadedAt: string
  uploadedBy: {
    name: string | null
  }
}

const CATEGORIES = [
  { value: '', label: 'All Documents' },
  { value: 'EXECUTIVE_DIRECTIVE', label: 'Executive Directives' },
  { value: 'BOARD_UPDATE', label: 'Board Updates' },
  { value: 'FINANCIAL_SUMMARY', label: 'Financial Summaries' },
  { value: 'GOVERNANCE', label: 'Governance/Policies' },
]

export default function BoardDocumentsPage() {
  const [documents, setDocuments] = useState<BoardDocument[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<BoardDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const url = selectedCategory 
          ? `/api/board/documents?category=${selectedCategory}`
          : '/api/board/documents'
        
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setDocuments(data)
          setFilteredDocuments(data)
        }
      } catch (error) {
        console.error('Error fetching documents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [selectedCategory])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDocuments(documents)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = documents.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.fileName.toLowerCase().includes(query)
      )
      setFilteredDocuments(filtered)
    }
  }, [searchQuery, documents])

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    const mb = bytes / (1024 * 1024)
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${mb.toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Board Documents</h1>
        <p className="text-gray-600 mt-2">
          Access and download board documents and resources
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Tabs */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="search"
                type="text"
                placeholder="Search by title or filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'No documents match your search' : 'No documents found'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocuments.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{doc.title}</div>
                        {doc.description && (
                          <div className="text-sm text-gray-500 mt-1">{doc.description}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">{doc.fileName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                        {doc.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>
                        {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-gray-400">
                        by {doc.uploadedBy.name || 'Admin'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={doc.fileUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
