import { generatePageMetadata } from '@/lib/metadata'

export const metadata = generatePageMetadata({
  title: 'About SeeZee - Built by Sean & Zach',
  description:
    'Meet Sean and Zach, the Louisville-based developers behind SeeZee Studio. We build fast, affordable websites for small businesses with lifetime maintenance and dashboard access. Learn about our mission to make web design simple, fast, and accessible.',
  path: '/about',
  keywords: [
    'about SeeZee Studio',
    'Louisville web developers',
    'Sean McCulloch',
    'web development team',
    'Kentucky web design',
    'small business web developers',
  ],
})

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Structured data for Organization and Team
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    mainEntity: {
      '@type': 'Organization',
      name: 'SeeZee Studio',
      url: 'https://see-zee.com',
      logo: 'https://see-zee.com/favicon.svg',
      description: 'Custom web and app development for small businesses',
      foundingDate: '2023',
      founders: [
        {
          '@type': 'Person',
          name: 'Sean McCulloch',
          jobTitle: 'Lead Developer & Designer',
          description:
            'Full-stack developer specializing in Next.js, React, and modern web technologies',
        },
        {
          '@type': 'Person',
          name: 'Zach',
          jobTitle: 'Operations & Client Experience',
          description:
            'Handles client relationships, onboarding, and project management',
        },
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Louisville',
        addressRegion: 'KY',
        addressCountry: 'US',
      },
      areaServed: {
        '@type': 'Country',
        name: 'United States',
      },
      serviceArea: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: '38.2527',
          longitude: '-85.7585',
        },
      },
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
















