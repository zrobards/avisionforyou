'use client'

import Link from 'next/link'

const BLOG_POSTS = [
  {
    id: 1,
    title: 'The Power of Choosing to Begin Your Recovery Journey',
    excerpt: 'Starting a recovery journey is one of the most courageous decisions a person can make. It marks the beginning of a path toward healing...',
    author: 'Lucas Bennett',
    date: 'Sep 15, 2025',
    readTime: '3 min read',
    category: 'Recovery'
  },
  {
    id: 2,
    title: 'Redeeming the Peer Bond: Navigating Dual Relationships in Recovery Ethically',
    excerpt: 'An exploration of personal relationships in recovery communities and how to navigate them ethically and professionally.',
    author: 'Lucas Bennett',
    date: 'Jun 5, 2025',
    readTime: '5 min read',
    category: 'Ethics'
  },
  {
    id: 3,
    title: 'The Power of Small Donations in Supporting Addiction Recovery Efforts in Louisville KY',
    excerpt: 'In Louisville, Kentucky, community donations play a vital role in supporting recovery programs and transforming lives.',
    author: 'Lucas Bennett',
    date: 'Jun 3, 2025',
    readTime: '4 min read',
    category: 'Community'
  },
  {
    id: 4,
    title: 'A.A.: Cult or Cure? Critical Analysis of Twelve-Step Fellowships in Addiction Recovery',
    excerpt: 'A comprehensive examination of Alcoholics Anonymous and twelve-step programs in the field of addiction treatment.',
    author: 'Lucas Bennett',
    date: 'May 16, 2025',
    readTime: '5 min read',
    category: 'Education'
  },
  {
    id: 5,
    title: 'From Crisis to Hope: How Your Support Fuels Addiction Recovery in Louisville',
    excerpt: 'Community volunteers and supporters make the difference in transforming crisis into hope for those in recovery.',
    author: 'Lucas Bennett',
    date: 'May 16, 2025',
    readTime: '2 min read',
    category: 'Stories'
  },
  {
    id: 6,
    title: 'The Benefits of Behavior Modification Therapy for Addiction Recovery',
    excerpt: 'Exploring therapeutic community circles and behavior modification techniques in addiction treatment.',
    author: 'Lucas Bennett',
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
