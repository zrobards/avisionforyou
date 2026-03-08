'use client'

import { useState } from 'react'
import { Facebook } from 'lucide-react'

// ── Constants ──────────────────────────────────────────────────────────────────

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/avisionforyourecovery'
const FACEBOOK_HANDLE = 'A Vision For You Recovery'

// Facebook Page Plugin iframe — no App ID or SDK required
const EMBED_URL =
  'https://www.facebook.com/plugins/page.php?' +
  'href=https%3A%2F%2Fwww.facebook.com%2Favisionforyourecovery' +
  '&tabs=timeline%2Cevents' +
  '&width=500' +
  '&height=700' +
  '&small_header=false' +
  '&adapt_container_width=true' +
  '&hide_cover=false' +
  '&show_facepile=true'

// ── Main Component ─────────────────────────────────────────────────────────────

export default function FacebookFeed() {
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeFailed, setIframeFailed] = useState(false)

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

        {/* Facebook Page Plugin iframe embed */}
        <div className="flex justify-center">
          {!iframeFailed ? (
            <div className="relative w-full max-w-[500px]">
              {/* Loading skeleton while iframe loads */}
              {!iframeLoaded && (
                <div className="absolute inset-0 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-4 z-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                  <p className="text-gray-500 text-sm">Loading Facebook feed...</p>
                </div>
              )}
              <iframe
                src={EMBED_URL}
                width="500"
                height="700"
                style={{
                  border: 'none',
                  overflow: 'hidden',
                  maxWidth: '100%',
                  borderRadius: '12px',
                  background: '#fff',
                }}
                scrolling="no"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                title="A Vision For You Recovery Facebook Page"
                onLoad={() => setIframeLoaded(true)}
                onError={() => setIframeFailed(true)}
              />
            </div>
          ) : (
            /* Fallback if iframe fails */
            <div className="w-full max-w-[500px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#1877F2] px-5 py-4 flex items-center gap-3">
                <Facebook className="w-6 h-6 text-white" aria-hidden="true" />
                <span className="text-white font-semibold text-lg">{FACEBOOK_HANDLE}</span>
              </div>
              <div className="p-8 text-center">
                <p className="text-gray-600 mb-4">
                  Visit our Facebook page to see our latest posts, events, and community updates.
                </p>
                <a
                  href={FACEBOOK_PAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1877F2] text-white rounded-lg font-semibold hover:bg-[#166FE5] transition-colors"
                >
                  <Facebook className="w-5 h-5" aria-hidden="true" />
                  View on Facebook
                </a>
              </div>
            </div>
          )}
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
