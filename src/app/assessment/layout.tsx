import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recovery Assessment',
  description:
    'Take a confidential recovery assessment to find the right program at A Vision For You in Louisville, KY.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
