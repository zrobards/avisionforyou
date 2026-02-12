import { buildPageMetadata } from '@/lib/metadata'
import BlogClient from './BlogClient'

export const metadata = buildPageMetadata(
  'Recovery Stories & Resources | A Vision For You',
  'Read recovery stories, resources, and guidance for your addiction recovery journey from A Vision For You in Louisville, KY.'
)

export default function BlogPage() {
  return <BlogClient />
}
