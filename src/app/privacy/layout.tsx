import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata(
  'Privacy Policy',
  'Review how A Vision For You collects, uses, and protects your information.'
)

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
