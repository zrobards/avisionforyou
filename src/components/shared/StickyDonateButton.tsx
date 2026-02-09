'use client'

import { usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function StickyDonateButton() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Hide on donate page and admin/board pages
  if (pathname === '/donate' || pathname?.startsWith('/admin') || pathname?.startsWith('/board')) {
    return null
  }

  return (
    <Link
      href="/donate"
      className={`fixed z-40 bottom-6 right-6 sm:bottom-8 sm:right-8 bg-gradient-to-r from-brand-green to-emerald-500 text-white px-5 py-3 sm:px-6 sm:py-3.5 rounded-full font-bold shadow-2xl hover:shadow-brand-green/40 hover:scale-105 transition-all duration-300 flex items-center gap-2 group ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
      style={{ animation: visible ? 'donateGlow 3s ease-in-out infinite' : 'none' }}
    >
      <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
      <span className="hidden sm:inline">Donate Now</span>
      <span className="sm:hidden">Donate</span>
    </Link>
  )
}
