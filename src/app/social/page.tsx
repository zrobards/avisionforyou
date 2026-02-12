import { buildPageMetadata } from '@/lib/metadata'
import SocialClient from './SocialClient'

export const metadata = buildPageMetadata(
  'Social Media | A Vision For You Recovery',
  'Follow A Vision For You Inc. on social media. Connect with our recovery community and stay updated on events and programs.'
)

export default function SocialPage() {
  return <SocialClient />
}
