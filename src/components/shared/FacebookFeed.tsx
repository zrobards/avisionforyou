'use client'

import { ExternalLink } from 'lucide-react'

const TIKTOK_URL = 'https://www.tiktok.com/@lucasbennett1996'
const TIKTOK_HANDLE = '@lucasbennett1996'

export default function FacebookFeed() {
  return (
    <section
      className="py-16 bg-gradient-to-b from-white to-neutral-100"
      aria-labelledby="social-feed-heading"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-black mb-4">
            <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.74 2.89 2.89 0 0 1 2.31-4.64 2.86 2.86 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.54-.05z" />
            </svg>
          </div>
          <h2
            id="social-feed-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          >
            See What We&apos;re Up To
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Follow Lucas on TikTok for community updates, recovery stories, and
            day-to-day moments from A Vision For You.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-black via-neutral-900 to-neutral-800 px-6 py-5 text-white">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.74 2.89 2.89 0 0 1 2.31-4.64 2.86 2.86 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.54-.05z" />
              </svg>
              <span className="font-semibold text-lg">{TIKTOK_HANDLE}</span>
            </div>
          </div>

          <div className="p-8 sm:p-10 text-center">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Watch the latest videos and follow along directly on TikTok.
            </p>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
            >
              <span>Open TikTok</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
