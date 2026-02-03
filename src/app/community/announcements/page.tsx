"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    name: string | null
    email: string
  }
}

export default function CommunityAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/community/announcements")
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data)
      }
    } catch (error) {
      console.error("Error fetching announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600 mt-2">
          Stay up to date with the latest community news and updates
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No announcements at this time.</p>
          <p className="text-sm text-gray-500 mt-2">Check back soon for updates!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <Bell className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {announcement.title}
                  </h3>
                  <div className="prose max-w-none text-gray-700 mb-4 whitespace-pre-wrap">
                    {announcement.content}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <span>{formatDate(announcement.createdAt)}</span>
                    <span>•</span>
                    <span>{announcement.author.name || "Admin"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
