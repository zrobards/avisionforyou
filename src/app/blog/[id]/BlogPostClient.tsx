'use client'

import { useState } from 'react'
import { Share2, Twitter, Facebook, Linkedin } from 'lucide-react'
import DOMPurify from 'isomorphic-dompurify'

interface BlogPostClientProps {
  content: string
  title: string
}

export function ShareButton({ title }: { title: string }) {
  const [sharing, setSharing] = useState(false)

  const handleShare = (platform: string) => {
    const shareUrl = window.location.href
    const text = title
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    }

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400')
  }

  return (
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
  )
}

/**
 * Formats raw blog content that may be plain text (no HTML tags) into
 * properly structured HTML with paragraphs.
 */
function formatContent(raw: string): string {
  const sanitized = DOMPurify.sanitize(raw)

  // If content already has block-level HTML tags, return as-is
  if (/<(p|h[1-6]|div|ul|ol|li|blockquote|table|figure|pre|hr)\b/i.test(sanitized)) {
    return sanitized
  }

  // Plain text — split by double newlines into paragraphs
  return sanitized
    .split(/\n{2,}/)
    .map(block => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      // Preserve single newlines as <br> within paragraphs
      const withBreaks = trimmed.replace(/\n/g, '<br />')
      return `<p>${withBreaks}</p>`
    })
    .filter(Boolean)
    .join('\n')
}

export function BlogContent({ content }: BlogPostClientProps) {
  const formatted = formatContent(content)

  return (
    <div
      className="blog-content prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  )
}
