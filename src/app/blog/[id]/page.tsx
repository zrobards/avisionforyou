'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Share2, Twitter, Facebook, Linkedin, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  readTimeMinutes: number
  views: number
  publishedAt: string
  imageUrl?: string
  author: {
    name: string
    image?: string
  }
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.id as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleShare = (platform: string) => {
    if (!post) return
    
    const text = post.title
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    }
    
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-brand-purple hover:text-brand-green">
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
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
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                  unoptimized={post.author.image.startsWith('data:')}
                />
              )}
              <div>
                <p className="font-semibold text-gray-900">{post.author.name}</p>
                <p className="text-gray-500 text-sm">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setSharing(!sharing)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>

              {sharing && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-4 flex gap-3 z-10">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-2 hover:bg-blue-50 rounded-lg transition"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-2 hover:bg-blue-50 rounded-lg transition"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="p-2 hover:bg-blue-50 rounded-lg transition"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-blue-700" />
                  </button>
                </div>
              )}
            </div>
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

        {/* Content */}
        <div
          className="prose prose-base sm:prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

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
  );
}
