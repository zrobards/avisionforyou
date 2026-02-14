'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePolling } from '@/hooks/usePolling'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/shared/ToastProvider'
import { Search, Plus, Filter, X, Calendar, Users, Clock, MapPin, Edit2, Trash2, ChevronDown } from 'lucide-react'

interface RSVP {
  id: string
  user: {
    id: string
    name: string | null
    email: string
  }
  status: string
}

interface Meeting {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  format: string
  location: string | null
  link: string | null
  _count?: { rsvps: number }
  rsvps?: RSVP[]
}

export default function AdminMeetingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFormat, setFilterFormat] = useState<string>('ALL')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedRsvps, setExpandedRsvps] = useState<string | null>(null)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    format: 'ONLINE',
    location: '',
    link: ''
  })

  const fetchMeetings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/meetings', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch meetings')
      const data = await response.json()
      // Handle potential nested successResponse shapes
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.data?.data)
            ? data.data.data
            : (Array.isArray(data?.meetings) ? data.meetings : [])
      setMeetings(items)
    } catch (err) {
      console.error(err)
      if (loading) {
        showToast('error', 'Failed to load meetings')
      }
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
      const userRole = (session?.user as any)?.role
      if (userRole !== 'ADMIN') {
        showToast('error', 'Admin access required')
        router.push('/dashboard')
        return
      }
      fetchMeetings()
    }
  }, [status, router, showToast, fetchMeetings, session])

  usePolling(fetchMeetings, 30000, status === 'authenticated')

  // Filter meetings when search or filter changes
  useEffect(() => {
    let result = meetings

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(m =>
        m.title.toLowerCase().includes(term) ||
        m.description?.toLowerCase().includes(term) ||
        m.location?.toLowerCase().includes(term)
      )
    }

    // Apply format filter
    if (filterFormat !== 'ALL') {
      result = result.filter(m => m.format === filterFormat)
    }

    setFilteredMeetings(result)
  }, [meetings, searchTerm, filterFormat])

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess(false)

    if (!formData.title || !formData.startTime) {
      setCreateError('Title and start time are required')
      return
    }

    try {
      const method = editingId ? 'PATCH' : 'POST'
      const url = editingId ? `/api/admin/meetings/${editingId}` : '/api/admin/meetings'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startTime: formData.startTime,
          endTime: formData.endTime,
          format: formData.format,
          location: formData.location,
          link: formData.link
        })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || `Failed to ${editingId ? 'update' : 'create'} meeting`)
      }

      setCreateSuccess(true)
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        format: 'ONLINE',
        location: '',
        link: ''
      })
      setEditingId(null)
      await fetchMeetings()
      setShowCreateForm(false)

      setTimeout(() => setCreateSuccess(false), 3000)
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Network error')
    }
  }

  const handleEditMeeting = (meeting: Meeting) => {
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      startTime: meeting.startDate,
      endTime: meeting.endDate || '',
      format: meeting.format as 'ONLINE' | 'IN_PERSON',
      location: meeting.location || '',
      link: meeting.link || ''
    })
    setEditingId(meeting.id)
    setShowCreateForm(true)
  }

  const handleDeleteMeeting = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/meetings/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete meeting')
      }

      showToast('success', 'Meeting deleted successfully')
      await fetchMeetings()
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete meeting')
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading meetings...</div>
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center animate-slide-down">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meetings Management</h1>
            <p className="text-gray-600 text-sm">Create, search, and manage meetings</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-smooth hover-scale font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Meeting
          </button>
        </div>

        {/* Create Meeting Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 animate-slide-down">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Create New Meeting</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-500 hover:text-gray-700 transition-smooth">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm animate-slide-down">
                ✓ Meeting created successfully!
              </div>
            )}

            {createError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm animate-slide-down">
                ✗ {createError}
              </div>
            )}

            <form onSubmit={handleSaveMeeting} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                    placeholder="Meeting title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Format *</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                  >
                    <option value="ONLINE">Online</option>
                    <option value="IN_PERSON">In-Person</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                  placeholder="Meeting description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date/Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Date/Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                  />
                </div>
              </div>

              {formData.format !== 'IN_PERSON' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Meeting Link</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                    placeholder="https://zoom.us/..."
                  />
                </div>
              )}

              {formData.format !== 'ONLINE' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                    placeholder="Meeting location"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-smooth hover-scale font-medium"
                >
                  {editingId ? 'Update Meeting' : 'Create Meeting'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingId(null)
                    setFormData({
                      title: '',
                      description: '',
                      startTime: '',
                      endTime: '',
                      format: 'ONLINE',
                      location: '',
                      link: ''
                    })
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-smooth hover-scale font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4 animate-slide-up">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 w-full sm:min-w-64">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, description, location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                />
              </div>
            </div>
            <div className="min-w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Format Filter</label>
              <select
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="ALL">All Formats</option>
                <option value="ONLINE">Online</option>
                <option value="IN_PERSON">In-Person</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>

          {(searchTerm || filterFormat !== 'ALL') && (
            <div className="flex items-center gap-2 text-sm text-gray-600 animate-fade-in">
              <Filter className="w-4 h-4" />
              Showing {filteredMeetings.length} of {meetings.length} meetings
            </div>
          )}
        </div>

        {/* Meetings List */}
        <div className="space-y-3 animate-stagger">
          {filteredMeetings.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center animate-fade-in">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No meetings found</p>
            </div>
          ) : (
            filteredMeetings.map((meeting, index) => (
              <div key={meeting.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-smooth animate-fade-in" style={{animationDelay: `${index * 50}ms`}}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{meeting.title}</h3>
                    {meeting.description && (
                      <p className="text-gray-600 text-sm mt-1">{meeting.description}</p>
                    )}
                    
                    <div className="flex gap-4 mt-3 flex-wrap text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(meeting.startDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(meeting.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {meeting.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {meeting.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1 cursor-pointer hover:text-brand-purple" onClick={() => setExpandedRsvps(expandedRsvps === meeting.id ? null : meeting.id)}>
                        <Users className="w-4 h-4" />
                        {meeting.rsvps?.length || 0} RSVPs
                      </span>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        {meeting.format}
                      </span>
                    </div>

                    {/* Expanded RSVP List */}
                      {expandedRsvps === meeting.id && (Array.isArray(meeting.rsvps) ? meeting.rsvps : []).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 animate-slide-down">
                        <h4 className="font-semibold text-gray-700 text-sm">RSVPs:</h4>
                        <ul className="space-y-1">
                            {(Array.isArray(meeting.rsvps) ? meeting.rsvps : []).map((rsvp) => (
                            <li key={rsvp.id} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                              <span className="font-medium">{rsvp.user.name || 'Unknown'}</span>
                              <span className="text-gray-500">({rsvp.user.email})</span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{rsvp.status}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditMeeting(meeting)}
                      className="p-2 text-gray-600 hover:text-brand-purple hover:bg-brand-purple/10 rounded-lg transition-smooth"
                      title="Edit meeting"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-smooth"
                      title="Delete meeting"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <p className="text-sm text-gray-500 text-center">
          Total: {meetings.length} meetings
        </p>
      </div>
    </div>
  )
}
