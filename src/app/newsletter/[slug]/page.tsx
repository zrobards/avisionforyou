import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowLeft, Mail } from 'lucide-react'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { NewsletterContent } from './NewsletterDetailClient'
import type { Metadata } from 'next'

export const revalidate = 300 // 5 min ISR

interface NewsletterDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: NewsletterDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const newsletter = await db.newsletter.findFirst({
    where: { slug, status: 'PUBLISHED' },
    select: { title: true, excerpt: true, imageUrl: true },
  })

  if (!newsletter) {
    return { title: 'Newsletter Not Found - A Vision For You' }
  }

  return {
    title: `${newsletter.title} - A Vision For You`,
    description: newsletter.excerpt || 'Stay updated with our latest news, stories, and community updates',
    openGraph: {
      title: newsletter.title,
      description: newsletter.excerpt || 'Stay updated with our latest news, stories, and community updates',
      ...(newsletter.imageUrl ? { images: [{ url: newsletter.imageUrl }] } : {}),
    },
  }
}

export default async function NewsletterDetailPage({ params }: NewsletterDetailPageProps) {
  const { slug } = await params

  const newsletter = await db.newsletter.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: {
      author: {
        select: { name: true, email: true }
      }
    },
  })

  if (!newsletter) {
    notFound()
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
              <Image
                src={newsletter.imageUrl}
                alt={newsletter.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
                unoptimized={newsletter.imageUrl.startsWith('data:')}
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
                <time dateTime={newsletter.publishedAt?.toISOString()}>
                  {newsletter.publishedAt
                    ? new Date(newsletter.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : ''}
                </time>
              </div>
            </div>

            {/* Excerpt */}
            {newsletter.excerpt && (
              <div className="text-xl text-gray-700 italic mb-8 pl-4 border-l-4 border-brand-purple">
                {newsletter.excerpt}
              </div>
            )}

            {/* Content (client component for DOMPurify) */}
            <NewsletterContent content={newsletter.content} />
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
