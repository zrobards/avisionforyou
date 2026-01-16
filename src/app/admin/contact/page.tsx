'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { 
  Mail, 
  Search, 
  Filter, 
  User, 
  Phone, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive,
  Send,
  X
} from 'lucide-react'

interface ContactInquiry {
  id: string
  name: string
  email: string
  phone?: string
  department: string
  subject: string
  message: string
  status: 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'RESOLVED' | 'ARCHIVED'
  assignedTo?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function AdminContactPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [notes, setNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role
      if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
        showToast('Admin or staff access required', 'error')
        router.push('/dashboard')
        return
      }
      fetchInquiries()
    }
  }, [status, router, showToast])

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/admin/contact', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch inquiries')
      const data = await response.json()
      setInquiries(data.data || [])
    } catch (error) {
      showToast('Failed to load inquiries', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const updateInquiryStatus = async (id: string, newStatus: string, emailReply?: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          ...(emailReply && { emailReply })
        })
      })

      if (!response.ok) throw new Error('Failed to update inquiry')

      showToast(`Inquiry status updated to ${newStatus}`, 'success')
      fetchInquiries()
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(prev => prev ? { ...prev, status: newStatus as any } : null)
      }
    } catch (error) {
      showToast('Failed to update inquiry status', 'error')
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

  const saveNotes = async (id: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })

      if (!response.ok) throw new Error('Failed to save notes')

      showToast('Notes saved successfully', 'success')
      fetchInquiries()
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(prev => prev ? { ...prev, notes } : null)
      }
    } catch (error) {
      showToast('Failed to save notes', 'error')
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

  const sendReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) return

    setUpdating(true)
    try {
      await updateInquiryStatus(selectedInquiry.id, 'RESPONDED', replyMessage)
      showToast('Reply sent successfully', 'success')
      setShowReplyModal(false)
      setReplyMessage('')
    } catch (error) {
      showToast('Failed to send reply', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'RESPONDED':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <Mail className="w-4 h-4" />
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />
      case 'RESPONDED':
        return <Send className="w-4 h-4" />
      case 'RESOLVED':
        return <CheckCircle className="w-4 h-4" />
      case 'ARCHIVED':
        return <Archive className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = !searchTerm ||
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus
    const matchesDepartment = filterDepartment === 'all' || inquiry.department === filterDepartment

    return matchesSearch && matchesStatus && matchesDepartment
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-down">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-brand-purple" />
            Contact Inquiries
          </h1>
          <p className="text-gray-600 text-sm">Manage and respond to contact form submissions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 animate-slide-up">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or subject..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                />
              </div>
            </div>
            <div className="min-w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESPONDED">Responded</option>
                <option value="RESOLVED">Resolved</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="min-w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="all">All Departments</option>
                <option value="general">General</option>
                <option value="programs">Programs</option>
                <option value="donate">Donate</option>
                <option value="volunteer">Volunteer</option>
                <option value="press">Press</option>
                <option value="careers">Careers</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Showing {filteredInquiries.length} of {inquiries.length} inquiries
          </div>
        </div>

        {/* Inquiries Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInquiries.map((inquiry, index) => (
            <div
              key={inquiry.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => {
                setSelectedInquiry(inquiry)
                setNotes(inquiry.notes || '')
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-purple-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{inquiry.name}</h3>
                    <p className="text-xs text-gray-500">{inquiry.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(inquiry.status)}`}>
                  {getStatusIcon(inquiry.status)}
                  {inquiry.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">{inquiry.subject}</span>
                </div>
                {inquiry.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{inquiry.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                {inquiry.message}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 bg-gray-100 rounded">
                  {inquiry.department}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredInquiries.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No inquiries found</p>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedInquiry(null)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Inquiry Details</h2>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedInquiry.email}</p>
                  </div>
                  {selectedInquiry.phone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">{selectedInquiry.phone}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <p className="font-medium capitalize">{selectedInquiry.department}</p>
                  </div>
                </div>
              </div>

              {/* Subject and Message */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Subject</h3>
                <p className="text-gray-700">{selectedInquiry.subject}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Message</h3>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {selectedInquiry.message}
                </p>
              </div>

              {/* Status Management */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Status</h3>
                <div className="flex gap-2 flex-wrap">
                  {['NEW', 'IN_PROGRESS', 'RESPONDED', 'RESOLVED', 'ARCHIVED'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateInquiryStatus(selectedInquiry.id, status)}
                      disabled={updating || selectedInquiry.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedInquiry.status === status
                          ? 'bg-brand-purple text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Internal Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes (not visible to the inquirer)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                  rows={4}
                />
                <button
                  onClick={() => saveNotes(selectedInquiry.id)}
                  disabled={updating}
                  className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Save Notes
                </button>
              </div>

              {/* Email Reply */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowReplyModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send Email Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReplyModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Send Email Reply</h2>
              <button
                onClick={() => setShowReplyModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                <p className="text-gray-900">{selectedInquiry.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                <p className="text-gray-900">Re: {selectedInquiry.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                  rows={8}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={sendReply}
                  disabled={updating || !replyMessage.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Send Reply
                </button>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
