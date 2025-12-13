'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone, Calendar, User, Building2, CheckCircle, Clock, XCircle } from 'lucide-react'

interface ContactInquiry {
  id: string
  name: string
  email: string
  phone: string | null
  department: string
  subject: string
  message: string
  status: 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'RESOLVED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

export default function AdminContactPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchInquiries()
  }, [])

  async function fetchInquiries() {
    try {
      const res = await fetch('/api/admin/contact')
      if (res.ok) {
        const data = await res.json()
        setInquiries(data.inquiries)
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: ContactInquiry['status']) {
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        // Update local state
        setInquiries(prev =>
          prev.map(inq => inq.id === id ? { ...inq, status } : inq)
        )
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const filteredInquiries = filter === 'all'
    ? inquiries
    : inquiries.filter(inq => inq.status === filter)

  const statusCounts = {
    all: inquiries.length,
    NEW: inquiries.filter(i => i.status === 'NEW').length,
    IN_PROGRESS: inquiries.filter(i => i.status === 'IN_PROGRESS').length,
    RESPONDED: inquiries.filter(i => i.status === 'RESPONDED').length,
    RESOLVED: inquiries.filter(i => i.status === 'RESOLVED').length
  }

  const getStatusIcon = (status: ContactInquiry['status']) => {
    switch (status) {
      case 'NEW':
        return <Mail className="h-4 w-4 text-blue-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'RESPONDED':
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'ARCHIVED':
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: ContactInquiry['status']) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'RESPONDED':
        return 'bg-green-100 text-green-800'
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800'
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Inquiries</h1>
        <p className="text-gray-600">Manage and respond to contact form submissions</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All', count: statusCounts.all },
          { key: 'NEW', label: 'New', count: statusCounts.NEW },
          { key: 'IN_PROGRESS', label: 'In Progress', count: statusCounts.IN_PROGRESS },
          { key: 'RESPONDED', label: 'Responded', count: statusCounts.RESPONDED },
          { key: 'RESOLVED', label: 'Resolved', count: statusCounts.RESOLVED }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-brand-purple text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No inquiries found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map(inquiry => (
            <Card key={inquiry.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {inquiry.subject}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {inquiry.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {inquiry.email}
                        </span>
                        {inquiry.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {inquiry.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(inquiry.status)}`}>
                      {getStatusIcon(inquiry.status)}
                      {inquiry.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Department & Date */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {inquiry.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  {inquiry.status === 'NEW' && (
                    <Button
                      onClick={() => updateStatus(inquiry.id, 'IN_PROGRESS')}
                      variant="outline"
                      size="sm"
                      className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                    >
                      Start
                    </Button>
                  )}
                  {inquiry.status === 'IN_PROGRESS' && (
                    <Button
                      onClick={() => updateStatus(inquiry.id, 'RESPONDED')}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      Mark Responded
                    </Button>
                  )}
                  {inquiry.status === 'RESPONDED' && (
                    <Button
                      onClick={() => updateStatus(inquiry.id, 'RESOLVED')}
                      variant="outline"
                      size="sm"
                      className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                    >
                      Resolve
                    </Button>
                  )}
                  {inquiry.status === 'RESOLVED' && (
                    <Button
                      onClick={() => updateStatus(inquiry.id, 'ARCHIVED')}
                      variant="outline"
                      size="sm"
                      className="text-gray-600 border-gray-300 hover:bg-gray-50"
                    >
                      Archive
                    </Button>
                  )}
                  <a
                    href={`mailto:${inquiry.email}?subject=Re: ${inquiry.subject}`}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-brand-purple rounded-md hover:bg-brand-purple/90 transition-colors"
                  >
                    Reply via Email
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
