'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Instagram, ExternalLink, Calendar, Users, Heart, Star, Lightbulb, Megaphone } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface InstagramPost {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
}

interface PlaceholderCard {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
}

// ── Constants ──────────────────────────────────────────────────────────────────

const INSTAGRAM_URL = 'https://www.instagram.com/avision_foryourecovery/'
const INSTAGRAM_HANDLE = '@avision_foryourecovery'

const PLACEHOLDER_CARDS: PlaceholderCard[] = [
  {
    title: 'Community Events',
    description: 'Workshops, gatherings, and celebrations that bring our recovery community together.',
    icon: Calendar,
    gradient: 'from-purple-600 to-purple-800',
  },
  {
    title: 'Recovery Stories',
    description: 'Real journeys of hope and transformation shared by our community members.',
    icon: Heart,
    gradient: 'from-pink-500 to-purple-600',
  },
  {
    title: 'Program Updates',
    description: 'The latest news from our IOP, Surrender Program, and more.',
    icon: Megaphone,
    gradient: 'from-purple-700 to-indigo-700',
  },
  {
    title: 'Volunteer Highlights',
    description: 'Spotlighting the incredible people who give their time to support recovery.',
    icon: Users,
    gradient: 'from-green-600 to-teal-600',
  },
  {
    title: 'Success Stories',
    description: 'Celebrating milestones, graduations, and the victories of recovery.',
    icon: Star,
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    title: 'Daily Inspiration',
    description: 'Motivational quotes, affirmations, and encouragement for every step of the journey.',
    icon: Lightbulb,
    gradient: 'from-brand-green to-green-600',
  },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function StaticPlaceholderGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {PLACEHOLDER_CARDS.map((card) => {
        const IconComponent = card.icon
        return (
          <a
            key={card.title}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${card.title} - View on Instagram`}
            className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            {/* Card gradient header */}
            <div
              className={`bg-gradient-to-br ${card.gradient} p-5 flex items-center gap-3`}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">{card.title}</h3>
            </div>

            {/* Card body */}
            <div className="p-5">
              <p className="text-gray-600 text-sm leading-relaxed">
                {card.description}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-brand-purple text-sm font-semibold group-hover:gap-2.5 transition-all">
                <span>View on Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-brand-purple/0 group-hover:bg-brand-purple/5 transition-colors duration-300 pointer-events-none" />
          </a>
        )
      })}
    </div>
  )
}

function LivePostsGrid({ posts }: { posts: InstagramPost[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.slice(0, 6).map((post) => {
        const imageUrl =
          post.media_type === 'VIDEO' && post.thumbnail_url
            ? post.thumbnail_url
            : post.media_url

        const captionPreview = post.caption
          ? post.caption.length > 80
            ? `${post.caption.substring(0, 80)}...`
            : post.caption
          : ''

        return (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              post.caption
                ? `Instagram post: ${post.caption.substring(0, 60)}`
                : 'View Instagram post'
            }
            className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <Image
              src={imageUrl}
              alt={post.caption ? post.caption.substring(0, 120) : 'Instagram post from A Vision For You'}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            {/* Hover overlay with caption */}
            <div className="absolute inset-0 bg-brand-purple/0 group-hover:bg-brand-purple/70 transition-colors duration-300 flex items-end">
              <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                {captionPreview && (
                  <p className="text-white text-sm line-clamp-3">
                    {captionPreview}
                  </p>
                )}
                <p className="text-white/80 text-xs mt-2">
                  {new Date(post.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Video indicator */}
            {post.media_type === 'VIDEO' && (
              <div className="absolute top-3 right-3 bg-black/50 rounded-full p-1.5 backdrop-blur-sm">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </a>
        )
      })}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState(false)

  const fetchInstagramPosts = useCallback(async (token: string) => {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${token}`
      )

      if (!response.ok) {
        throw new Error(`Instagram API returned ${response.status}`)
      }

      const data: { data: InstagramPost[] } = await response.json()

      if (data.data && data.data.length > 0) {
        setPosts(data.data)
        setIsLive(true)
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Failed to fetch Instagram posts:', err)
      setError(true)
    }
  }, [])

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_INSTAGRAM_TOKEN

    if (token) {
      fetchInstagramPosts(token)
    }
  }, [fetchInstagramPosts])

  // Determine whether to show live posts or the static placeholder
  const showLivePosts = isLive && posts.length > 0 && !error

  return (
    <section
      className="py-16 bg-gradient-to-b from-white to-purple-50/50"
      aria-labelledby="instagram-feed-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-400 mb-4">
            <Instagram className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h2
            id="instagram-feed-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          >
            See What We&apos;re Up To
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Follow along with our community events, recovery stories, and daily
            inspiration on Instagram.
          </p>
        </div>

        {/* Content grid */}
        {showLivePosts ? (
          <LivePostsGrid posts={posts} />
        ) : (
          <StaticPlaceholderGrid />
        )}

        {/* CTA button */}
        <div className="mt-10 text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow ${INSTAGRAM_HANDLE} on Instagram`}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-brand-purple to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Instagram className="w-5 h-5" aria-hidden="true" />
            <span>Follow {INSTAGRAM_HANDLE}</span>
          </a>
        </div>
      </div>
    </section>
  )
}
