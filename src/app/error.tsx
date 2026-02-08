'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Heart, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error.digest || error.message)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
          <Heart className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Something Went Wrong</h1>
        <p className="text-purple-200 mb-8">
          We encountered an unexpected error. Please try again or return to the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-purple text-white rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-purple-400 text-purple-200 rounded-lg font-semibold hover:bg-purple-800/50 transition"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
        <p className="text-purple-300/60 text-sm mt-8">
          If this problem persists, call us at{' '}
          <a href="tel:+15027496344" className="text-brand-green hover:underline">(502) 749-6344</a>
        </p>
      </div>
    </div>
  )
}
