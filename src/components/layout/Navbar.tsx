'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Home, Calendar, BookOpen, Users, DollarSign, LogOut, User, Settings, Menu, X, ChevronDown, Bell } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showAboutDropdown, setShowAboutDropdown] = useState(false)
  const [showBlogDropdown, setShowBlogDropdown] = useState(false)
  const [showMobileAboutMenu, setShowMobileAboutMenu] = useState(false)
  const [showMobileBlogMenu, setShowMobileBlogMenu] = useState(false)
  const userRole = (session?.user as any)?.role
  const isAdmin = userRole === 'ADMIN'
  const isBoard = userRole === 'BOARD' || userRole === 'ADMIN'
  const isAlumni = userRole === 'ALUMNI' || userRole === 'ADMIN'
  const canAccessCommunity = userRole === 'ALUMNI' || userRole === 'BOARD' || userRole === 'ADMIN'

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-brand-purple to-purple-900 border-b border-purple-700 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white hover:opacity-80 transition-opacity">
            <Image 
              src="/avsf-logo.png" 
              alt="A Vision For You" 
              width={80}
              height={80}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain mix-blend-screen"
              style={{ filter: 'brightness(1.2) contrast(1.1)' }}
              priority
            />
            <span>A Vision For You</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link href="/" className="flex items-center gap-1.5 text-white hover:text-brand-green transition-colors text-sm xl:text-base">
              <Home className="w-4 h-4" />
              <span className="hidden xl:inline">Home</span>
            </Link>
            
            {/* About Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setShowAboutDropdown(true)}
              onMouseLeave={() => setShowAboutDropdown(false)}
            >
              <button className="flex items-center gap-1 text-white hover:text-brand-green transition-colors py-2 text-sm xl:text-base">
                About
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {showAboutDropdown && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48">
                    <Link
                      href="/about"
                      className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-brand-purple transition-colors text-sm"
                      onClick={() => setShowAboutDropdown(false)}
                    >
                      About Us
                    </Link>
                    <Link
                      href="/team"
                      className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-brand-purple transition-colors text-sm"
                      onClick={() => setShowAboutDropdown(false)}
                    >
                      Our Team
                    </Link>
                    <Link
                      href="/impact"
                      className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-brand-purple transition-colors text-sm"
                      onClick={() => setShowAboutDropdown(false)}
                    >
                      Our Impact
                    </Link>
                    <Link
                      href="/social"
                      className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-brand-purple transition-colors text-sm"
                      onClick={() => setShowAboutDropdown(false)}
                    >
                      Social Media
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/programs" className="flex items-center gap-1.5 text-white hover:text-brand-green transition-colors text-sm xl:text-base">
              <Calendar className="w-4 h-4" />
              <span className="hidden xl:inline">Programs</span>
            </Link>
            <Link href="/meetings" className="flex items-center gap-1.5 text-white hover:text-brand-green transition-colors text-sm xl:text-base">
              <Users className="w-4 h-4" />
              <span className="hidden xl:inline">Meetings & Groups</span>
            </Link>
            
            {/* Blog Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setShowBlogDropdown(true)}
              onMouseLeave={() => setShowBlogDropdown(false)}
            >
              <button className="flex items-center gap-1 text-white hover:text-brand-green transition-colors py-2 text-sm xl:text-base">
                <BookOpen className="w-4 h-4" />
                <span className="hidden xl:inline">Blog</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {showBlogDropdown && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48">
                    <Link
                      href="/blog"
                      className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-brand-purple transition-colors text-sm"
                      onClick={() => setShowBlogDropdown(false)}
                    >
                      Blog Posts
                    </Link>
                    <Link
                      href="/newsletter"
                      className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-brand-purple transition-colors text-sm"
                      onClick={() => setShowBlogDropdown(false)}
                    >
                      Newsletters
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/contact" className="text-white hover:text-brand-green transition-colors text-sm xl:text-base">
              Contact
            </Link>
            <Link href="/donate" className="flex items-center gap-1.5 text-white hover:text-brand-green transition-colors text-sm xl:text-base">
              <DollarSign className="w-4 h-4" />
              <span className="hidden xl:inline">Donate</span>
            </Link>
            
            {/* Role-based Portal Links */}
            {session && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-purple-600">
                {isBoard && (
                  <Link 
                    href="/board" 
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors font-medium text-xs xl:text-sm"
                    title="Board Portal"
                  >
                    <span className="hidden xl:inline">Board</span>
                    <span className="xl:hidden">📋</span>
                  </Link>
                )}
                
                {canAccessCommunity && (
                  <Link 
                    href="/community" 
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-green text-brand-purple rounded-lg hover:bg-green-400 transition-colors font-medium text-xs xl:text-sm"
                    title="Community"
                  >
                    <span className="hidden xl:inline">Community</span>
                    <span className="xl:hidden">🤝</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {status === 'loading' ? (
              <div className="animate-pulse bg-purple-700 rounded-full w-9 h-9 sm:w-10 sm:h-10"></div>
            ) : session ? (
              <>
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 bg-purple-700 hover:bg-brand-green text-white px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline max-w-[120px] truncate">{session.user?.name || 'Account'}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 transition-colors text-sm"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        My Dashboard
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors text-sm"
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
                        className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
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
                className="hidden md:block bg-brand-green text-brand-purple px-4 xl:px-6 py-2 rounded-lg font-semibold hover:bg-green-400 transition-colors text-sm xl:text-base"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden flex items-center justify-center w-10 h-10 bg-purple-700 hover:bg-brand-green text-white rounded-lg transition-colors"
              aria-label="Toggle menu"
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden absolute left-0 right-0 top-full bg-brand-purple border-t border-purple-700 shadow-xl max-h-[calc(100vh-80px)] overflow-y-auto">
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
              
              {/* About Dropdown for Mobile */}
              <div>
                <button
                  onClick={() => setShowMobileAboutMenu(!showMobileAboutMenu)}
                  className="flex items-center justify-between w-full text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                >
                  <span className="font-medium">About</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showMobileAboutMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showMobileAboutMenu && (
                  <div className="ml-4 mt-2 space-y-2">
                    <Link
                      href="/about"
                      className="flex items-center gap-3 text-purple-100 hover:bg-purple-800 px-4 py-2 rounded-lg transition-colors"
                      onClick={() => {
                        setShowMobileMenu(false)
                        setShowMobileAboutMenu(false)
                      }}
                    >
                      <span className="text-sm">About Us</span>
                    </Link>
                    <Link
                      href="/team"
                      className="flex items-center gap-3 text-purple-100 hover:bg-purple-800 px-4 py-2 rounded-lg transition-colors"
                      onClick={() => {
                        setShowMobileMenu(false)
                        setShowMobileAboutMenu(false)
                      }}
                    >
                      <span className="text-sm">Our Team</span>
                    </Link>
                    <Link
                      href="/impact"
                      className="flex items-center gap-3 text-purple-100 hover:bg-purple-800 px-4 py-2 rounded-lg transition-colors"
                      onClick={() => {
                        setShowMobileMenu(false)
                        setShowMobileAboutMenu(false)
                      }}
                    >
                      <span className="text-sm">Our Impact</span>
                    </Link>
                    <Link
                      href="/social"
                      className="flex items-center gap-3 text-purple-100 hover:bg-purple-800 px-4 py-2 rounded-lg transition-colors"
                      onClick={() => {
                        setShowMobileMenu(false)
                        setShowMobileAboutMenu(false)
                      }}
                    >
                      <span className="text-sm">Social Media</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/programs"
                className="flex items-center gap-3 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Programs</span>
              </Link>
              <Link
                href="/meetings"
                className="flex items-center gap-3 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Meetings & Groups</span>
              </Link>
              
              {/* Blog Dropdown for Mobile */}
              <div>
                <button
                  onClick={() => setShowMobileBlogMenu(!showMobileBlogMenu)}
                  className="flex items-center justify-between w-full text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">Blog</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showMobileBlogMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showMobileBlogMenu && (
                  <div className="ml-4 mt-2 space-y-2">
                    <Link
                      href="/blog"
                      className="flex items-center gap-3 text-purple-100 hover:bg-purple-800 px-4 py-2 rounded-lg transition-colors"
                      onClick={() => {
                        setShowMobileMenu(false)
                        setShowMobileBlogMenu(false)
                      }}
                    >
                      <span className="text-sm">Blog Posts</span>
                    </Link>
                    <Link
                      href="/newsletter"
                      className="flex items-center gap-3 text-purple-100 hover:bg-purple-800 px-4 py-2 rounded-lg transition-colors"
                      onClick={() => {
                        setShowMobileMenu(false)
                        setShowMobileBlogMenu(false)
                      }}
                    >
                      <span className="text-sm">Newsletters</span>
                    </Link>
                  </div>
                )}
              </div>
              
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
                  <div className="border-t border-purple-700 my-2 pt-2">
                    <div className="px-4 py-2">
                      <p className="text-xs text-purple-300 uppercase font-semibold mb-1">Signed in as</p>
                      <p className="text-white font-medium">{session.user?.name}</p>
                      <p className="text-sm text-purple-300">{session.user?.email}</p>
                    </div>
                  </div>
                  
                  {/* Role-based Portal Links */}
                  {isBoard && (
                    <Link
                      href="/board"
                      className="flex items-center gap-3 bg-purple-700 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors font-medium"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <span>📋</span>
                      <span>Board Portal</span>
                    </Link>
                  )}
                  
                  {canAccessCommunity && (
                    <Link
                      href="/community"
                      className="flex items-center gap-3 bg-brand-green text-brand-purple hover:bg-green-400 px-4 py-3 rounded-lg transition-colors font-medium"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <span>🤝</span>
                      <span>Community</span>
                    </Link>
                  )}
                  
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 bg-purple-700 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors font-medium"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Users className="w-5 h-5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 text-white hover:bg-purple-800 px-4 py-3 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">My Dashboard</span>
                  </Link>
                  
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
                  className="flex items-center justify-center gap-2 bg-brand-green text-brand-purple px-4 py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors mt-2"
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