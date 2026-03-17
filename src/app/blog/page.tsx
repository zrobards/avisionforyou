import { db } from '@/lib/db'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import BlogSearch from './BlogSearch'

export const revalidate = 300 // 5 min ISR

export const metadata: Metadata = {
  title: 'Recovery Stories & Resources | A Vision For You',
  description: 'Read recovery stories, resources, and guidance for your addiction recovery journey from A Vision For You in Louisville, KY.',
  openGraph: {
    title: 'Recovery Stories & Resources | A Vision For You',
    description: 'Read recovery stories, resources, and guidance for your addiction recovery journey.',
    images: [{ url: '/AVFY%20LOGO.jpg', width: 1200, height: 630, alt: 'A Vision For You' }],
  },
}

async function getPosts() {
  try {
    return await db.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: {
          select: { name: true }
        }
      },
      orderBy: { publishedAt: 'desc' },
    })
  } catch {
    return []
  }
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Blog' },
        ]}
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold">Recovery Stories & Resources</h1>
          <p className="text-purple-100 mt-2">Insights, experiences, and guidance for your recovery journey</p>
        </div>
      </header>

      {/* Blog Posts */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <BlogSearch posts={posts.map(p => ({
          ...p,
          publishedAt: p.publishedAt?.toISOString() || null,
        }))} />
      </section>
    </div>
  )
}
