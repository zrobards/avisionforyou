'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  imageUrl: string | null
  readTimeMinutes: number | null
  publishedAt: string | null
  author: { name: string | null }
}

export default function BlogSearch({ posts }: { posts: Post[] }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))]

  const filtered = posts.filter(post => {
    const matchesSearch = !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      (post.excerpt || '').toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition"
            aria-label="Search blog posts"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              !selectedCategory ? 'bg-brand-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat ? 'bg-brand-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {search && (
        <p className="text-gray-500 text-sm mb-4">
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'} {search && `for "${search}"`}
        </p>
      )}

      {/* Posts Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts found matching your search.</p>
          {search && (
            <button onClick={() => { setSearch(''); setSelectedCategory(null) }} className="text-brand-purple hover:underline mt-2">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <article className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {post.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
