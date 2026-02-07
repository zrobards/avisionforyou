import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Recovery stories, resources, and updates from A Vision For You in Louisville, Kentucky.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
