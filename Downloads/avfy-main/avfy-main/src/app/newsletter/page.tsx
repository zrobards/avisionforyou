'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Mail, Calendar, User, ChevronRight } from 'lucide-react'

interface Newsletter {
  id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  imageUrl?: string
  author: {
    name: string
  }
}

export default function NewsletterPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNewsletters()
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchNewsletters, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchNewsletters = async () => {
    try {
      const response = await fetch('/api/newsletter', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setNewsletters(data)
      }
    } catch (error) {
      console.error('Failed to fetch newsletters:', error)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="w-12 h-12 text-brand-purple" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Newsletters</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with our latest news, stories, and community updates
          </p>
        </div>

        {/* Newsletter Grid */}
        {newsletters.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No newsletters published yet.</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for updates!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {newsletters.map((newsletter) => (
              <Link
                key={newsletter.id}
                href={`/newsletter/${newsletter.slug}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-brand-purple"
              >
                {newsletter.imageUrl && (
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                    <img
                      src={newsletter.imageUrl}
                      alt={newsletter.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-purple transition-colors line-clamp-2">
                    {newsletter.title}
                  </h2>
                  
                  {newsletter.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{newsletter.excerpt}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{newsletter.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(newsletter.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-brand-purple font-semibold group-hover:gap-3 transition-all">
                    <span>Read More</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
