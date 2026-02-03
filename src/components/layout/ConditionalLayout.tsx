'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')
  const isBoardPage = pathname?.startsWith('/board')
  const isCommunityPage = pathname?.startsWith('/community')
  const hideFooter = isAdminPage || isBoardPage || isCommunityPage

  return (
    <>
      {!isAdminPage && <Navbar />}
      {children}
      {!hideFooter && <Footer />}
    </>
  )
}
