'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TIKTOK_HANDLE, TIKTOK_USERNAME, normalizeTikTokStat } from '@/lib/social'

interface SocialStat {
  followers: number
  handle: string
  url: string
}

const FALLBACK_TIKTOK: SocialStat = normalizeTikTokStat()

export default function TikTokProfileEmbed() {
  const [tiktok, setTikTok] = useState<SocialStat>(FALLBACK_TIKTOK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTikTokStats = async () => {
      try {
        const response = await fetch('/api/public/social-stats', { cache: 'no-store' })
        if (!response.ok) {
          return
        }

        const data = await response.json()
        if (data?.tiktok) {
          setTikTok(normalizeTikTokStat(data.tiktok))
        }
      } catch (error) {
        console.error('Failed to load TikTok stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTikTokStats()
  }, [])

  const recentVideoLabel = loading ? 'Loading latest account data...' : 'Recent videos and profile metrics refresh from TikTok as new posts are added.'

  return (
    <section className="py-20 bg-gradient-to-br from-gray-950 via-gray-900 to-brand-purple text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-green mb-4">TikTok</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-5">See Our Recovery Community In Motion</h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl">
              The homepage now shows the live TikTok profile embed instead of a plain link, so visitors can preview the account and recent content without leaving the site.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-2">Account</p>
                <p className="text-xl font-bold">{tiktok.handle}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-2">Followers</p>
                <p className="text-xl font-bold">{tiktok.followers.toLocaleString()}</p>
              </div>
            </div>

            <p className="text-sm text-white/70 mb-6">{recentVideoLabel}</p>

            <div className="flex flex-wrap gap-4">
              <a
                href={tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-gray-950 transition hover:bg-brand-green hover:text-white"
              >
                Open TikTok Profile
              </a>
              <Link
                href="/social"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                View All Social Channels
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white p-2 sm:p-3 shadow-2xl">
            <div className="flex min-h-[390px] justify-center overflow-hidden rounded-xl bg-white sm:min-h-[480px]">
              <iframe
                title={`${TIKTOK_HANDLE} TikTok profile`}
                src={`https://www.tiktok.com/embed/@${TIKTOK_USERNAME}`}
                className="h-[390px] w-full max-w-[780px] border-0 bg-white sm:h-[480px]"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
