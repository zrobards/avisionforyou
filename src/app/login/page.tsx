'use client'

import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import { Heart, ArrowRight, Lock, Mail } from 'lucide-react'
import Image from 'next/image'

function LoginContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
  const errorParam = searchParams?.get('error')

  // Show error from URL if present
  useEffect(() => {
    if (errorParam) {
      let errorMessage = 'Sign in failed. Please try again.'
      if (errorParam === 'Callback') {
        errorMessage = 'Authentication error occurred. Please try signing in again.'
      } else if (errorParam === 'OAuthSignin') {
        errorMessage = 'Error initiating sign in. Please try again.'
      } else if (errorParam === 'OAuthCallback') {
        errorMessage = 'Error processing sign in. Please try again.'
      } else if (errorParam === 'OAuthCreateAccount') {
        errorMessage = 'Error creating account. Please try again.'
      } else if (errorParam === 'EmailCreateAccount') {
        errorMessage = 'Error creating account. Please try again.'
      } else if (errorParam === 'Callback') {
        errorMessage = 'Error in authentication callback. Please try again.'
      } else if (errorParam === 'OAuthAccountNotLinked') {
        errorMessage = 'This account is already linked to another account.'
      } else if (errorParam === 'EmailSignin') {
        errorMessage = 'Error sending email. Please try again.'
      } else if (errorParam === 'CredentialsSignin') {
        errorMessage = 'Invalid credentials. Please try again.'
      } else if (errorParam === 'SessionRequired') {
        errorMessage = 'Please sign in to access this page.'
      }
      setError(errorMessage)
    }
  }, [errorParam])

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(callbackUrl)
    }
  }, [status, session, router, callbackUrl])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      if (result?.error) {
        setError('Invalid credentials. Please try again.')
        setLoading(false)
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (err) {
      console.error('Sign in error:', err)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple via-purple-800 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-brand-purple to-purple-900 border-b border-purple-700 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <Heart className="w-6 h-6 text-brand-green" />
            <span className="text-white">A Vision For You</span>
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-purple-200 text-sm">New to our community?</p>
            <Link 
              href="/" 
              className="text-brand-green hover:text-green-300 font-medium transition-colors flex items-center gap-1"
            >
              Learn More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-16">
        <noscript>
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-900 rounded-lg p-4 mb-6 text-sm">
            JavaScript is required to sign in. Please enable JavaScript and refresh this page.
          </div>
        </noscript>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-purple-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full mb-4 shadow-lg">
              <Heart className="w-8 h-8 text-brand-green" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-purple-200">Sign in to your recovery journey</p>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              setError('')
              // signIn with redirect: true will automatically redirect to Google
              signIn('google', { 
                callbackUrl,
                redirect: true 
              }).catch((err) => {
                console.error('Google sign in error:', err)
                setError('Failed to sign in with Google. Please try again.')
                setLoading(false)
              })
            }}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-800 font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mb-6 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Redirecting...' : 'Sign in with Google'}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800 text-slate-400">Or continue with email</span>
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-purple to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Lock className="w-5 h-5" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Info */}
          <div className="bg-slate-800/50 border border-purple-700 rounded-lg p-4 mt-6">
            <p className="text-xs text-purple-200 text-center">
              🔐 Your data is encrypted and secure.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-purple-200 text-sm">
              Don't have an account?{' '}
              <Link href="/" className="text-brand-green hover:text-green-300 font-semibold transition-colors">
                Contact us
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-brand-green">100%</div>
            <p className="text-xs text-purple-200 mt-1">Secure</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-green">Free</div>
            <p className="text-xs text-purple-200 mt-1">To Join</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-green">24/7</div>
            <p className="text-xs text-purple-200 mt-1">Support</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-brand-purple via-purple-800 to-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-purple-700">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-700 rounded-full mb-4 animate-pulse" />
              <div className="h-8 bg-slate-700 rounded w-2/3 mx-auto mb-2 animate-pulse" />
              <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-12 bg-slate-700 rounded-lg animate-pulse" />
              <div className="h-12 bg-slate-700 rounded-lg animate-pulse" />
              <div className="h-12 bg-slate-700 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
