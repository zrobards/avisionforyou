'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Facebook } from 'lucide-react'

// ── Constants ──────────────────────────────────────────────────────────────────

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/avisionforyourecovery'
const FACEBOOK_HANDLE = 'A Vision For You Recovery'

// ── Facebook SDK Loader ────────────────────────────────────────────────────────

function useFacebookSDK() {
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [sdkError, setSdkError] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // If already loaded
    if (window.FB) {
      setSdkLoaded(true)
      return
    }

    // Set up the async init callback
    window.fbAsyncInit = function () {
      window.FB.init({
        xfbml: true,
        version: 'v21.0',
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
      setSdkError(true)
    }

    document.body.appendChild(script)
  }, [])

  return { sdkLoaded, sdkError }
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
        <div
          ref={containerRef}
          className="flex justify-center"
        >
          {sdkError ? (
            /* Fallback: direct iframe to Facebook page if SDK is blocked */
            <div className="w-full max-w-[500px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#1877F2] px-5 py-3 flex items-center gap-3">
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
          ) : (
            <div
              className="fb-page"
              data-href={FACEBOOK_PAGE_URL}
              data-tabs="timeline,events"
              data-width={containerWidth}
              data-height="800"
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
