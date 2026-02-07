import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy for A Vision For You, a 501(c)(3) nonprofit in Louisville, Kentucky.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
