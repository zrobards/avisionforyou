import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata(
  'Contact Us',
  'Get in touch with A Vision For You for admissions, donations, or program information in Louisville, KY.'
)

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
