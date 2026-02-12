import { buildPageMetadata } from '@/lib/metadata'
import AdmissionClient from './AdmissionClient'

export const metadata = buildPageMetadata(
  'Admission Inquiry | A Vision For You Recovery',
  'Begin your recovery journey with A Vision For You Inc. Submit an admission inquiry for our addiction recovery and treatment programs in Louisville, KY.'
)

export default function AdmissionPage() {
  return <AdmissionClient />
}
