'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Phone, Calendar, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'

interface AdmissionInquiry {
  id: string
  name: string
  email: string
  phone: string
  program: string
  message: string
  status: string
  createdAt: string
}

export default function AdminAdmissions() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [inquiries, setInquiries] = useState<AdmissionInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'contacted' | 'accepted' | 'rejected'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchInquiries()
    }
  }, [status])

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/admission', {
        headers: {
          'Authorization': 'Bearer temp_token'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setInquiries(data)
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer temp_token'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchInquiries()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const filteredInquiries = filter === 'all' 
    ? inquiries 
    : inquiries.filter(i => i.status === filter)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />
      case 'contacted': return <Mail className="w-5 h-5 text-blue-600" />
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-6 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admission Inquiries</h1>
            <p className="text-gray-400">Manage program applications</p>
          </div>
          <Link href="/admin" className="text-blue-400 hover:text-blue-300">
            ← Back to Admin
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
            <p className="text-gray-400 mb-2">Total Inquiries</p>
            <p className="text-3xl font-bold text-white">{inquiries.length}</p>
          </div>
          <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4 sm:p-6">
            <p className="text-yellow-200 mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">
              {inquiries.filter(i => i.status === 'pending').length}
            </p>
          </div>
          <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4 sm:p-6">
            <p className="text-blue-200 mb-2">Contacted</p>
            <p className="text-3xl font-bold text-blue-400">
              {inquiries.filter(i => i.status === 'contacted').length}
            </p>
          </div>
          <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4 sm:p-6">
            <p className="text-green-200 mb-2">Accepted</p>
            <p className="text-3xl font-bold text-green-400">
              {inquiries.filter(i => i.status === 'accepted').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex flex-wrap gap-3">
            {(['all', 'pending', 'contacted', 'accepted', 'rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Inquiries List */}
        <div className="space-y-4">
          {filteredInquiries.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No inquiries found</p>
            </div>
          ) : (
            filteredInquiries.map(inquiry => (
              <div key={inquiry.id} className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{inquiry.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(inquiry.status)}`}>
                        {getStatusIcon(inquiry.status)}
                        {inquiry.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
                      <a href={`mailto:${inquiry.email}`} className="flex items-center gap-2 hover:text-blue-400">
                        <Mail className="w-4 h-4" />
                        {inquiry.email}
                      </a>
                      <a href={`tel:${inquiry.phone}`} className="flex items-center gap-2 hover:text-blue-400">
                        <Phone className="w-4 h-4" />
                        {inquiry.phone}
                      </a>
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex flex-wrap gap-2">
                    {inquiry.status !== 'contacted' && (
                      <button
                        onClick={() => updateStatus(inquiry.id, 'contacted')}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {inquiry.status !== 'accepted' && (
                      <button
                        onClick={() => updateStatus(inquiry.id, 'accepted')}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                      >
                        Accept
                      </button>
                    )}
                    {inquiry.status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(inquiry.id, 'rejected')}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900 rounded p-4">
                  <p className="text-sm text-gray-400 mb-2">
                    <strong className="text-gray-300">Program:</strong> {inquiry.program}
                  </p>
                  {inquiry.message && (
                    <>
                      <p className="text-sm text-gray-400 mb-2">
                        <strong className="text-gray-300">Message:</strong>
                      </p>
                      <p className="text-gray-300 whitespace-pre-wrap">{inquiry.message}</p>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
