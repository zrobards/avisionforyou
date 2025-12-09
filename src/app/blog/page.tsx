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
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog')
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-2xl font-bold">A Vision For You</Link>
            <nav className="hidden md:flex gap-8">
              <Link href="/programs" className="hover:text-blue-200 transition">Programs</Link>
              <Link href="/about" className="hover:text-blue-200 transition">About</Link>
              <Link href="/team" className="hover:text-blue-200 transition">Team</Link>
              <Link href="/donate" className="text-yellow-300 font-bold hover:text-yellow-200 transition">Donate</Link>
            </nav>
          </div>
          <h1 className="text-4xl font-bold">Recovery Stories & Resources</h1>
          <p className="text-blue-100 mt-2">Insights, experiences, and guidance for your recovery journey</p>
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
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                      <span className="text-gray-500 text-sm">{post.readTimeMinutes} min read</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">
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
    date: 'Jan 6, 2025',
    readTime: '3 min read',
    category: 'Treatment'
  },
  {
    id: 7,
    title: 'Navigating Addiction Recovery in Louisville, KY: A Comprehensive Guide',
    excerpt: 'A comprehensive guide to resources and support available for those seeking recovery in Louisville.',
    author: 'Lucas Bennett',
    date: 'Jan 6, 2025',
    readTime: '3 min read',
    category: 'Guide'
  },
  {
    id: 8,
    title: 'Addiction Treatment: Is Suboxone the gold standard?',
    excerpt: 'By Lucas Bennett, Evan Massey MD, Charles Wilbert APRN-CNP, Henry Fuqua CADC - A detailed discussion of narcotics and addiction treatment.',
    author: 'Lucas Bennett & Team',
    date: 'Dec 31, 2024',
    readTime: '5 min read',
    category: 'Medical'
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Vision For You
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link href="/meetings" className="text-gray-700 hover:text-blue-600 font-medium">
              Find Meetings
            </Link>
            <Link href="/blog" className="text-blue-600 font-medium">
              Resources
            </Link>
            <Link href="/donate" className="text-gray-700 hover:text-blue-600 font-medium">
              Support Us
            </Link>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-3">Recovery Resources</h1>
          <p className="text-blue-100">Learn, grow, and connect with inspiring stories and expert guidance.</p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">All Posts</h2>
          <div className="grid grid-cols-1 gap-8">
            {BLOG_POSTS.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden border-l-4 border-blue-600">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                      <span>{post.readTime}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <Link href={`/blog/${post.id}`}>
                    <h2 className="text-2xl font-bold mb-3 text-gray-900 hover:text-blue-600 transition">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <p className="text-gray-500 text-sm font-medium">{post.author}</p>
                    <Link href={`/blog/${post.id}`} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition inline-block">
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 A Vision For You Recovery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
