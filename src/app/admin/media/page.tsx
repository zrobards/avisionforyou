'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePolling } from '@/hooks/usePolling'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Upload, Image as ImageIcon, Video, Download, Tag, Search, Filter, Trash2, Eye } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/components/ui/toast'

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
  const { showToast } = useToast()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTag, setFilterTag] = useState('all')
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploadTags, setUploadTags] = useState<string[]>([])
  const [uploadUsage, setUploadUsage] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>('all')

  const availableTags = ['event', 'recovery', 'donor', 'program', 'facility', 'community', 'celebration']
  const usageOptions = ['website', 'facebook', 'instagram', 'twitter', 'grants', 'newsletter', 'marketing']
  
  const tabs = [
    { id: 'all', label: 'All Media', icon: '📁' },
    { id: 'facebook', label: 'Facebook', icon: '📘' },
    { id: 'instagram', label: 'Instagram', icon: '📷' },
    { id: 'twitter', label: 'Twitter', icon: '🐦' },
    { id: 'website', label: 'Website', icon: '🌐' },
    { id: 'grants', label: 'Grants', icon: '💰' },
    { id: 'newsletter', label: 'Newsletter', icon: '📧' }
  ]

  const fetchMedia = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/media', { cache: 'no-store' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch media')
      }
      const data = await response.json()
      const items = Array.isArray(data) ? data : (data.data || data.items || [])
      setMediaItems(items)
    } catch (error: any) {
      if (loading) {
        showToast(error.message || 'Failed to load media', 'error')
      }
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, showToast])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchMedia()
    }
  }, [status, router, fetchMedia])

  usePolling(fetchMedia, 30000, status === 'authenticated')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setPendingFiles(Array.from(files))
    setUploadTags([])
    setUploadUsage([])
    setShowUploadModal(true)
    event.target.value = '' // Reset input
  }

  const handleConfirmUpload = async () => {
    if (pendingFiles.length === 0) return

    setUploading(true)
    try {
      for (const file of pendingFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('tags', JSON.stringify(uploadTags))
        formData.append('usage', JSON.stringify(uploadUsage))
        
        const response = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }
      }
      showToast(`Successfully uploaded ${pendingFiles.length} file(s)`, 'success')
      await fetchMedia()
      setShowUploadModal(false)
      setPendingFiles([])
      setUploadTags([])
      setUploadUsage([])
    } catch (error: any) {
      showToast(error.message || 'Failed to upload files', 'error')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const toggleUploadTag = (tag: string) => {
    setUploadTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const toggleUploadUsage = (usage: string) => {
    setUploadUsage(prev => 
      prev.includes(usage) ? prev.filter(u => u !== usage) : [...prev, usage]
    )
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

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update tags')
      }
      showToast('Tag added successfully', 'success')
      await fetchMedia()
    } catch (error: any) {
      showToast(error.message || 'Failed to add tag', 'error')
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

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update tags')
      }
      showToast('Tag removed successfully', 'success')
      await fetchMedia()
    } catch (error: any) {
      showToast(error.message || 'Failed to remove tag', 'error')
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
      showToast('Download started', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to download file', 'error')
      console.error('Download error:', error)
    }
  }

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return
    
    try {
      const response = await fetch(`/api/admin/media/${mediaId}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Delete failed')
      }
      showToast('Media deleted successfully', 'success')
      await fetchMedia()
    } catch (error: any) {
      showToast(error.message || 'Failed to delete media', 'error')
      console.error('Delete error:', error)
    }
  }

  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterTag === 'all' || item.tags.includes(filterTag)
    const matchesTab = activeTab === 'all' || item.usage.includes(activeTab)
    return matchesSearch && matchesFilter && matchesTab
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
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
              <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-purple to-purple-700 text-white rounded-lg hover:shadow-xl transition font-semibold">
                <Upload className="w-5 h-5" />
                Upload Media
              </div>
            </label>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const count = tab.id === 'all' 
                ? mediaItems.length 
                : mediaItems.filter(item => item.usage.includes(tab.id)).length
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-brand-purple text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-white/20'
                      : 'bg-gray-200'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <label htmlFor="media-search" className="sr-only">Search media</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="media-search"
                name="mediaSearch"
                type="text"
                placeholder="Search by filename or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                aria-label="Search media"
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
            className="bg-white rounded-lg max-w-[calc(100vw-2rem)] sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-[calc(100vw-2rem)] sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Media Files</h2>
              
              {/* Files to upload */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Selected Files ({pendingFiles.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {pendingFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                      {file.type.startsWith('image/') ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Tag className="w-4 h-4" />
                  Tags (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleUploadTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        uploadTags.includes(tag)
                          ? 'bg-brand-purple text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Usage */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Where will this be used? (select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {usageOptions.map(usage => (
                    <label key={usage} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={uploadUsage.includes(usage)}
                        onChange={() => toggleUploadUsage(usage)}
                        className="rounded text-brand-purple focus:ring-brand-purple"
                      />
                      {usage.charAt(0).toUpperCase() + usage.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setPendingFiles([])
                    setUploadTags([])
                    setUploadUsage([])
                  }}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-purple to-purple-700 text-white rounded-lg hover:shadow-xl transition font-semibold disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
