import { generatePageMetadata } from '@/lib/metadata'

export const metadata = generatePageMetadata({
  title: 'Nonprofit Website Packages - SeeZee Studio',
  description:
    'Choose the perfect nonprofit website package with 40% discount. Starter Nonprofit ($179), Community Impact ($479), or Full Service ($1,199). All packages include donation integration, event management, and lifetime maintenance.',
  path: '/start/nonprofit-tiers',
  keywords: [
    'nonprofit website packages',
    'nonprofit website pricing',
    'charity website builder',
    'nonprofit discount',
    'donation integration',
    'volunteer management',
    'community website',
  ],
})

export default function NonprofitTiersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

