import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Newsletter',
  description:
    'Stay updated with recovery resources, community events, and program updates from A Vision For You.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
