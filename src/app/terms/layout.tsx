import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata(
  'Terms of Use',
  'Read the terms and conditions for using the A Vision For You website and services.'
)

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
