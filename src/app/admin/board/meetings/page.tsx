'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Plus, MapPin, Clock, Users, FileText } from 'lucide-react';
import Link from 'next/link';

interface BoardMeeting {
  id: string;
  title: string;
  description: string | null;
  type: string;
  scheduledDate: string;
  location: string | null;
  agenda: string | null;
  minutesUrl: string | null;
  attendees: string[];
  status: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function BoardMeetingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState<BoardMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchMeetings();
    }
  }, [session]);

  async function fetchMeetings() {
    try {
      const response = await fetch('/api/admin/board/meetings');
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      REGULAR: 'Regular Meeting',
      SPECIAL: 'Special Meeting',
      EMERGENCY: 'Emergency Meeting',
      COMMITTEE: 'Committee Meeting',
    };
    return types[type] || type;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const upcomingMeetings = meetings.filter(
    (m) => new Date(m.scheduledDate) >= new Date() && m.status !== 'cancelled'
  );
  const pastMeetings = meetings.filter(
    (m) => new Date(m.scheduledDate) < new Date() || m.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/admin/board" className="text-gray-500 hover:text-gray-700">
                  ← Back to Board Portal
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-indigo-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Board Meetings</h1>
                  <p className="text-gray-600">Schedule and manage board meetings</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Schedule Meeting
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Upcoming Meetings */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Meetings</h2>
          {upcomingMeetings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No upcoming meetings scheduled</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{meeting.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(meeting.status)}`}>
                      {meeting.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(meeting.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(meeting.scheduledDate)}</span>
                    </div>
                    {meeting.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{getTypeLabel(meeting.type)}</span>
                    </div>
                  </div>

                  {meeting.description && (
                    <p className="text-gray-600 mb-4">{meeting.description}</p>
                  )}

                  {meeting.attendees.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{meeting.attendees.length} attendees</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Meetings */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Meetings</h2>
          {pastMeetings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No past meetings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastMeetings.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{meeting.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(meeting.status)}`}>
                          {meeting.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">{getTypeLabel(meeting.type)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatDate(meeting.scheduledDate)}</span>
                        {meeting.location && (
                          <>
                            <span>•</span>
                            <span>{meeting.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {meeting.minutesUrl && (
                      <a
                        href={meeting.minutesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-semibold"
                      >
                        View Minutes
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <CreateMeetingModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchMeetings();
          }}
        />
      )}
    </div>
  );
}

// Create Meeting Modal Component
function CreateMeetingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'REGULAR',
    scheduledDate: '',
    scheduledTime: '',
    location: '',
    agenda: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const scheduledDate = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

      const response = await fetch('/api/admin/board/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduledDate: scheduledDate.toISOString(),
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Failed to create meeting');
      }
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to create meeting');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Schedule Board Meeting</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="January 2026 Board Meeting"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Brief description of the meeting..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Type *</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="REGULAR">Regular Meeting</option>
              <option value="SPECIAL">Special Meeting</option>
              <option value="EMERGENCY">Emergency Meeting</option>
              <option value="COMMITTEE">Committee Meeting</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Time *</label>
              <input
                type="time"
                required
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Board Room or Zoom Link"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Agenda</label>
            <textarea
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={5}
              placeholder="Meeting agenda items..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Schedule Meeting
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
