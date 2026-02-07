import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admission',
  description:
    'Apply for recovery programs at A Vision For You. Serving Louisville, KY with housing, treatment, peer support, and comprehensive recovery services.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
