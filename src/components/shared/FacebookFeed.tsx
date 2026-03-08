'use client'

import { Facebook } from 'lucide-react'

// ── Constants ──────────────────────────────────────────────────────────────────

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/avisionforyourecovery'
const FACEBOOK_HANDLE = 'A Vision For You Recovery'

// Build the iframe embed URL for the Facebook Page Plugin
const EMBED_URL = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(FACEBOOK_PAGE_URL)}&tabs=timeline%2Cevents&width=500&height=800&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`

// ── Main Component ─────────────────────────────────────────────────────────────

export default function FacebookFeed() {
  return (
    <section
      className="py-16 bg-gradient-to-b from-white to-blue-50/50"
      aria-labelledby="facebook-feed-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 mb-4">
            <Facebook className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h2
            id="facebook-feed-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          >
            See What We&apos;re Up To
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Follow along with our community events, recovery stories, and daily
            inspiration on Facebook.
          </p>
        </div>

        {/* Facebook Page Plugin — direct iframe embed (no SDK/App ID needed) */}
        <div className="flex justify-center">
          <iframe
            src={EMBED_URL}
            width="500"
            height="800"
            style={{ border: 'none', overflow: 'hidden', maxWidth: '100%' }}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            title="A Vision For You Recovery Facebook Page"
          />
        </div>

        {/* CTA button */}
        <div className="mt-10 text-center">
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow ${FACEBOOK_HANDLE} on Facebook`}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Facebook className="w-5 h-5" aria-hidden="true" />
            <span>Follow Us on Facebook</span>
          </a>
        </div>
      </div>
    </section>
  )
}
