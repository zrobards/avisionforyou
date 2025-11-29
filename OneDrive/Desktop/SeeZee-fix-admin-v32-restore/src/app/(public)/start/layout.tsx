import { generatePageMetadata } from '@/lib/metadata'

export const metadata = generatePageMetadata({
  title: 'Get Started - Build Your Website',
  description:
    'Start your website project with SeeZee Studio today. Choose from our Starter Site ($299 + $49/mo), Business Site ($799 + $99/mo), or E-Commerce Store ($1,999 + $149/mo) packages. Get your professional website built in 48 hours with lifetime maintenance included.',
  path: '/start',
  keywords: [
    'start website project',
    'build my website',
    'website quote',
    'get website built',
    'website package selection',
    'small business website builder',
    '48 hour website',
    'fast website development',
  ],
})

export default function StartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Structured data for Action page
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Get Started with SeeZee Studio',
    description: 'Start your website project and choose the perfect package',
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://see-zee.com/start',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter Site',
        price: '49',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Business Site',
        price: '99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'E-Commerce Store',
        price: '149',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    ],
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
















