import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

interface LeadCaptureCTAProps {
  title?: string
  subtitle?: string
  variant?: 'default' | 'banner' | 'card'
}

export default function LeadCaptureCTA({
  title = "Am I an Alcoholic or Addict?",
  subtitle = "Take our confidential assessment to explore your path to recovery",
  variant = 'default'
}: LeadCaptureCTAProps) {
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          </div>
          <p className="text-purple-100 mb-6 max-w-xl mx-auto">{subtitle}</p>
          <Link
            href="/login?callbackUrl=/assessment"
            className="inline-block bg-brand-green text-brand-purple px-8 py-3 rounded-lg font-bold hover:bg-green-400 transition"
          >
            Start Assessment
          </Link>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="bg-white border-2 border-brand-purple rounded-lg p-8 text-center shadow-lg hover:shadow-xl transition">
        <AlertCircle className="w-12 h-12 text-brand-purple mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        <Link
          href="/login?callbackUrl=/assessment"
          className="inline-block bg-brand-purple text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-800 transition"
        >
          Take Assessment
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-purple-50 border-l-4 border-brand-purple rounded p-6">
      <div className="flex gap-4">
        <AlertCircle className="w-6 h-6 text-brand-purple flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-700 mb-4">{subtitle}</p>
          <Link
            href="/login?callbackUrl=/assessment"
            className="inline-block bg-brand-purple text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
          >
            Start Now
          </Link>
        </div>
      </div>
    </div>
  )
}
