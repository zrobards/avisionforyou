import Link from 'next/link'
import { Mail, Calendar, User, ChevronRight } from 'lucide-react'
import { db } from '@/lib/db'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/shared/Breadcrumbs'

export const revalidate = 300 // 5 min ISR

export const metadata: Metadata = {
  title: 'Newsletters | A Vision For You',
  description: 'Stay updated with the latest news, recovery stories, and community updates from A Vision For You in Louisville, KY.',
}

async function getNewsletters() {
  try {
    return await db.newsletter.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: {
          select: { name: true }
        }
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    })
  } catch {
    return []
  }
}

export default async function NewsletterPage() {
  const newsletters = await getNewsletters()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Newsletter' },
        ]}
      />

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
                        <span>{newsletter.publishedAt ? new Date(newsletter.publishedAt).toLocaleDateString() : ''}</span>
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
