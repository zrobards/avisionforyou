'use client';

import Link from 'next/link';
import { ArrowLeft, Share2, Twitter, Facebook, Linkedin, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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
  tags?: string
  author: {
    name: string
    image?: string
  }
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.id as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
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
        // Fetch related posts after getting the current post
        fetchRelatedPosts(data)
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedPosts = async (currentPost: BlogPost) => {
    try {
      const response = await fetch('/api/blog')
      if (response.ok) {
        const allPosts: BlogPost[] = await response.json()
        
        // Filter and score posts by relevance
        const scored = allPosts
          .filter(p => p.slug !== currentPost.slug) // Exclude current post
          .map(p => {
            let score = 0
            
            // Same category gets +3 points
            if (p.category === currentPost.category) score += 3
            
            // Matching tags get +1 point each
            try {
              const currentTags = currentPost.tags ? JSON.parse(currentPost.tags) : []
              const postTags = p.tags ? JSON.parse(p.tags) : []
              const commonTags = currentTags.filter((tag: string) => postTags.includes(tag))
              score += commonTags.length
            } catch {}
            
            return { post: p, score }
          })
          .filter(item => item.score > 0) // Only posts with some relevance
          .sort((a, b) => b.score - a.score) // Sort by relevance
          .slice(0, 3) // Take top 3
          .map(item => item.post)
        
        setRelatedPosts(scored)
      }
    } catch (error) {
      console.error('Failed to fetch related posts:', error)
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
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center text-purple-200 hover:text-white mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Post Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-gradient-to-r from-brand-purple to-brand-green text-white px-4 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
            <span className="text-gray-500">{post.readTimeMinutes} min read</span>
            <span className="flex items-center gap-1 text-gray-500">
              <Eye className="w-4 h-4" />
              {post.views} views
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {post.author.image && (
                <img 
                  src={post.author.image} 
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full"
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
          <div className="mb-8 rounded-xl overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-12 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <Link 
                  key={relatedPost.slug} 
                  href={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
                    {relatedPost.imageUrl && (
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={relatedPost.imageUrl} 
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <span className="inline-block bg-purple-100 text-brand-purple px-2 py-1 rounded text-xs font-medium mb-2">
                        {relatedPost.category}
                      </span>
                      <h4 className="font-bold text-gray-900 mb-2 group-hover:text-brand-purple transition line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                      <div className="mt-3 text-xs text-gray-500">
                        {relatedPost.readTimeMinutes} min read
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white text-center">
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
