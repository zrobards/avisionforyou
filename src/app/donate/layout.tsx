import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Donate',
  description:
    'Support addiction recovery in Louisville, KY. Your tax-deductible donation to A Vision For You helps provide housing, treatment, and community support.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
