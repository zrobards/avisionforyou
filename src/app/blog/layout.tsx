import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata(
  'Blog',
  'Recovery stories, resources, and insights from A Vision For You.'
)

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
