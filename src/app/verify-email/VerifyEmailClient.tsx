'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Heart, CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'no-token'>('verifying')
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    if (!token || !email) {
      setStatus('no-token')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
        })

        const data = await res.json()

        if (res.ok) {
          setStatus('success')
          setMessage(data.message)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed.')
        }
      } catch {
        setStatus('error')
        setMessage('An unexpected error occurred.')
      }
    }

    verify()
  }, [token, email])

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    setResendMessage('')
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setResendMessage(data.message || 'Verification email sent.')
    } catch {
      setResendMessage('Failed to resend. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple via-purple-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-purple-700 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full mb-6 shadow-lg">
            <Heart className="w-8 h-8 text-brand-green" />
          </div>

          {status === 'verifying' && (
            <>
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Verifying Your Email</h1>
              <p className="text-purple-200">Please wait...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-purple-200 mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-block bg-gradient-to-r from-brand-purple to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-8 rounded-lg transition-all"
              >
                Sign In Now
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-red-300 mb-6">{message}</p>
              {email && (
                <div className="space-y-3">
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full bg-gradient-to-r from-brand-purple to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                  {resendMessage && (
                    <p className="text-green-300 text-sm">{resendMessage}</p>
                  )}
                </div>
              )}
              <Link
                href="/login"
                className="inline-block mt-4 text-purple-300 hover:text-white transition-colors text-sm"
              >
                Back to Sign In
              </Link>
            </>
          )}

          {status === 'no-token' && (
            <>
              <Mail className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-purple-200 mb-6">
                We sent a verification link to your email address. Click the link to activate your account.
              </p>
              <p className="text-purple-300 text-sm">
                Didn&apos;t receive it? Check your spam folder or{' '}
                <Link href="/login" className="text-brand-green hover:text-green-300 font-semibold">
                  try signing in
                </Link>{' '}
                to request a new link.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-brand-purple via-purple-800 to-slate-900 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
