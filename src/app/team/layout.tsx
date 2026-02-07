import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Team',
  description:
    'Meet the dedicated team at A Vision For You serving the Louisville, KY recovery community.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
