'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Upload, Image as ImageIcon, Video, Download, Tag, Search, Filter, Trash2, Eye } from 'lucide-react'
import Image from 'next/image'

interface MediaItem {
  id: string
  filename: string
  type: 'image' | 'video'
  url: string
  tags: string[]
  uploadedBy: string
  uploadedAt: Date
  size: number
  usage: string[]
}

export default function MediaLibrary() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTag, setFilterTag] = useState('all')
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

  const availableTags = ['event', 'recovery', 'donor', 'program', 'facility', 'community', 'celebration']
  const usageOptions = ['website', 'social', 'grants', 'newsletter', 'marketing']

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchMedia()
    }
  }, [status])

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/media')
      if (!response.ok) throw new Error('Failed to fetch media')
      const data = await response.json()
      setMediaItems(data)
    } catch (error) {
      console.error('Error fetching media:', error)
      alert('Failed to load media')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('tags', JSON.stringify([]))
        formData.append('usage', JSON.stringify([]))
        
        const response = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) throw new Error('Upload failed')
      }
      await fetchMedia()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const handleAddTag = async (mediaId: string, tag: string) => {
    try {
      const item = mediaItems.find(i => i.id === mediaId)
      if (!item || item.tags.includes(tag)) return

      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: [...item.tags, tag] })
      })

      if (!response.ok) throw new Error('Failed to update tags')
      await fetchMedia()
    } catch (error) {
      console.error('Error adding tag:', error)
    }
  }

  const handleRemoveTag = async (mediaId: string, tag: string) => {
    try {
      const item = mediaItems.find(i => i.id === mediaId)
      if (!item) return

      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: item.tags.filter(t => t !== tag) })
      })

      if (!response.ok) throw new Error('Failed to update tags')
      await fetchMedia()
    } catch (error) {
      console.error('Error removing tag:', error)
    }
  }

  const handleDownload = async (media: MediaItem) => {
    try {
      const response = await fetch(media.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = media.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file')
    }
  }

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return
    
    try {
      const response = await fetch(`/api/admin/media/${mediaId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Delete failed')
      await fetchMedia()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete media')
    }
  }

  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterTag === 'all' || item.tags.includes(filterTag)
    return matchesSearch && matchesFilter
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <p>Loading media library...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
              <p className="text-gray-600 text-sm">Upload and manage photos and videos for all platforms</p>
            </div>
            <label className="relative cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <button
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-purple to-purple-700 text-white rounded-lg hover:shadow-xl transition font-semibold disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
                {uploading ? 'Uploading...' : 'Upload Media'}
              </button>
            </label>
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by filename or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="all">All Tags</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Media Grid */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Upload Instructions */}
          {filteredMedia.length === 0 && !searchTerm && filterTag === 'all' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6">
                  <Upload className="w-10 h-10 text-brand-purple" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Start Building Your Media Library</h3>
                <p className="text-gray-600 mb-6">
                  Upload photos and videos to use across your website, social media, and grant applications
                </p>
                <div className="bg-purple-50 rounded-lg p-4 text-left space-y-2 text-sm">
                  <p className="font-semibold text-gray-900">✓ Upload photos/videos</p>
                  <p className="font-semibold text-gray-900">✓ Tag content (event, recovery, donor, program)</p>
                  <p className="font-semibold text-gray-900">✓ Downloadable by staff</p>
                  <p className="font-semibold text-gray-900">✓ Use for website, social platforms, grants</p>
                </div>
              </div>
            </div>
          )}

          {/* Media Items Grid */}
          {filteredMedia.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMedia.map((media) => (
                <div
                  key={media.id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition overflow-hidden group"
                >
                  {/* Media Preview */}
                  <div className="relative aspect-video bg-gray-100">
                    {media.type === 'image' ? (
                      <Image
                        src={media.url}
                        alt={media.filename}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Video className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedMedia(media)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                        title="View details"
                      >
                        <Eye className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleDownload(media)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                        title="Download"
                      >
                        <Download className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleDelete(media.id)}
                        className="p-2 bg-white rounded-full hover:bg-red-100 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Media Info */}
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 text-sm truncate mb-2">
                      {media.filename}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {media.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-brand-purple text-xs font-semibold rounded"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(media.id, tag)}
                            className="hover:text-purple-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddTag(media.id, e.target.value)
                            e.target.value = ''
                          }
                        }}
                        className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-600 bg-white"
                      >
                        <option value="">+ Tag</option>
                        {availableTags
                          .filter(tag => !media.tags.includes(tag))
                          .map(tag => (
                            <option key={tag} value={tag}>
                              {tag.charAt(0).toUpperCase() + tag.slice(1)}
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>{(media.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p>Uploaded {new Date(media.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {filteredMedia.length === 0 && (searchTerm || filterTag !== 'all') && (
            <div className="text-center py-12">
              <p className="text-gray-600">No media found matching your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedMedia.filename}</h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Preview */}
              <div className="relative aspect-video bg-gray-100 rounded-lg mb-4">
                {selectedMedia.type === 'image' ? (
                  <Image
                    src={selectedMedia.url}
                    alt={selectedMedia.filename}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <video src={selectedMedia.url} controls className="w-full h-full" />
                )}
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMedia.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-purple-100 text-brand-purple text-sm font-semibold rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Suitable for:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {usageOptions.map(usage => (
                      <label key={usage} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedMedia.usage.includes(usage)}
                          onChange={() => {}}
                          className="rounded text-brand-purple focus:ring-brand-purple"
                        />
                        {usage.charAt(0).toUpperCase() + usage.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleDownload(selectedMedia)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-800 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedMedia.id)
                      setSelectedMedia(null)
                    }}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
