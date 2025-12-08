'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Calendar, Heart, Save } from 'lucide-react'
import { useToast } from '@/components/shared/ToastProvider'

interface UserProfile {
  name: string
  email: string
  role: string
  createdAt: string
}

interface RSVP {
  id: string
  session: {
    title: string
    startDate: string
    format: string
  }
  status: string
}

interface Donation {
  id: string
  amount: number
  frequency: string
  createdAt: string
  status: string
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session.user) {
      fetchProfile()
    }
  }, [status])

  const fetchProfile = async () => {
    try {
      // Fetch user profile
      const profileRes = await fetch('/api/user/profile')
      if (profileRes.ok) {
        const data = await profileRes.json()
        setProfile(data)
        setFormData({
          name: data.name || '',
          email: data.email || ''
        })
      }

      // Fetch user RSVPs
      const rsvpRes = await fetch('/api/rsvp/user')
      if (rsvpRes.ok) {
        const data = await rsvpRes.json()
        setRsvps(data)
      }

      // Fetch user donations
      const donationsRes = await fetch('/api/user/donations')
      if (donationsRes.ok) {
        const data = await donationsRes.json()
        setDonations(data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      showToast('error', 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updated = await response.json()
        setProfile(updated)
        setEditing(false)
        showToast('success', 'Profile updated successfully!')
        
        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name,
            email: formData.email
          }
        })
      } else {
        showToast('error', 'Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      showToast('error', 'Failed to update profile')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and view your activity</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Account Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Account Details</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false)
                        setFormData({
                          name: profile?.name || '',
                          email: profile?.email || ''
                        })
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {profile?.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
                  <p className="text-gray-900">{profile?.role || 'USER'}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* My RSVPs */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">My RSVPs</h2>
              {rsvps.length === 0 ? (
                <p className="text-gray-600">You haven't RSVP'd to any meetings yet.</p>
              ) : (
                <div className="space-y-3">
                  {rsvps.map(rsvp => (
                    <div key={rsvp.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900">{rsvp.session.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(rsvp.session.startDate).toLocaleDateString()} at{' '}
                        {new Date(rsvp.session.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{rsvp.session.format}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Donations */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">My Donations</h2>
              {donations.length === 0 ? (
                <div className="text-center py-6">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">You haven't made any donations yet.</p>
                  <Link 
                    href="/donate"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Make a Donation
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.map(donation => (
                    <div key={donation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            ${donation.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">{donation.frequency}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            donation.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {donation.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md p-6 text-white">
              <User className="w-12 h-12 mb-4 opacity-80" />
              <h3 className="text-lg font-semibold mb-2">Your Impact</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">{rsvps.length}</p>
                  <p className="text-blue-100 text-sm">Meetings Attended</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{donations.length}</p>
                  <p className="text-blue-100 text-sm">Donations Made</p>
                </div>
                {donations.length > 0 && (
                  <div>
                    <p className="text-3xl font-bold">
                      ${donations.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                    </p>
                    <p className="text-blue-100 text-sm">Total Contributed</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/meetings" className="block text-blue-600 hover:text-blue-700">
                  Browse Meetings →
                </Link>
                <Link href="/donate" className="block text-blue-600 hover:text-blue-700">
                  Make a Donation →
                </Link>
                <Link href="/programs" className="block text-blue-600 hover:text-blue-700">
                  View Programs →
                </Link>
                <Link href="/community" className="block text-blue-600 hover:text-blue-700">
                  Join Community →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
