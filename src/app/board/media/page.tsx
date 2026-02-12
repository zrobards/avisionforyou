'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Upload, Download, Image as ImageIcon, FileText, X } from 'lucide-react'

interface MediaItem {
  id: string
  filename: string
  type: string
  url: string
  size: number
  mimeType: string
  tags: string[]
  usage: string[]
  uploadedAt: string
  uploadedBy: {
    name: string | null
    email: string
  }
}

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'event', label: 'Photos' },
  { value: 'grant', label: 'Documents' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'donor', label: 'Logos' },
  { value: 'program', label: 'Events' },
]

export default function MediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTags, setUploadTags] = useState('')
  const [uploadUsage, setUploadUsage] = useState('')

  useEffect(() => {
    fetchMedia()
  }, [selectedCategory])

  async function fetchMedia() {
    try {
      const url = selectedCategory === 'all'
        ? '/api/board/media'
        : `/api/board/media?category=${selectedCategory}`

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setMediaItems(data)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('tags', uploadTags)
      formData.append('usage', uploadUsage)

      const res = await fetch('/api/board/media', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setUploadFile(null)
        setUploadTags('')
        setUploadUsage('')
        fetchMedia()
      }
    } catch (error) {
      console.error('Error uploading media:', error)
    } finally {
      setUploading(false)
    }
  }

  function handleDownload(item: MediaItem) {
    const link = document.createElement('a')
    link.href = item.url
    link.download = item.filename
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-600 mt-2">
          Manage photos, documents, and marketing materials
        </p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Media</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File
            </label>
            <input
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {uploadFile && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <span>{uploadFile.name}</span>
                <button
                  type="button"
                  onClick={() => setUploadFile(null)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="event, recovery, donor"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage (comma-separated)
              </label>
              <input
                type="text"
                value={uploadUsage}
                onChange={(e) => setUploadUsage(e.target.value)}
                placeholder="website, social, grants"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!uploadFile || uploading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedCategory === cat.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {mediaItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No media items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {mediaItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt={item.filename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate text-sm">
                  {item.filename}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  By {item.uploadedBy.name || item.uploadedBy.email}
                </p>
                {item.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {item.tags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => handleDownload(item)}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 mt-3"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
