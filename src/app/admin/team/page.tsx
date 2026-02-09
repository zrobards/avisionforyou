'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash2, Save, User } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface TeamMember {
  id: string
  name: string
  title: string
  bio: string
  role?: string
  imageUrl?: string
  email?: string
  phone?: string
}

export default function AdminTeam() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    role: '',
    imageUrl: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchMembers()
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchMembers, 30000)
      return () => clearInterval(interval)
    }
  }, [status])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/admin/team', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      } else if (loading) {
        const error = await response.json()
        showToast(error.error || 'Failed to fetch team members', 'error')
      }
    } catch (error: any) {
      if (loading) {
        showToast(error.message || 'Failed to fetch team members', 'error')
      }
      console.error('Failed to fetch team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editing) {
        const response = await fetch(`/api/admin/team/${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          showToast('Team member updated successfully', 'success')
          setEditing(null)
          resetForm()
          fetchMembers()
        } else {
          const error = await response.json()
          showToast(error.error || 'Failed to update team member', 'error')
        }
      } else {
        const response = await fetch('/api/admin/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          showToast('Team member added successfully', 'success')
          setCreating(false)
          resetForm()
          fetchMembers()
        } else {
          const error = await response.json()
          showToast(error.error || 'Failed to add team member', 'error')
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save team member', 'error')
      console.error('Failed to save team member:', error)
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditing(member.id)
    setCreating(true)
    setFormData({
      name: member.name,
      title: member.title,
      bio: member.bio,
      role: member.role || '',
      imageUrl: member.imageUrl || '',
      email: member.email || '',
      phone: member.phone || ''
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    try {
      const response = await fetch(`/api/admin/team/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showToast('Team member deleted successfully', 'success')
        fetchMembers()
      } else {
        const error = await response.json()
        showToast(error.error || 'Failed to delete team member', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to delete team member', 'error')
      console.error('Failed to delete team member:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      bio: '',
      role: '',
      imageUrl: '',
      email: '',
      phone: ''
    })
    setEditing(null)
    setCreating(false)
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
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-6 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-gray-400">Manage leadership and staff profiles</p>
          </div>
          <div className="flex gap-3">
            {!creating && (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            )}
            <Link href="/admin" className="text-blue-400 hover:text-blue-300">
              ← Back to Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {creating && (
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editing ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Title/Position *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    placeholder="e.g. Medical Director"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Bio *</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows={4}
                  placeholder="Professional background and experience..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Role/Department</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    placeholder="e.g. Clinical Services"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Photo URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save className="w-4 h-4" />
                  {editing ? 'Update Member' : 'Add Member'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Team Members List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">Team Members ({members.length})</h2>
          
          {members.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
              <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No team members yet. Add your first member to get started!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {members.map(member => (
                <div key={member.id} className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {member.imageUrl ? (
                      <img 
                        src={member.imageUrl} 
                        alt={member.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-500" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{member.name}</h3>
                      <p className="text-blue-400 mb-2">{member.title}</p>
                      <p className="text-gray-400 text-sm line-clamp-2">{member.bio}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
