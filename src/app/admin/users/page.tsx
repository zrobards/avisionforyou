'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { Shield, ShieldOff, Trash2, User, Search } from 'lucide-react'

interface UserData {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  _count?: {
    rsvps: number
    donations: number
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('ALL')

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
      fetchUsers()
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchUsers, 30000)
      return () => clearInterval(interval)
    }
  }, [status, router, showToast])

  // Filter users when search or role filter changes
  useEffect(() => {
    let result = users

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(u => 
        u.name?.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      )
    }

    // Apply role filter
    if (filterRole !== 'ALL') {
      result = result.filter(u => u.role === filterRole)
    }

    setFilteredUsers(result)
  }, [users, searchTerm, filterRole])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(Array.isArray(data) ? data : (data.users || []))
    } catch (error) {
      if (loading) {
        showToast('Failed to load users', 'error')
      }
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) throw new Error('Failed to update role')

      showToast(`User role updated to ${newRole}`, 'success')
      fetchUsers()
    } catch (error) {
      showToast('Failed to update user role', 'error')
      console.error(error)
    }
  }

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      showToast('User deleted successfully', 'success')
      fetchUsers()
    } catch (error: any) {
      showToast(error.message || 'Failed to delete user', 'error')
      console.error(error)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'BOARD':
        return 'bg-purple-100 text-purple-800'
      case 'ALUMNI':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-down">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 text-sm">Search, filter, and manage user roles</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 sm:p-4 animate-slide-up">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 w-full sm:min-w-64">
              <label htmlFor="user-search" className="block text-sm font-semibold text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="user-search"
                  name="userSearch"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                />
              </div>
            </div>
            <div className="min-w-48">
              <label htmlFor="role-filter" className="block text-sm font-semibold text-gray-700 mb-1">Role Filter</label>
              <select
                id="role-filter"
                name="roleFilter"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="BOARD">Board</option>
                <option value="ALUMNI">Alumni</option>
                <option value="USER">User</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-2 animate-fade-in">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600">User</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600">Activity</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600">Joined</th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-smooth hover-scale animate-fade-in" style={{animationDelay: `${index * 30}ms`}}>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name || 'No name'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                      user.role === 'BOARD' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'ALUMNI' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-600">
                    {user._count ? (
                      <span>{user._count.rsvps} RSVPs · {user._count.donations} Donations</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                      >
                        <option value="USER">User</option>
                        <option value="BOARD">Board</option>
                        <option value="ALUMNI">Alumni</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <button
                        onClick={() => deleteUser(user.id, user.name || user.email)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-smooth hover-scale"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500 animate-fade-in">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
