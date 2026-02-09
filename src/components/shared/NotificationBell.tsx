'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch {
      // Silently fail for polling
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' })
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {
      // Silently fail
    }
  }

  const markOneRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {
      // Silently fail
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'donation': return '💰'
      case 'campaign': return '🎯'
      case 'user_registration': return '👤'
      case 'document': return '📄'
      default: return '🔔'
    }
  }

  const timeAgo = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-brand-green transition-colors rounded-lg"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => {
                const content = (
                  <div
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer ${
                      !n.read ? 'bg-indigo-50/50' : ''
                    }`}
                    onClick={() => {
                      if (!n.read) markOneRead(n.id)
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0">{getTypeIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                )

                return n.link ? (
                  <Link key={n.id} href={n.link}>{content}</Link>
                ) : (
                  <div key={n.id}>{content}</div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
