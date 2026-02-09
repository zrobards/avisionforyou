'use client'

import { useEffect, useState } from 'react'
import { Mail, User } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  title: string
  role: string
  bio: string
  credentials: string | null
  email: string | null
  phone: string | null
  linkedin: string | null
  imageUrl: string | null
  order: number | null
  isActive: boolean
}

const EXECUTIVE_ROLES = [
  'EXECUTIVE_DIRECTOR',
  'BOARD_PRESIDENT',
  'BOARD_VP',
  'BOARD_TREASURER',
  'BOARD_SECRETARY',
  'BOARD_MEMBER'
]

export default function TeamDirectoryPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch('/api/board/team')
        if (res.ok) {
          const data = await res.json()
          setMembers(data)
        }
      } catch (error) {
        console.error('Error fetching team:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const executiveMembers = members.filter(m => EXECUTIVE_ROLES.includes(m.role))
  const staffMembers = members.filter(m => m.role === 'STAFF')

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Team Directory</h1>
        <p className="text-gray-600 mt-2">
          Meet our leadership team and staff members
        </p>
      </div>

      {/* Executive Leadership */}
      <div className="mb-12">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
          Executive Leadership
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {executiveMembers.map(member => (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                {member.imageUrl ? (
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-indigo-600" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                {member.credentials && (
                  <p className="text-sm text-gray-600">{member.credentials}</p>
                )}
                <p className="text-sm text-indigo-600 mt-1">{member.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {member.role.replace(/_/g, ' ')}
                </p>
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 mt-3"
                  >
                    <Mail className="w-4 h-4" />
                    Contact
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff */}
      {staffMembers.length > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Staff
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {staffMembers.map(member => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  {member.imageUrl ? (
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover mb-4"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                      <User className="w-12 h-12 text-indigo-600" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  {member.credentials && (
                    <p className="text-sm text-gray-600">{member.credentials}</p>
                  )}
                  <p className="text-sm text-indigo-600 mt-1">{member.title}</p>
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 mt-3"
                    >
                      <Mail className="w-4 h-4" />
                      Contact
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
