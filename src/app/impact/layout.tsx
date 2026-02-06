import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata(
  'Our Impact',
  'See the impact of A Vision For You programs, recovery outcomes, and community transformation in Louisville, KY.'
)

export default function ImpactLayout({ children }: { children: React.ReactNode }) {
  return children
}
