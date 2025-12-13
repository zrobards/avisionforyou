import { generatePageMetadata } from '@/lib/metadata'

export const metadata = generatePageMetadata({
  title: 'Big Red Bus Case Study - Mental Health Platform | SeeZee Studio',
  description:
    'See how SeeZee built Big Red Bus, a cognitive accessibility-first mental health and neuro-inclusive community platform. Learn about our approach to inclusive design, digital accessibility, and community support.',
  path: '/case-studies/big-red-bus',
  keywords: [
    'mental health website',
    'neuro-inclusive design',
    'cognitive accessibility',
    'accessible web design',
    'support group platform',
    'community website',
    'WCAG compliance',
    'inclusive technology',
  ],
})

export default function BigRedBusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

