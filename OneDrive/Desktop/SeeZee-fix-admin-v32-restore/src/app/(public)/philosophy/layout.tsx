import { generatePageMetadata } from '@/lib/metadata'

export const metadata = generatePageMetadata({
  title: 'How We Build – Our Philosophy',
  description:
    'Three principles that guide every project: Accessible by Design. Show the Work. Built to Last. Simple UX, clean systems, no BS.',
  path: '/philosophy',
  keywords: [
    'web development philosophy',
    'accessible design',
    'transparent development',
    'prototype-first development',
    'maintainable systems',
    'modern web stack',
  ],
})

export default function PhilosophyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


