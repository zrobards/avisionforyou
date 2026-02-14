'use client'

import DOMPurify from 'isomorphic-dompurify'

interface NewsletterContentProps {
  content: string
}

export function NewsletterContent({ content }: NewsletterContentProps) {
  return (
    <div
      className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-brand-purple hover:prose-a:text-purple-800 prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.replace(/\n/g, '<br />')) }}
    />
  )
}
