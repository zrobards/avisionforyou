'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Home, Calendar, BookOpen, Users, LogOut, User, Settings, Menu, X, ChevronDown, Heart, Phone } from 'lucide-react'
import { useState } from 'react'
import NotificationBell from '@/components/shared/NotificationBell'

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
  const canAccessCommunity = userRole === 'ALUMNI' || userRole === 'BOARD' || userRole === 'ADMIN'

  return (
    <nav className="sticky top-0 z-50 bg-brand-dark border-b border-white/10 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white hover:opacity-80 transition-opacity">
            <Image
              src="/avsf-logo.png"
              alt="A Vision For You"
              width={80}
              height={80}
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
              style={{ filter: 'brightness(1.2) contrast(1.1)' }}
              priority
            />
            <span className="hidden sm:inline">A Vision For You</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-5">
            <Link href="/" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm">
              <Home className="w-4 h-4" />
              <span className="hidden xl:inline">Home</span>
            </Link>

            {/* About Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setShowAboutDropdown(true)}
              onMouseLeave={() => setShowAboutDropdown(false)}
            >
              <button className="flex items-center gap-1 text-white/70 hover:text-white transition-colors py-2 text-sm">
                About
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showAboutDropdown && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div className="bg-brand-dark-lighter border border-white/10 rounded-xl shadow-2xl py-2 w-48">
                    {[
                      { href: '/about', label: 'About Us' },
                      { href: '/team', label: 'Our Team' },
                      { href: '/impact', label: 'Our Impact' },
                      { href: '/social', label: 'Social Media' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm"
                        onClick={() => setShowAboutDropdown(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/programs" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden xl:inline">Programs</span>
            </Link>
            <Link href="/meetings" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden xl:inline">Meetings</span>
            </Link>

            {/* Blog Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setShowBlogDropdown(true)}
              onMouseLeave={() => setShowBlogDropdown(false)}
            >
              <button className="flex items-center gap-1 text-white/70 hover:text-white transition-colors py-2 text-sm">
                <BookOpen className="w-4 h-4" />
                <span className="hidden xl:inline">Blog</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showBlogDropdown && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div className="bg-brand-dark-lighter border border-white/10 rounded-xl shadow-2xl py-2 w-48">
                    <Link href="/blog" className="block px-4 py-2.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm" onClick={() => setShowBlogDropdown(false)}>
                      Blog Posts
                    </Link>
                    <Link href="/newsletter" className="block px-4 py-2.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm" onClick={() => setShowBlogDropdown(false)}>
                      Newsletters
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/contact" className="text-white/70 hover:text-white transition-colors text-sm">
              Contact
            </Link>

            {/* Prominent Action Buttons */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
              <a
                href="tel:+15027496344"
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600/90 text-white rounded-lg hover:bg-red-600 transition-all text-xs xl:text-sm font-semibold"
                title="Get Help Now"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden xl:inline">Get Help</span>
              </a>
              <Link
                href="/donate"
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-brand-green to-emerald-500 text-white rounded-lg hover:shadow-lg hover:shadow-brand-green/25 hover:scale-105 transition-all text-xs xl:text-sm font-bold"
                title="Donate"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden xl:inline">Donate</span>
              </Link>
            </div>

            {/* Role-based Portal Links */}
            {session && (
              <div className="flex items-center gap-2 ml-1 pl-2 border-l border-white/10">
                {isBoard && <NotificationBell />}
                {isBoard && (
                  <Link
                    href="/board"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium text-xs"
                    title="Board Portal"
                  >
                    <span className="hidden xl:inline">Board</span>
                    <span className="xl:hidden">B</span>
                  </Link>
                )}
                {canAccessCommunity && (
                  <Link
                    href="/community"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-green/20 text-brand-green rounded-lg hover:bg-brand-green/30 transition-colors font-medium text-xs"
                    title="Community"
                  >
                    <span className="hidden xl:inline">Community</span>
                    <span className="xl:hidden">C</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {status === 'loading' ? (
              <div className="animate-pulse bg-white/10 rounded-full w-9 h-9 sm:w-10 sm:h-10" />
            ) : session ? (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline max-w-[120px] truncate">{session.user?.name || 'Account'}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-brand-dark-lighter border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <p className="text-sm font-semibold text-white truncate">{session.user?.name}</p>
                      <p className="text-xs text-white/50 truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      My Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm"
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
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
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
                className="hidden md:block bg-white/10 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition-colors text-sm"
              >
                Sign In
              </Link>
            )}

            {/* Mobile: Donate + Get Help + Menu */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                href="/donate"
                className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-brand-green to-emerald-500 text-white rounded-lg font-bold text-xs"
              >
                <Heart className="w-3.5 h-3.5" />
                Donate
              </Link>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                aria-label="Toggle menu"
                aria-expanded={showMobileMenu}
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden absolute left-0 right-0 top-full bg-brand-dark border-t border-white/10 shadow-xl max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {/* Prominent CTAs at top */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/10">
                <Link
                  href="/donate"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-green to-emerald-500 text-white rounded-xl font-bold text-sm"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Heart className="w-5 h-5" />
                  Donate Now
                </Link>
                <a
                  href="tel:+15027496344"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Phone className="w-5 h-5" />
                  Get Help
                </a>
              </div>

              {/* Navigation Links */}
              <Link href="/" className="flex items-center gap-3 text-white/80 hover:bg-white/10 px-4 py-3 rounded-lg transition-colors" onClick={() => setShowMobileMenu(false)}>
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>

              {/* About Dropdown */}
              <div>
                <button
                  onClick={() => setShowMobileAboutMenu(!showMobileAboutMenu)}
                  className="flex items-center justify-between w-full text-white/80 hover:bg-white/10 px-4 py-3 rounded-lg transition-colors"
                >
                  <span className="font-medium">About</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showMobileAboutMenu ? 'rotate-180' : ''}`} />
                </button>
                {showMobileAboutMenu && (
                  <div className="ml-4 mt-1 space-y-1">
                    {[
                      { href: '/about', label: 'About Us' },
                      { href: '/team', label: 'Our Team' },
                      { href: '/impact', label: 'Our Impact' },
                      { href: '/social', label: 'Social Media' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 text-white/60 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors"
                        onClick={() => { setShowMobileMenu(false); setShowMobileAboutMenu(false) }}
                      >
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/programs" className="flex items-center gap-3 text-white/80 hover:bg-white/10 px-4 py-3 rounded-lg transition-colors" onClick={() => setShowMobileMenu(false)}>
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Programs</span>
              </Link>
              <Link href="/meetings" className="flex items-center gap-3 text-white/80 hover:bg-white/10 px-4 py-3 rounded-lg transition-colors" onClick={() => setShowMobileMenu(false)}>
                <Users className="w-5 h-5" />
                <span className="font-medium">Meetings & Groups</span>
              </Link>

              {/* Blog Dropdown */}
              <div>
                <button
                  onClick={() => setShowMobileBlogMenu(!showMobileBlogMenu)}
                  className="flex items-center justify-between w-full text-white/80 hover:bg-white/10 px-4 py-3 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">Blog</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showMobileBlogMenu ? 'rotate-180' : ''}`} />
                </button>
                {showMobileBlogMenu && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link href="/blog" className="flex items-center gap-3 text-white/60 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors" onClick={() => { setShowMobileMenu(false); setShowMobileBlogMenu(false) }}>
                      <span className="text-sm">Blog Posts</span>
                    </Link>
                    <Link href="/newsletter" className="flex items-center gap-3 text-white/60 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors" onClick={() => { setShowMobileMenu(false); setShowMobileBlogMenu(false) }}>
                      <span className="text-sm">Newsletters</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/contact" className="flex items-center gap-3 text-white/80 hover:bg-white/10 px-4 py-3 rounded-lg transition-colors" onClick={() => setShowMobileMenu(false)}>
                <span className="font-medium">Contact</span>
              </Link>

              {/* User Section */}
              {session ? (
                <div className="border-t border-white/10 mt-3 pt-3">
                  <div className="px-4 py-2">
                    <p className="text-xs text-white/40 uppercase font-semibold mb-1">Signed in as</p>
                    <p className="text-white font-medium">{session.user?.name}</p>
                    <p className="text-sm text-white/40">{session.user?.email}</p>
                  </div>

                  {isBoard && (
                    <Link href="/board" className="flex items-center gap-3 bg-white/10 text-white hover:bg-white/20 px-4 py-3 rounded-lg transition-colors font-medium" onClick={() => setShowMobileMenu(false)}>
                      <span>Board Portal</span>
                    </Link>
                  )}
                  {canAccessCommunity && (
                    <Link href="/community" className="flex items-center gap-3 bg-brand-green/20 text-brand-green hover:bg-brand-green/30 px-4 py-3 rounded-lg transition-colors font-medium mt-1" onClick={() => setShowMobileMenu(false)}>
                      <span>Community</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-3 bg-white/10 text-white hover:bg-white/20 px-4 py-3 rounded-lg transition-colors font-medium mt-1" onClick={() => setShowMobileMenu(false)}>
                      <Users className="w-5 h-5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <Link href="/dashboard" className="flex items-center gap-3 text-white/80 hover:bg-white/10 px-4 py-3 rounded-lg transition-colors mt-1" onClick={() => setShowMobileMenu(false)}>
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">My Dashboard</span>
                  </Link>
                  <button
                    onClick={() => { setShowMobileMenu(false); signOut({ callbackUrl: '/' }) }}
                    className="flex items-center gap-3 w-full text-red-400 hover:bg-red-500/10 px-4 py-3 rounded-lg transition-colors mt-1"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 bg-white/10 text-white px-4 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors mt-3"
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
