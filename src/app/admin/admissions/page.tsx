'use client'

import { useEffect, useState, useMemo } from 'react'
import { Mail, Phone, Calendar, AlertCircle, CheckCircle, XCircle, Clock, Search, SlidersHorizontal, Save } from 'lucide-react'

interface AdmissionInquiry {
  id: string
  name: string
  email: string
  phone: string
  program: string
  message: string
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

type StatusFilter = 'all' | 'pending' | 'contacted' | 'accepted' | 'rejected'
type SortOption = 'newest' | 'oldest' | 'program'

export default function AdminAdmissions() {
  const [inquiries, setInquiries] = useState<AdmissionInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [programFilter, setProgramFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/admission')
      if (response.ok) {
        const json = await response.json()
        setInquiries(json.data?.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admission/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const saveNotes = async (id: string) => {
    setSavingNotes(prev => ({ ...prev, [id]: true }))
    try {
      const response = await fetch(`/api/admission/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editingNotes[id] ?? '' })
      })
      if (response.ok) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, notes: editingNotes[id] ?? '' } : i))
        setEditingNotes(prev => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      }
    } catch (error) {
      console.error('Failed to save notes:', error)
    } finally {
      setSavingNotes(prev => ({ ...prev, [id]: false }))
    }
  }

  const programs = useMemo(() => {
    const set = new Set(inquiries.map(i => i.program))
    return Array.from(set).sort()
  }, [inquiries])

  const statusCounts = useMemo(() => ({
    all: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    accepted: inquiries.filter(i => i.status === 'accepted').length,
    rejected: inquiries.filter(i => i.status === 'rejected').length,
  }), [inquiries])

  const filteredInquiries = useMemo(() => {
    let result = inquiries

    if (filter !== 'all') {
      result = result.filter(i => i.status === filter)
    }

    if (programFilter) {
      result = result.filter(i => i.program === programFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.program.toLowerCase().includes(q)
      )
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return a.program.localeCompare(b.program)
    })

    return result
  }, [inquiries, filter, programFilter, searchQuery, sortBy])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'contacted': return <Mail className="w-4 h-4 text-blue-600" />
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'contacted': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admission Inquiries</h1>
        <p className="text-gray-500 text-sm mt-1">Manage program applications and track inquiry status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-yellow-700 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-800">{statusCounts.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-700 text-sm">Contacted</p>
          <p className="text-2xl font-bold text-blue-800">{statusCounts.contacted}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-green-700 text-sm">Accepted</p>
          <p className="text-2xl font-bold text-green-800">{statusCounts.accepted}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or program..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple focus:border-transparent"
            />
          </div>

          {/* Program Filter */}
          <select
            value={programFilter}
            onChange={e => setProgramFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple focus:border-transparent"
          >
            <option value="">All Programs</option>
            {programs.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="program">By Program</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'pending', 'contacted', 'accepted', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f
                ? 'bg-brand-purple text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1.5 text-xs opacity-75">({statusCounts[f]})</span>
          </button>
        ))}
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No inquiries found</p>
          </div>
        ) : (
          filteredInquiries.map(inquiry => (
            <div key={inquiry.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
                {/* Top row: name, status, actions */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{inquiry.name}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                        {getStatusIcon(inquiry.status)}
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1.5 hover:text-brand-purple">
                        <Mail className="w-3.5 h-3.5" />
                        {inquiry.email}
                      </a>
                      {inquiry.phone && (
                        <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1.5 hover:text-brand-purple">
                          <Phone className="w-3.5 h-3.5" />
                          {inquiry.phone}
                        </a>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {inquiry.status !== 'contacted' && (
                      <button
                        onClick={() => updateStatus(inquiry.id, 'contacted')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {inquiry.status !== 'accepted' && (
                      <button
                        onClick={() => updateStatus(inquiry.id, 'accepted')}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition"
                      >
                        Accept
                      </button>
                    )}
                    {inquiry.status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(inquiry.id, 'rejected')}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Program:</span> {inquiry.program}
                  </p>
                  {inquiry.message && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{inquiry.message}</p>
                    </div>
                  )}
                </div>

                {/* Admin Notes */}
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Admin Notes</label>
                  <div className="flex gap-2">
                    <textarea
                      value={editingNotes[inquiry.id] ?? inquiry.notes ?? ''}
                      onChange={e => setEditingNotes(prev => ({ ...prev, [inquiry.id]: e.target.value }))}
                      placeholder="Add notes about this inquiry..."
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple focus:border-transparent resize-none"
                    />
                    {editingNotes[inquiry.id] !== undefined && editingNotes[inquiry.id] !== (inquiry.notes ?? '') && (
                      <button
                        onClick={() => saveNotes(inquiry.id)}
                        disabled={savingNotes[inquiry.id]}
                        className="px-3 py-2 bg-brand-purple hover:bg-purple-800 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 self-end"
                      >
                        {savingNotes[inquiry.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
