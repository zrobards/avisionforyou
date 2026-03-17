import type { Metadata } from 'next'
import DonateClient from './DonateClient'

export const metadata: Metadata = {
  title: 'Donate | A Vision For You',
  description: 'Support addiction recovery in Louisville, KY. Your tax-deductible donation provides housing, meals, treatment, and hope.',
  openGraph: {
    title: 'Donate to A Vision For You',
    description: 'Support addiction recovery in Louisville, KY. 100% tax-deductible.',
    images: [{ url: '/AVFY%20LOGO.jpg', width: 1200, height: 630, alt: 'A Vision For You' }],
  },
}

export default function DonatePage() {
  return <DonateClient />
}
