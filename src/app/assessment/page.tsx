import { buildPageMetadata } from '@/lib/metadata'
import AssessmentClient from './AssessmentClient'

export const metadata = buildPageMetadata(
  'Self Assessment | A Vision For You Recovery',
  'Take a confidential self-assessment to understand your relationship with substances. Free tool from A Vision For You Inc.'
)

export default function AssessmentPage() {
  return <AssessmentClient />
}
