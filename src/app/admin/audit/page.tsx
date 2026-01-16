'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { Activity, Filter, Calendar, User, FileText } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  userId: string
  details: any
  createdAt: string
}

export default function AdminAuditLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const [filterAction, setFilterAction] = useState<string>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role
      if (userRole !== 'ADMIN') {
        showToast('Admin access required', 'error')
        router.push('/dashboard')
        return
      }
      fetchLogs()
    }
  }, [status, router, showToast])

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (filterEntity !== 'all') params.set('entity', filterEntity)
      if (filterAction !== 'all') params.set('action', filterAction)
      
      const response = await fetch(`/api/admin/audit?${params.toString()}`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch logs')
      const data = await response.json()
      setLogs(data.data || [])
    } catch (error) {
      showToast('Failed to load audit logs', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      fetchLogs()
    }
  }, [filterEntity, filterAction])

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'STATUS_CHANGE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ROLE_CHANGE':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'SEND_EMAIL':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'EXPORT':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

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
            <Activity className="w-6 h-6 text-brand-purple" />
            Audit Logs
          </h1>
          <p className="text-gray-600 text-sm">Track all administrative actions and changes</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 animate-slide-up">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="min-w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Entity Type</label>
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="all">All Entities</option>
                <option value="User">User</option>
                <option value="Donation">Donation</option>
                <option value="ContactInquiry">Contact Inquiry</option>
                <option value="AdmissionInquiry">Admission Inquiry</option>
                <option value="TeamMember">Team Member</option>
                <option value="BlogPost">Blog Post</option>
                <option value="Newsletter">Newsletter</option>
                <option value="SocialMediaPost">Social Post</option>
              </select>
            </div>
            <div className="min-w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Action Type</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="all">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="STATUS_CHANGE">Status Change</option>
                <option value="ROLE_CHANGE">Role Change</option>
                <option value="SEND_EMAIL">Send Email</option>
                <option value="EXPORT">Export</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Showing {logs.length} audit log entries
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log, index) => (
                <tr 
                  key={log.id}
                  className="hover:bg-gray-50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getActionColor(log.action)}`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{log.entity}</div>
                        <div className="text-xs text-gray-500 font-mono">{log.entityId.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 font-mono text-xs">
                        {log.userId === 'system' ? 'System' : log.userId.slice(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.details && Object.keys(log.details).length > 0 ? (
                      <details className="cursor-pointer">
                        <summary className="text-brand-purple hover:underline">View details</summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-w-md">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No audit logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
