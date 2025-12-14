'use client'

import { ReactNode } from 'react'
import Navbar from '@/components/layout/Navbar'

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
