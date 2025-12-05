'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Heart, Home, Calendar, BookOpen, Users, DollarSign, LogOut, User, Settings } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'STAFF'

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-800 border-b border-blue-700 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white hover:text-blue-100 transition-colors">
            <Heart className="w-6 h-6 text-red-400" />
            <span>A Vision For You</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link href="/programs" className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
              <Calendar className="w-4 h-4" />
              Programs
            </Link>
            <Link href="/meetings" className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
              <Users className="w-4 h-4" />
              Meetings
            </Link>
            <Link href="/blog" className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
              <BookOpen className="w-4 h-4" />
              Blog
            </Link>
            <Link href="/donate" className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
              <DollarSign className="w-4 h-4" />
              Donate
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="animate-pulse bg-blue-700 rounded-full w-10 h-10"></div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">{session.user?.name || 'Account'}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>
                    
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      My Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Users className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-white text-blue-900 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
