import { buildPageMetadata } from '@/lib/metadata'
import ImpactClient from './ImpactClient'

export const metadata = buildPageMetadata(
  'Our Impact | A Vision For You Recovery',
  'See the measurable impact of A Vision For You Inc. Programs served, lives changed, and community outcomes in Louisville, KY.'
)

export default function ImpactPage() {
  return <ImpactClient />
}
