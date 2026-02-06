import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata(
  'Social Media',
  'Connect with A Vision For You on Facebook, Instagram, TikTok, and LinkedIn.'
)

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return children
}
