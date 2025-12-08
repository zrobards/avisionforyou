import { generatePageMetadata } from '@/lib/metadata'

export const metadata = generatePageMetadata({
  title: 'Our Projects & Portfolio',
  description:
    'Explore SeeZee Studio\'s active web development projects. See real examples of our e-commerce stores, business websites, and custom web applications built with Next.js and React. Louisville-based web development with nationwide service.',
  path: '/projects',
  keywords: [
    'web development portfolio',
    'SeeZee projects',
    'Next.js websites',
    'e-commerce examples',
    'business website examples',
    'Louisville web design portfolio',
    'React web applications',
  ],
})

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Structured data for Portfolio
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'SeeZee Studio Portfolio',
    description: 'Active web development projects by SeeZee Studio',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'CreativeWork',
          position: 1,
          name: 'Red Head Printing E-Commerce Platform',
          description:
            'A high-performance e-commerce platform built with Next.js and Express featuring product catalog, shopping cart, custom file uploads, and Stripe payments',
          creator: {
            '@type': 'Organization',
            name: 'SeeZee Studio',
          },
        },
        {
          '@type': 'CreativeWork',
          position: 2,
          name: 'Big Red Bus Nonprofit Directory',
          description:
            'Partner nonprofit project — a shared brand for community work and experiments in how small orgs can look professional online. A nonprofit directory platform for mental health and autism support organizations with filtering and search functionality',
          creator: {
            '@type': 'Organization',
            name: 'SeeZee Studio',
          },
        },
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  )
}
















