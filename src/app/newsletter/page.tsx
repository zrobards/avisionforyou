import { buildPageMetadata } from '@/lib/metadata'
import NewsletterClient from './NewsletterClient'

export const metadata = buildPageMetadata(
  'Newsletters | A Vision For You',
  'Stay updated with the latest news, recovery stories, and community updates from A Vision For You in Louisville, KY.'
)

export default function NewsletterPage() {
  return <NewsletterClient />
}
