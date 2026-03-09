'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Heart, ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSent(true)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple via-purple-800 to-slate-900">
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-brand-purple to-purple-900 border-b border-purple-700 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <Heart className="w-6 h-6 text-brand-green" />
            <span className="text-white">A Vision For You</span>
          </Link>
          <Link
            href="/login"
            className="text-brand-green hover:text-green-300 font-medium transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-purple-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full mb-4 shadow-lg">
              <Mail className="w-8 h-8 text-brand-green" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-purple-200">
              {sent
                ? 'Check your email for a reset link'
                : 'Enter your email and we\'ll send you a reset link'}
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
                <p className="text-green-400 text-sm text-center">
                  If an account exists with <strong>{email}</strong>, you&apos;ll receive a password reset link shortly. Check your inbox and spam folder.
                </p>
              </div>
              <div className="text-center">
                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  className="text-brand-green hover:text-green-300 text-sm font-medium transition-colors"
                >
                  Try a different email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="block text-slate-300 text-sm font-semibold mb-2">
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-purple to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-purple-200 text-sm">
              Remember your password?{' '}
              <Link href="/login" className="text-brand-green hover:text-green-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
