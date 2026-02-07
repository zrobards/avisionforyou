import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Impact',
  description:
    "See the impact of A Vision For You's recovery programs in Louisville, KY. Lives changed, families reunited, and communities strengthened.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
