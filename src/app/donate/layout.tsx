import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata(
  'Donate',
  'Support A Vision For You with a tax-deductible donation that funds housing, meals, recovery support, and community programs.'
)

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return children
}
