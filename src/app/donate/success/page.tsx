'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Suspense } from 'react'

function DonationSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          {/* Thank You Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Thank You for Your Generosity!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Your donation has been successfully processed. You will receive a confirmation email shortly with your donation receipt.
          </p>

          {/* Impact Statement */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Impact</h2>
            <p className="text-gray-700 leading-relaxed">
              Your support helps us provide free recovery meetings, evidence-based treatment programs, 
              peer mentorship, and resources for individuals and families affected by addiction. 
              Together, we're making recovery possible for everyone.
            </p>
          </div>

          {/* Transaction ID */}
          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
              <p className="text-xs font-mono text-gray-500 break-all">{sessionId}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
            <Link 
              href="/"
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Return Home
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Questions about your donation?{' '}
              <a href="mailto:donations@avisionforyou.org" className="text-blue-600 hover:text-blue-700">
                Contact us
              </a>
            </p>
          </div>
        </div>

        {/* Follow-up Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link 
            href="/meetings"
            className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition"
          >
            <div className="text-2xl mb-2">📅</div>
            <h3 className="font-semibold text-gray-900 mb-1">Join a Meeting</h3>
            <p className="text-sm text-gray-600">RSVP to upcoming events</p>
          </Link>

          <Link 
            href="/community"
            className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition"
          >
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-900 mb-1">Join Community</h3>
            <p className="text-sm text-gray-600">Connect with others</p>
          </Link>

          <Link 
            href="/blog"
            className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition"
          >
            <div className="text-2xl mb-2">📖</div>
            <h3 className="font-semibold text-gray-900 mb-1">Read Stories</h3>
            <p className="text-sm text-gray-600">Recovery resources</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function DonationSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <DonationSuccessContent />
    </Suspense>
  )
}
