'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Facebook, ExternalLink } from 'lucide-react'

// ── Constants ──────────────────────────────────────────────────────────────────

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/avisionforyourecovery'
const FACEBOOK_HANDLE = 'A Vision For You Recovery'

// ── Facebook SDK Loader ────────────────────────────────────────────────────────

function useFacebookSDK() {
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [sdkError, setSdkError] = useState(false)

  useEffect(() => {
    // If already loaded
    if (typeof window !== 'undefined' && window.FB) {
      setSdkLoaded(true)
      return
    }

    // Set up the async init callback
    window.fbAsyncInit = function () {
      window.FB.init({
        xfbml: true,
        version: 'v19.0',
      })
      setSdkLoaded(true)
    }

    // Check if the script is already being loaded
    if (document.getElementById('facebook-jssdk')) {
      return
    }

    // Load the SDK
    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.onerror = () => {
      console.error('Failed to load Facebook SDK')
      setSdkError(true)
    }

    document.body.appendChild(script)

    return () => {
      // Cleanup not needed — SDK persists across navigations
    }
  }, [])

  return { sdkLoaded, sdkError }
}

// ── Fallback Component ─────────────────────────────────────────────────────────

function FacebookFallback() {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
        <Facebook className="w-12 h-12 text-white mx-auto mb-3" aria-hidden="true" />
        <h3 className="text-xl font-bold text-white mb-2">Follow Us on Facebook</h3>
        <p className="text-white/80 text-sm max-w-md mx-auto">
          Stay connected with our community — see events, recovery stories, program
          updates, and daily inspiration on our Facebook page.
        </p>
      </div>
      <div className="p-6 space-y-4">
        {[
          { title: 'Community Events', desc: 'Workshops, gatherings, and celebrations.' },
          { title: 'Recovery Stories', desc: 'Real journeys of hope and transformation.' },
          { title: 'Program Updates', desc: 'Latest news from our IOP, Surrender Program, and more.' },
        ].map((item) => (
          <a
            key={item.title}
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Facebook className="w-4 h-4 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {item.title}
              </p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500 mt-1 ml-auto flex-shrink-0 transition-colors" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function FacebookFeed() {
  const { sdkLoaded, sdkError } = useFacebookSDK()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(500)

  // Measure container width for responsive embed
  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth
      // Facebook Page Plugin max width is 500px
      setContainerWidth(Math.min(width, 500))
    }
  }, [])

  useEffect(() => {
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [updateWidth])

  // Re-parse XFBML when SDK loads or container width changes
  useEffect(() => {
    if (sdkLoaded && window.FB) {
      window.FB.XFBML.parse(containerRef.current ?? undefined)
    }
  }, [sdkLoaded, containerWidth])

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

        {/* Facebook Page Plugin embed */}
        <div ref={containerRef} className="flex justify-center">
          {sdkError ? (
            <FacebookFallback />
          ) : (
            <div
              className="fb-page"
              data-href={FACEBOOK_PAGE_URL}
              data-tabs="timeline"
              data-width={containerWidth}
              data-height="600"
              data-small-header="false"
              data-adapt-container-width="true"
              data-hide-cover="false"
              data-show-facepile="true"
            >
              <blockquote
                cite={FACEBOOK_PAGE_URL}
                className="fb-xfbml-parse-ignore"
              >
                <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer">
                  {FACEBOOK_HANDLE}
                </a>
              </blockquote>
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

// ── Type Augmentation ──────────────────────────────────────────────────────────

declare global {
  interface Window {
    FB: {
      init: (params: { xfbml: boolean; version: string }) => void
      XFBML: {
        parse: (element?: Element) => void
      }
    }
    fbAsyncInit: () => void
  }
}
