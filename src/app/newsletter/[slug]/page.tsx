'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, ArrowLeft, Mail } from 'lucide-react'

interface Newsletter {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  publishedAt: string
  imageUrl?: string
  author: {
    name: string
    email: string
  }
}

export default function NewsletterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      fetchNewsletter(params.slug as string)
      // Poll for updates every 5 seconds
      const interval = setInterval(() => fetchNewsletter(params.slug as string), 5000)
      return () => clearInterval(interval)
    }
  }, [params.slug])

  const fetchNewsletter = async (slug: string) => {
    try {
      const response = await fetch(`/api/newsletter/${slug}`, { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setNewsletter(data)
      } else if (response.status === 404) {
        router.push('/newsletter')
      }
    } catch (error) {
      console.error('Failed to fetch newsletter:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    )
  }

  if (!newsletter) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Newsletter not found</p>
          <Link href="/newsletter" className="text-brand-purple hover:underline mt-4 inline-block">
            ← Back to Newsletters
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/newsletter"
          className="inline-flex items-center gap-2 text-brand-purple hover:text-purple-800 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Newsletters</span>
        </Link>

        {/* Newsletter Header */}
        <article className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {newsletter.imageUrl && (
            <div className="relative h-64 md:h-96 bg-gradient-to-br from-purple-100 to-blue-100">
              <img
                src={newsletter.imageUrl}
                alt={newsletter.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {newsletter.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8 pb-6 border-b">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-brand-purple" />
                <span className="font-medium">{newsletter.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-purple" />
                <time dateTime={newsletter.publishedAt}>
                  {new Date(newsletter.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </div>

            {/* Excerpt */}
            {newsletter.excerpt && (
              <div className="text-xl text-gray-700 italic mb-8 pl-4 border-l-4 border-brand-purple">
                {newsletter.excerpt}
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-brand-purple hover:prose-a:text-purple-800 prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: newsletter.content.replace(/\n/g, '<br />') }}
            />
          </div>
        </article>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-purple text-white rounded-lg hover:bg-purple-800 transition-colors font-semibold"
          >
            <Mail className="w-5 h-5" />
            View All Newsletters
          </Link>
        </div>
      </div>
    </div>
  )
}
