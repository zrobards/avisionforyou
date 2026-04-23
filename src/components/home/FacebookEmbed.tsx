'use client'

import { useEffect, useRef, useState } from 'react'

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/avfyrecovery'

type FacebookWindow = Window & {
  FB?: {
    XFBML: {
      parse: () => void
    }
  }
}

export default function FacebookEmbed() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [width, setWidth] = useState(500)

  useEffect(() => {
    const fbWindow = window as FacebookWindow

    // Measure container width for responsive embed
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth
      // Facebook plugin max width is 500px
      setWidth(Math.min(w, 500))
    }

    // Load Facebook SDK if not already loaded
    if (!fbWindow.FB) {
      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v21.0'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      script.onload = () => {
        setLoaded(true)
      }
      document.body.appendChild(script)
    } else {
      fbWindow.FB.XFBML.parse()
      setLoaded(true)
    }

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth
        setWidth(Math.min(w, 500))
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Re-parse when loaded state changes
  useEffect(() => {
    const fbWindow = window as FacebookWindow
    if (loaded && fbWindow.FB) {
      fbWindow.FB.XFBML.parse()
    }
  }, [loaded, width])

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center gap-3">
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span className="text-white font-semibold">A Vision For You on Facebook</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-2 bg-gray-50 overflow-hidden">
        <div
          className="fb-page"
          data-href={FACEBOOK_PAGE_URL}
          data-tabs="timeline"
          data-width={width}
          data-height="500"
          data-small-header="false"
          data-adapt-container-width="true"
          data-hide-cover="false"
          data-show-facepile="true"
        >
          <blockquote cite={FACEBOOK_PAGE_URL} className="fb-xfbml-parse-ignore">
            <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer">
              A Vision For You Recovery
            </a>
          </blockquote>
        </div>
        {!loaded && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading Facebook feed...</p>
          </div>
        )}
      </div>
    </div>
  )
}
