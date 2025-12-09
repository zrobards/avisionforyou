'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/shared/ToastProvider'
import { Calendar, Edit2, Trash2, Users, Clock } from 'lucide-react'

interface Meeting {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  format: string
  location: string | null
  link: string | null
  rsvpCount: number
}

export default function AdminMeetingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    format: 'ONLINE',
    location: '',
    link: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role
      if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
        showToast('Admin or Staff access required', 'error')
        router.push('/dashboard')
        return
      }
      fetchMeetings()
    }
  }, [status])

  const fetchMeetings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/meetings')
      if (!response.ok) throw new Error('Failed to fetch meetings')
      const data = await response.json()
      setMeetings(data.meetings || [])
    } catch (error) {
      showToast('Failed to load meetings', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting)
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      startTime: new Date(meeting.startDate).toISOString().slice(0, 16),
      endTime: new Date(meeting.endDate).toISOString().slice(0, 16),
      format: meeting.format,
      location: meeting.location || '',
      link: meeting.link || ''
    })
  }

  const cancelEdit = () => {
    setEditingMeeting(null)
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      format: 'ONLINE',
      location: '',
      link: ''
    })
  }

  const updateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMeeting) return

    try {
      const response = await fetch(`/api/meetings/${editingMeeting.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to update meeting')

      showToast('Meeting updated successfully', 'success')
      cancelEdit()
      fetchMeetings()
    } catch (error) {
      showToast('Failed to update meeting', 'error')
      console.error(error)
    }
  }

  const deleteMeeting = async (meetingId: string, meetingTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${meetingTitle}"? This will also delete all RSVPs.`)) {
      return
    }

    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete meeting')

      showToast('Meeting deleted successfully', 'success')
      fetchMeetings()
    } catch (error) {
      showToast('Failed to delete meeting', 'error')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Meeting Management</h1>
            <p className="text-gray-600">Edit or cancel meetings</p>
          </div>
        </div>

        {editingMeeting && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold mb-4">Edit Meeting</h2>
            <form onSubmit={updateMeeting} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ONLINE">Online</option>
                  <option value="IN_PERSON">In Person</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              {(formData.format === 'IN_PERSON' || formData.format === 'HYBRID') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Physical address"
                  />
                </div>
              )}

              {(formData.format === 'ONLINE' || formData.format === 'HYBRID') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://zoom.us/..."
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{meeting.title}</h3>
                  {meeting.description && (
                    <p className="text-gray-600 mb-3">{meeting.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(meeting.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(meeting.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {meeting.rsvpCount} RSVPs
                    </div>
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                      {meeting.format}
                    </div>
                  </div>

                  {meeting.location && (
                    <p className="text-sm text-gray-500 mt-2">📍 {meeting.location}</p>
                  )}
                  {meeting.link && (
                    <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 block">
                      🔗 Join online
                    </a>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(meeting)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit meeting"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteMeeting(meeting.id, meeting.title)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete meeting"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {meetings.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
              No meetings found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
