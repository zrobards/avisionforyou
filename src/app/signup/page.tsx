'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useEffect } from 'react'
import { Heart, Chrome } from 'lucide-react'

export default function SignUp() {
  useEffect(() => {
    // Automatically trigger Google sign in on load
    const timer = setTimeout(() => {
      signIn('google', { callbackUrl: '/dashboard' })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <Heart className="w-6 h-6 text-red-500" />
            <span className="text-white">A Vision For You</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-16">
        {/* Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4 shadow-lg animate-pulse">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join Our Community</h1>
            <p className="text-slate-400">Start your recovery journey today</p>
          </div>

          {/* Loading state */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4 animate-spin">
              <div className="w-8 h-8 bg-slate-900 rounded-full"></div>
            </div>
            <p className="text-slate-300 mb-4">Redirecting to Google Sign In...</p>
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full bg-white text-slate-900 font-bold py-4 px-6 rounded-lg hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>
          </div>

          {/* Info */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mt-6">
            <p className="text-xs text-slate-400 text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8">
          <h3 className="text-white font-semibold mb-4 text-center">Why Join Us?</h3>
          <div className="space-y-3">
            {[
              '✓ Anonymous & Confidential Support',
              '✓ Access to Recovery Programs',
              '✓ Community Peer Support',
              '✓ Personalized Program Matching'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
