'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, FileText, FolderOpen, ArrowRight, CheckCircle2, AlertCircle, Plus, X, Send, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Meeting {
  id: string;
  title: string;
  status: string;
  category: string | null;
  duration: number | null;
  transcript: string | null;
  summary: string | null;
  actionItems: any;
  createdAt: string;
  project: { id: string; name: string } | null;
}

interface CalendarMeeting {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: string;
  meetingUrl: string | null;
  project: { id: string; name: string } | null;
  organization: { id: string; name: string } | null;
}

interface Project {
  id: string;
  name: string;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  'DISCOVERY_CALL': { label: 'Discovery Call', emoji: '📞', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'DESIGN_REVIEW': { label: 'Design Review', emoji: '🎨', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  'TECHNICAL_DISCUSSION': { label: 'Technical Discussion', emoji: '💻', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  'PROJECT_UPDATE': { label: 'Project Update', emoji: '📊', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  'BRAINSTORMING': { label: 'Brainstorming', emoji: '💡', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'TRAINING': { label: 'Training', emoji: '📚', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  'SUPPORT': { label: 'Support', emoji: '🛠️', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
};

const MEETING_TYPES = [
  { value: 'PROJECT_UPDATE', label: 'Project Update', description: 'Discuss project progress and next steps' },
  { value: 'DESIGN_REVIEW', label: 'Design Review', description: 'Review and provide feedback on designs' },
  { value: 'TECHNICAL_DISCUSSION', label: 'Technical Discussion', description: 'Discuss technical requirements or issues' },
  { value: 'SUPPORT', label: 'Support Call', description: 'Get help with an issue or question' },
  { value: 'BRAINSTORMING', label: 'Brainstorming', description: 'Ideate on new features or improvements' },
  { value: 'GENERAL', label: 'General Meeting', description: 'General discussion' },
];

export default function ClientMeetingsPage() {
  const [recordings, setRecordings] = useState<Meeting[]>([]);
  const [scheduledMeetings, setScheduledMeetings] = useState<CalendarMeeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recordings'>('upcoming');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    preferredDate: '',
    preferredTime: '',
    duration: '30',
    projectId: '',
    meetingType: 'GENERAL',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch recordings
      const recordingsRes = await fetch('/api/client/recordings');
      if (recordingsRes.ok) {
        const data = await recordingsRes.json();
        setRecordings(data.recordings || []);
      }

      // Fetch scheduled meetings
      const meetingsRes = await fetch('/api/client/meetings');
      if (meetingsRes.ok) {
        const data = await meetingsRes.json();
        setScheduledMeetings(data.meetings || []);
      }

      // Fetch projects for dropdown
      const projectsRes = await fetch('/api/client/projects');
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/client/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: requestForm.title,
          description: requestForm.description,
          preferredDate: requestForm.preferredDate,
          preferredTime: requestForm.preferredTime,
          duration: parseInt(requestForm.duration),
          projectId: requestForm.projectId || undefined,
          meetingType: requestForm.meetingType,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to submit request');
      }

      setSubmitSuccess(true);
      setRequestForm({
        title: '',
        description: '',
        preferredDate: '',
        preferredTime: '',
        duration: '30',
        projectId: '',
        meetingType: 'GENERAL',
      });
      
      // Refresh meetings list
      fetchData();
      
      // Close modal after delay
      setTimeout(() => {
        setShowRequestModal(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error: any) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get minimum date for date picker (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const upcomingMeetings = scheduledMeetings.filter(m => 
    new Date(m.startTime) > new Date() && m.status !== 'CANCELLED'
  );
  const pendingRequests = scheduledMeetings.filter(m => m.status === 'PENDING');
  const rescheduledMeetings = scheduledMeetings.filter(m => m.status === 'RESCHEDULED');
  const pastMeetings = scheduledMeetings.filter(m => 
    new Date(m.startTime) <= new Date() && m.status !== 'CANCELLED'
  );

  const handleConfirmReschedule = async (meetingId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/client/meetings/${meetingId}/confirm-reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to confirm reschedule');
      }

      // Refresh meetings list
      fetchData();
    } catch (error: any) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                <CalendarDays className="w-8 h-8 text-purple-400" />
              </div>
              Meetings
            </h1>
            <p className="text-gray-400 mt-2">
              Schedule meetings and access recordings from past sessions
            </p>
          </div>

          {/* Request Meeting Button */}
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-purple-500/25"
          >
            <Plus className="w-5 h-5" />
            Request a Meeting
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/10">
            <div className="text-2xl font-bold text-white">{upcomingMeetings.length}</div>
            <div className="text-sm text-gray-400">Upcoming</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/10">
            <div className="text-2xl font-bold text-yellow-400">{pendingRequests.length}</div>
            <div className="text-sm text-gray-400">Pending Requests</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/10">
            <div className="text-2xl font-bold text-purple-400">{recordings.length}</div>
            <div className="text-sm text-gray-400">Recordings</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/10">
            <div className="text-2xl font-bold text-gray-400">{pastMeetings.length}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'upcoming'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Upcoming & Requests
          </button>
          <button
            onClick={() => setActiveTab('recordings')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'recordings'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Recordings
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">Loading meetings...</p>
          </div>
        ) : activeTab === 'upcoming' ? (
          <div className="space-y-6">
            {/* Pending Requests */}
            {/* Rescheduled Meetings - Need Client Confirmation */}
            {rescheduledMeetings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  Rescheduled Meetings - Action Required
                </h2>
                <div className="grid gap-4">
                  {rescheduledMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="bg-orange-500/10 backdrop-blur-sm rounded-xl border border-orange-500/30 p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{meeting.title.replace('[Meeting Request] ', '')}</h3>
                          <p className="text-gray-400 text-sm mt-1">{meeting.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              New Time: {formatDateTime(meeting.startTime)}
                            </span>
                            {meeting.project && (
                              <span className="flex items-center gap-1">
                                <FolderOpen className="w-4 h-4" />
                                {meeting.project.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleConfirmReschedule(meeting.id)}
                            disabled={submitting}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Confirm New Time
                          </button>
                          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium text-center">
                            Awaiting Your Confirmation
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingRequests.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  Pending Requests
                </h2>
                <div className="grid gap-4">
                  {pendingRequests.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="bg-yellow-500/10 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{meeting.title.replace('[Meeting Request] ', '')}</h3>
                          <p className="text-gray-400 text-sm mt-1">{meeting.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Requested: {formatDateTime(meeting.startTime)}
                            </span>
                            {meeting.project && (
                              <span className="flex items-center gap-1">
                                <FolderOpen className="w-4 h-4" />
                                {meeting.project.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                          Awaiting Confirmation
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Meetings */}
            {upcomingMeetings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-green-400" />
                  Confirmed Meetings
                </h2>
                <div className="grid gap-4">
                  {upcomingMeetings.filter(m => m.status === 'SCHEDULED' || m.status === 'CONFIRMED').map((meeting) => (
                    <div
                      key={meeting.id}
                      className="bg-green-500/10 backdrop-blur-sm rounded-xl border border-green-500/30 p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{meeting.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDateTime(meeting.startTime)}
                            </span>
                            {meeting.project && (
                              <span className="flex items-center gap-1">
                                <FolderOpen className="w-4 h-4" />
                                {meeting.project.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {meeting.meetingUrl && (
                            <a
                              href={meeting.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                              <Video className="w-4 h-4" />
                              Join
                            </a>
                          )}
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                            Confirmed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingRequests.length === 0 && upcomingMeetings.length === 0 && (
              <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <CalendarDays className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No upcoming meetings scheduled</p>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Request a Meeting
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Recordings Tab */
          <div className="space-y-4">
            {recordings.length === 0 ? (
              <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No meeting recordings available yet</p>
              </div>
            ) : (
              <>
                {recordings.map((meeting) => {
                  const categoryInfo = meeting.category ? CATEGORY_LABELS[meeting.category] : null;
                  const hasActionItems = meeting.actionItems && Array.isArray(meeting.actionItems) && meeting.actionItems.length > 0;
                  
                  return (
                    <div
                      key={meeting.id}
                      className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => setSelectedMeeting(selectedMeeting?.id === meeting.id ? null : meeting)}
                    >
                    {/* Meeting Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                          {meeting.title}
                        </h3>
                        {categoryInfo && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryInfo.color}`}>
                            {categoryInfo.emoji} {categoryInfo.label}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(meeting.createdAt)}
                        </span>
                        {meeting.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDuration(meeting.duration)}
                          </span>
                        )}
                        {meeting.project && (
                          <span className="flex items-center gap-1">
                            <FolderOpen className="w-4 h-4" />
                            <Link 
                              href={`/client/projects/${meeting.project.id}`}
                              className="hover:text-purple-400 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {meeting.project.name}
                            </Link>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {meeting.status === 'TRANSCRIBED' ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready
                        </span>
                      ) : meeting.status === 'PROCESSING' ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium border border-yellow-500/30">
                          <Clock className="w-3 h-3" />
                          Processing
                        </span>
                      ) : meeting.status === 'ERROR' ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/30">
                          <AlertCircle className="w-3 h-3" />
                          Error
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium border border-gray-500/30">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary Preview */}
                  {meeting.summary && (
                    <div className="mb-4">
                      <p className="text-gray-300 text-sm line-clamp-2">{meeting.summary}</p>
                    </div>
                  )}

                  {/* Expanded Content */}
                  {selectedMeeting?.id === meeting.id && meeting.status === 'TRANSCRIBED' && (
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
                      
                      {/* Full Summary */}
                      {meeting.summary && (
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-400" />
                            Meeting Summary
                          </h4>
                          <div className="bg-white/5 rounded-lg p-4 text-gray-300 text-sm leading-relaxed">
                            {meeting.summary}
                          </div>
                        </div>
                      )}

                      {/* Action Items */}
                      {hasActionItems && (
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            Action Items
                          </h4>
                          <div className="space-y-2">
                            {(meeting.actionItems as string[]).map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
                              >
                                <ArrowRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Transcript */}
                      {meeting.transcript && (
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            Full Transcript
                          </h4>
                          <div className="bg-white/5 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                              {meeting.transcript}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expand Button */}
                  {meeting.status === 'TRANSCRIBED' && (
                    <div className="mt-4 text-center">
                      <button className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
                        {selectedMeeting?.id === meeting.id ? 'Show Less' : 'View Details'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
              </>
            )}
          </div>
        )}

        {/* Request Meeting Modal */}
        <AnimatePresence>
          {showRequestModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowRequestModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white">Request a Meeting</h2>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                {submitSuccess ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Request Submitted!</h3>
                    <p className="text-gray-400">We'll confirm your meeting time shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRequestMeeting} className="p-6 space-y-4">
                    {submitError && (
                      <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {submitError}
                      </div>
                    )}

                    {/* Meeting Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Meeting Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={requestForm.meetingType}
                        onChange={(e) => setRequestForm({ ...requestForm, meetingType: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        required
                      >
                        {MEETING_TYPES.map((type) => (
                          <option key={type.value} value={type.value} className="bg-gray-900">
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Meeting Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={requestForm.title}
                        onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                        placeholder="e.g., Weekly Progress Check"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        What would you like to discuss?
                      </label>
                      <textarea
                        value={requestForm.description}
                        onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                        placeholder="Briefly describe what you'd like to cover..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          value={requestForm.preferredDate}
                          onChange={(e) => setRequestForm({ ...requestForm, preferredDate: e.target.value })}
                          min={getMinDate()}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Preferred Time
                        </label>
                        <input
                          type="time"
                          value={requestForm.preferredTime}
                          onChange={(e) => setRequestForm({ ...requestForm, preferredTime: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Estimated Duration
                      </label>
                      <select
                        value={requestForm.duration}
                        onChange={(e) => setRequestForm({ ...requestForm, duration: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      >
                        <option value="15" className="bg-gray-900">15 minutes</option>
                        <option value="30" className="bg-gray-900">30 minutes</option>
                        <option value="45" className="bg-gray-900">45 minutes</option>
                        <option value="60" className="bg-gray-900">1 hour</option>
                      </select>
                    </div>

                    {/* Project Selection */}
                    {projects.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Related Project (optional)
                        </label>
                        <select
                          value={requestForm.projectId}
                          onChange={(e) => setRequestForm({ ...requestForm, projectId: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                          <option value="" className="bg-gray-900">No specific project</option>
                          {projects.map((project) => (
                            <option key={project.id} value={project.id} className="bg-gray-900">
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting || !requestForm.title}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Request
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
