'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Send, Facebook, Instagram, Twitter, Youtube, Loader } from 'lucide-react'

interface SocialPost {
  id: string
  description: string
  platforms: ('facebook' | 'instagram' | 'twitter' | 'youtube')[]
  videoFile?: File
  scheduledFor?: string
  status: 'draft' | 'scheduled' | 'posted'
  createdAt: string
}

export default function AdminSocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Form state
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<('facebook' | 'instagram' | 'twitter' | 'youtube')[]>([])
  const [scheduledFor, setScheduledFor] = useState('')

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-black' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600' },
  ] as const

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0])
    }
  }

  const togglePlatform = (platformId: 'facebook' | 'instagram' | 'twitter' | 'youtube') => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description.trim()) {
      alert('Please enter a description')
      return
    }

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform')
      return
    }

    setUploading(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      if (videoFile) {
        formData.append('file', videoFile)
      }
      formData.append('description', description)
      formData.append('platforms', JSON.stringify(selectedPlatforms))
      formData.append('scheduledFor', scheduledFor || '')

      const response = await fetch('/api/admin/social', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newPost = await response.json()
        setPosts(prev => [newPost, ...prev])
        
        // Reset form
        setDescription('')
        setVideoFile(null)
        setSelectedPlatforms([])
        setScheduledFor('')
        
        alert('Post created successfully!')
      } else {
        alert('Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('An error occurred')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Management</h1>
        <p className="text-gray-600">Upload videos and manage posts across all platforms from one place</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Video Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Video File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-purple transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="video-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="video-upload" className="cursor-pointer block">
                    {videoFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <Upload className="h-6 w-6 text-green-500" />
                        <span className="text-green-600 font-medium">{videoFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-gray-600">Drag and drop or click to upload video</span>
                        <span className="text-xs text-gray-500">MP4, WebM, or other video formats</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Post Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write your post description here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent resize-none"
                  rows={5}
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length} characters
                </p>
              </div>

              {/* Platforms Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Platforms</label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map(({ id, name, icon: Icon, color }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => togglePlatform(id)}
                      disabled={uploading}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                        selectedPlatforms.includes(id)
                          ? 'border-brand-purple bg-purple-50 text-brand-purple'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${color}`} />
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Schedule Post (Optional)</label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to post immediately</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={uploading}
                className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Creating Post...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Create & Post
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Recent Posts */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
            
            {posts.length === 0 ? (
              <p className="text-gray-500 text-sm">No posts yet. Create your first one!</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {posts.map(post => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-900 line-clamp-2 mb-2">{post.description}</p>
                    <div className="flex gap-1 flex-wrap">
                      {post.platforms.map(platform => {
                        const p = platforms.find(pl => pl.id === platform)
                        return p ? (
                          <span key={platform} className={`text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded`}>
                            {p.name}
                          </span>
                        ) : null
                      })}
                    </div>
                    <span className={`inline-block text-xs mt-2 px-2 py-1 rounded ${
                      post.status === 'posted' ? 'bg-green-100 text-green-700' :
                      post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
