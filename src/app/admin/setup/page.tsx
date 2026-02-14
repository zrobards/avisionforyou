'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, Loader2, Users } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

export default function AdminSetup() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [emailToPromote, setEmailToPromote] = useState('')
  const [promoteError, setPromoteError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/dashboard')
        return
      }
      fetchUsers()
    }
  }, [status, session, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const promoteUser = async (userId: string, email: string) => {
    try {
      setUpdating(userId)
      setSuccess('')
      setError('')

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'promote' })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to promote user')
      }

      setSuccess(`${email} promoted to ADMIN`)
      await fetchUsers()
      setEmailToPromote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote user')
    } finally {
      setUpdating(null)
    }
  }

  const demoteUser = async (userId: string, email: string) => {
    try {
      setUpdating(userId)
      setSuccess('')
      setError('')

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'demote' })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to demote user')
      }

      setSuccess(`${email} demoted to USER`)
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to demote user')
    } finally {
      setUpdating(null)
    }
  }

  const handlePromoteByEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setPromoteError('')

    const user = users.find(u => u.email.toLowerCase() === emailToPromote.toLowerCase())
    if (!user) {
      setPromoteError('User not found')
      return
    }

    if (user.role === 'ADMIN') {
      setPromoteError('User is already an admin')
      return
    }

    await promoteUser(user.id, user.email)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Setup</h1>
          <p className="text-slate-600 mt-2">Manage admin users and permissions</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3 items-start">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-green-800">{success}</div>
          </div>
        )}

        {/* Quick Promote Form */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Promote User</h2>
          <form onSubmit={handlePromoteByEmail} className="flex gap-3">
            <input
              type="email"
              placeholder="Enter user email address"
              value={emailToPromote}
              onChange={(e) => setEmailToPromote(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!emailToPromote || updating !== null}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Promote to Admin
            </button>
          </form>
          {promoteError && <p className="text-red-600 text-sm mt-2">{promoteError}</p>}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">All Users ({users.length})</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.name || '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'ADMIN'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.role === 'ADMIN' ? (
                        <button
                          onClick={() => demoteUser(user.id, user.email)}
                          disabled={updating === user.id}
                          className="text-red-600 hover:text-red-800 disabled:text-slate-400 disabled:cursor-not-allowed font-medium"
                        >
                          {updating === user.id ? (
                            <Loader2 className="w-4 h-4 inline animate-spin" />
                          ) : (
                            'Demote'
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => promoteUser(user.id, user.email)}
                          disabled={updating === user.id}
                          className="text-green-600 hover:text-green-800 disabled:text-slate-400 disabled:cursor-not-allowed font-medium"
                        >
                          {updating === user.id ? (
                            <Loader2 className="w-4 h-4 inline animate-spin" />
                          ) : (
                            'Promote'
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-8 text-center text-slate-600">
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
