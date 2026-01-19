"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Bell, BookOpen, Users } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    name: string | null
  }
}

interface Meeting {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string | null
  format: string
  link: string | null
  program: {
    name: string
  }
  userRsvpStatus: string | null
}

interface Stats {
  attended: number
  upcoming: number
}

export default function CommunityDashboard() {
  const { data: session } = useSession()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([])
  const [stats, setStats] = useState<Stats>({ attended: 0, upcoming: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [announcementsRes, meetingsRes, statsRes] = await Promise.all([
        fetch("/api/community/announcements?limit=3"),
        fetch("/api/community/meetings?upcoming=true&limit=5"),
        fetch("/api/community/stats")
      ])

      if (announcementsRes.ok) {
        const data = await announcementsRes.json()
        setAnnouncements(data)
      }

      if (meetingsRes.ok) {
        const data = await meetingsRes.json()
        setUpcomingMeetings(data)
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name || "Community Member"}!
        </h1>
        <p className="text-gray-600 mt-2">
          Stay connected with the AVFY community
        </p>
      </div>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.attended}</p>
              <p className="text-gray-600">Meetings Attended</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
              <p className="text-gray-600">Upcoming RSVPs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Latest Announcements</h2>
          <Link 
            href="/community/announcements" 
            className="text-green-600 hover:text-green-700 hover:underline font-medium"
          >
            View All
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow divide-y">
          {announcements.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No announcements yet. Check back soon!
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="p-6">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(announcement.createdAt)} • {announcement.author.name || "Admin"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Upcoming Meetings */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Meetings</h2>
          <Link 
            href="/community/meetings" 
            className="text-green-600 hover:text-green-700 hover:underline font-medium"
          >
            View All
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow divide-y">
          {upcomingMeetings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No upcoming meetings. Check back soon!
            </div>
          ) : (
            upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                      {meeting.userRsvpStatus && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          RSVPed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {meeting.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(meeting.startDate)}
                      </span>
                      {meeting.location && (
                        <span>{meeting.location}</span>
                      )}
                      {meeting.format === "ONLINE" && meeting.link && (
                        <span className="text-green-600">Online</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/community/meetings"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Calendar className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">All Meetings</h3>
            <p className="text-sm text-gray-600">Browse and RSVP to upcoming sessions</p>
          </Link>
          <Link
            href="/community/resources"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <BookOpen className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Resources</h3>
            <p className="text-sm text-gray-600">Access helpful resources and links</p>
          </Link>
          <Link
            href="/community/my-rsvps"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Users className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">My RSVPs</h3>
            <p className="text-sm text-gray-600">View and manage your RSVPs</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
