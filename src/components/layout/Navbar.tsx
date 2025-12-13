'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Heart, Home, Calendar, BookOpen, Users, DollarSign, LogOut, User, Settings, Bell, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'STAFF'

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-brand-purple to-purple-900 border-b border-purple-700 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white hover:text-brand-green transition-colors">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-brand-green" />
            <span className="hidden xs:inline">A Vision For You</span>
            <span className="inline xs:hidden">AVFY</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-brand-green transition-colors">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link href="/about" className="flex items-center gap-2 text-white hover:text-brand-green transition-colors">
              About
            </Link>
            <Link href="/programs" className="flex items-center gap-2 text-white hover:text-brand-green transition-colors">
              <Calendar className="w-4 h-4" />
              Programs
            </Link>
            <Link href="/team" className="flex items-center gap-2 text-white hover:text-brand-green transition-colors">
              Team
            </Link>
            <Link href="/impact" className="flex items-center gap-2 text-white hover:text-brand-green transition-colors">
              Impact
            </Link>
            <Link href="/meetings" className="flex items-center gap-2 text-white hover:text-brand-green transition-colors">
              <Users className="w-4 h-4" />
              Meetings
            </Link>
            <Link href="/blog" className="flex items-center gap-2 text-white hover:text-brand-green transition-colors">
              <BookOpen className="w-4 h-4" />
              Blog
            </Link>
            <Link href="/contact" className="flex items-center gap-2 text-white hover:text-brand-green transition-colors">
              Contact
            </Link>
            <Link href="/donate" className="flex items-center gap-2 text-white hover:text-brand-green transition-colors">
              <DollarSign className="w-4 h-4" />
              Donate
            </Link>
          </div>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            {status === 'loading' ? (
              <div className="animate-pulse bg-blue-700 rounded-full w-10 h-10"></div>
            ) : session ? (
              <>
                <Link
                  href="/notifications"
                  className="hidden sm:flex items-center gap-2 bg-purple-700 hover:bg-brand-green text-white p-2 rounded-lg transition-colors"
                  title="Your meeting notifications"
                >
                  <Bell className="w-4 h-4" />
                </Link>
                <div className="hidden sm:block relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 bg-purple-700 hover:bg-brand-green text-white px-4 py-2 rounded-lg transition-colors"
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
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        My Dashboard
                      </Link>

                      <Link
                        href="/notifications"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Bell className="w-4 h-4" />
                        My Meetings
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
              </>
            ) : (
              <Link
                href="/login"
                className="hidden sm:block bg-brand-green text-brand-purple px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-green-400 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden flex items-center justify-center w-10 h-10 bg-purple-700 hover:bg-brand-green text-white rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-brand-purple border-t border-purple-700 shadow-xl">
            <div className="px-4 py-4 space-y-2">
              {/* Navigation Links */}
              <Link
                href="/"
                className="flex items-center gap-3 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-3 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="font-medium">About</span>
              </Link>
              <Link
                href="/programs"
                className="flex items-center gap-3 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Programs</span>
              </Link>
              <Link
                href="/team"
                className="flex items-center gap-3 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="font-medium">Team</span>
              </Link>
              <Link
                href="/impact"
                className="flex items-center gap-3 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="font-medium">Impact</span>
              </Link>
              <Link
                href="/meetings"
                className="flex items-center gap-3 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Meetings</span>
              </Link>
              <Link
                href="/blog"
                className="flex items-center gap-3 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Blog</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-3 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="font-medium">Contact</span>
              </Link>
              <Link
                href="/donate"
                className="flex items-center gap-3 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Donate</span>
              </Link>

              {/* User Section */}
              {session ? (
                <>
                  <div className="border-t border-blue-700 my-2 pt-2">
                    <div className="px-4 py-2">
                      <p className="text-xs text-blue-300 uppercase font-semibold mb-1">Signed in as</p>
                      <p className="text-white font-medium">{session.user?.name}</p>
                      <p className="text-sm text-blue-300">{session.user?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 text-white hover:bg-blue-800 px-4 py-3 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">My Dashboard</span>
                  </Link>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-3 text-white hover:bg-blue-800 px-4 py-3 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="font-medium">My Meetings</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 text-white hover:bg-blue-800 px-4 py-3 rounded-lg transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Users className="w-5 h-5" />
                      <span className="font-medium">Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setShowMobileMenu(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="flex items-center gap-3 w-full text-red-400 hover:bg-red-900/20 px-4 py-3 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 bg-white text-blue-900 px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors mt-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}