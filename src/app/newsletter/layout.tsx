import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata(
  'Newsletter',
  'Read community updates, recovery resources, and announcements from A Vision For You.'
)

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return children
}
