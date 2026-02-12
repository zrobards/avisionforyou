import { buildPageMetadata } from '@/lib/metadata'
import DonateClient from './DonateClient'

export const metadata = buildPageMetadata(
  'Donate | Support Addiction Recovery in Louisville, KY',
  'Support A Vision For You Inc., a 501(c)(3) nonprofit. Your tax-deductible donation funds free recovery programs, safe housing, and community support in Louisville, KY.'
)

export default function DonatePage() {
  return <DonateClient />
}
