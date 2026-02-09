'use client'

import { useEffect, useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Share2, Facebook, Linkedin, Mail, Copy, Check } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  slug: string
  description: string
  goalAmount: number
  raisedAmount: number
  donorCount: number
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  endDate: string
  targetAudience: string | null
  createdAt: string
  createdBy: {
    name: string | null
    email: string
  }
  _count?: {
    notes: number
  }
  notes?: Array<{
    id: string
    content: string
    createdAt: string
    author: {
      name: string | null
      email: string
    }
  }>
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [newNote, setNewNote] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goalAmount: '',
    startDate: '',
    endDate: '',
    targetAudience: '',
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/board/campaigns')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data)
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCampaignDetails(id: string) {
    try {
      const res = await fetch(`/api/board/campaigns/${id}`)
      if (res.ok) {
        const data = await res.json()
        setCampaigns(prev => prev.map(c => c.id === id ? data : c))
      }
    } catch (error) {
      console.error('Error fetching campaign details:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/board/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({
          name: '',
          description: '',
          goalAmount: '',
          startDate: '',
          endDate: '',
          targetAudience: '',
        })
        setShowForm(false)
        fetchCampaigns()
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddNote(campaignId: string) {
    const content = newNote[campaignId]
    if (!content?.trim()) return

    try {
      const res = await fetch(`/api/board/campaigns/${campaignId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        setNewNote(prev => ({ ...prev, [campaignId]: '' }))
        fetchCampaignDetails(campaignId)
      }
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  function handleExpandToggle(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      const campaign = campaigns.find(c => c.id === id)
      if (campaign && !campaign.notes) {
        fetchCampaignDetails(id)
      }
    }
  }

  function getDaysRemaining(endDate: string) {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  function shareVia(platform: string, campaign: Campaign) {
    const url = `${window.location.origin}/donate?campaign=${campaign.slug}`
    const text = `Support ${campaign.name} - ${campaign.description}`

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url)
        setCopiedLink(campaign.id)
        setTimeout(() => setCopiedLink(null), 2000)
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(campaign.name)}&body=${encodeURIComponent(text + '\n\n' + url)}`
        break
    }
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Campaign Hub</h1>
          <p className="text-gray-600 mt-2">
            Manage fundraising campaigns and track progress
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Campaign</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Amount ($) *
                </label>
                <input
                  type="number"
                  value={formData.goalAmount}
                  onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="e.g., Major donors, Alumni"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Campaign'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No campaigns yet. Create your first campaign!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map(campaign => {
            const progress = campaign.goalAmount > 0
              ? (campaign.raisedAmount / campaign.goalAmount) * 100
              : 0
            const daysRemaining = getDaysRemaining(campaign.endDate)
            const isExpanded = expandedId === campaign.id

            return (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">{campaign.name}</h2>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_CONFIG[campaign.status].color}`}>
                          {STATUS_CONFIG[campaign.status].label}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{campaign.description}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        ${campaign.raisedAmount.toLocaleString()} of ${campaign.goalAmount.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <span>{campaign.donorCount} donors</span>
                    <span>•</span>
                    <span>{daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Ended'}</span>
                    {campaign.targetAudience && (
                      <>
                        <span>•</span>
                        <span>Target: {campaign.targetAudience}</span>
                      </>
                    )}
                  </div>

                  {/* Social Share Buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => shareVia('copy', campaign)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      {copiedLink === campaign.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Link
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => shareVia('facebook', campaign)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </button>
                    <button
                      onClick={() => shareVia('twitter', campaign)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-sky-100 text-sky-700 rounded hover:bg-sky-200"
                    >
                      <Share2 className="w-4 h-4" />
                      Twitter/X
                    </button>
                    <button
                      onClick={() => shareVia('linkedin', campaign)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </button>
                    <button
                      onClick={() => shareVia('email', campaign)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                  </div>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => handleExpandToggle(campaign.id)}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide Notes
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show Notes {campaign._count?.notes ? `(${campaign._count.notes})` : ''}
                      </>
                    )}
                  </button>

                  {/* Expanded Content - Notes */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Notes & Comments</h3>

                      {/* Add Note Form */}
                      <div className="mb-4">
                        <textarea
                          value={newNote[campaign.id] || ''}
                          onChange={(e) => setNewNote({ ...newNote, [campaign.id]: e.target.value })}
                          placeholder="Add a note or comment..."
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                        <button
                          onClick={() => handleAddNote(campaign.id)}
                          disabled={!newNote[campaign.id]?.trim()}
                          className="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Note
                        </button>
                      </div>

                      {/* Notes List */}
                      {campaign.notes && campaign.notes.length > 0 ? (
                        <div className="space-y-3">
                          {campaign.notes.map(note => (
                            <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">{note.content}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span>{note.author.name || note.author.email}</span>
                                <span>•</span>
                                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No notes yet</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
