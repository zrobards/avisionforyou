'use client'

import { SessionProvider } from 'next-auth/react'
import React from 'react'

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'

  const bypassSession = bypassAuth
    ? {
        user: {
          id: 'bypass-review',
          name: 'Review Admin',
          email: 'admin@avisionforyou.org',
          role: 'ADMIN'
        },
        expires: '2099-01-01T00:00:00.000Z'
      }
    : undefined

  return <SessionProvider session={bypassSession as any}>{children}</SessionProvider>
}
