import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Eye } from 'lucide-react'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ShareButton, BlogContent } from './BlogPostClient'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/shared/Breadcrumbs'

export const revalidate = 300 // 5 min ISR

interface BlogPostPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { id } = await params
  const post = await db.blogPost.findFirst({
    where: { slug: id, status: 'PUBLISHED' },
    select: { title: true, excerpt: true, imageUrl: true },
  })

  if (!post) {
    return { title: 'Post Not Found - A Vision For You' }
  }

  return {
    title: `${post.title} - A Vision For You`,
    description: post.excerpt || 'Recovery stories, resources, and guidance',
    openGraph: {
      title: post.title,
      description: post.excerpt || 'Recovery stories, resources, and guidance',
      ...(post.imageUrl ? { images: [{ url: post.imageUrl }] } : {}),
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params

  const post = await db.blogPost.findFirst({
    where: { slug: id, status: 'PUBLISHED' },
    include: {
      author: {
        select: { name: true, image: true }
      }
    },
  })

  if (!post) {
    notFound()
  }

  // Increment view count (fire-and-forget, don't block render)
  db.blogPost.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  }).catch(() => {})

  // Article JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    image: post.imageUrl || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name || 'A Vision For You',
    },
    publisher: {
      '@type': 'Organization',
      name: 'A Vision For You Inc.',
      url: 'https://avisionforyourecovery.org',
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.title },
        ]}
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/blog" className="inline-flex items-center text-purple-200 hover:text-white mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Post Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-gradient-to-r from-brand-purple to-brand-green text-white px-4 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
            <span className="text-gray-500">{post.readTimeMinutes} min read</span>
            <span className="flex items-center gap-1 text-gray-500">
              <Eye className="w-4 h-4" />
              {(post.views ?? 0)} views
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {post.author.image && (
                <Image
                  src={post.author.image}
                  alt={post.author.name || ''}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                  unoptimized={post.author.image.startsWith('data:')}
                />
              )}
              <div>
                <p className="font-semibold text-gray-900">{post.author.name}</p>
                <p className="text-gray-500 text-sm">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : ''}
                </p>
              </div>
            </div>

            {/* Share Button (client component) */}
            <ShareButton title={post.title} />
          </div>
        </div>

        {/* Featured Image */}
        {post.imageUrl && (
          <div className="relative mb-8 rounded-xl overflow-hidden h-48 sm:h-64 md:h-96">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
              unoptimized={post.imageUrl.startsWith('data:')}
            />
          </div>
        )}

        {/* Content (client component for DOMPurify) */}
        <BlogContent content={post.content} title={post.title} />

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 md:p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Start Your Recovery Journey Today</h3>
          <p className="mb-6 text-blue-100">
            Connect with our supportive community and discover the programs that can help you thrive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/programs"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Explore Programs
            </Link>
            <Link
              href="/meetings"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition"
            >
              View Meetings
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
