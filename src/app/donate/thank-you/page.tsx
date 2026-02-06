import { Suspense } from 'react'
import ThankYouClient from './thank-you-client'

export default function DonateThankYouPage() {
  return (
    <Suspense fallback={(
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
        <section className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6" />
          <div className="h-10 bg-gray-200 rounded w-2/3 mx-auto mb-4" />
          <div className="h-6 bg-gray-100 rounded w-4/5 mx-auto mb-8" />
          <div className="bg-white rounded-2xl shadow-lg p-8 text-left">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
          </div>
        </section>
      </div>
    )}
    >
      <ThankYouClient />
    </Suspense>
  )
}
