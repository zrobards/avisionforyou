'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  readTimeMinutes: number
  publishedAt: string
  imageUrl?: string
  author: {
    name: string
  }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchPosts, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
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
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold">Recovery Stories & Resources</h1>
          <p className="text-purple-100 mt-2">Insights, experiences, and guidance for your recovery journey</p>
        </div>
      </header>

      {/* Blog Posts */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No blog posts published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <article className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  {post.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-gradient-to-r from-brand-purple to-brand-green text-white px-3 py-1 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                      <span className="text-gray-500 text-sm">{post.readTimeMinutes} min read</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-green transition">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.author.name}</span>
                      <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
