import { generatePageMetadata } from '@/lib/metadata'

export const metadata = generatePageMetadata({
  title: 'Contact Us',
  description:
    'Get in touch with SeeZee Studio for your web development needs. Book a free consultation to discuss your website project. Fast, affordable, and professional web design services in Louisville, KY and nationwide.',
  path: '/contact',
  keywords: [
    'contact SeeZee Studio',
    'web development consultation',
    'website quote',
    'Louisville web design contact',
    'get a website built',
    'small business web design inquiry',
  ],
})

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Structured data for ContactPage
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    mainEntity: {
      '@type': 'Organization',
      name: 'SeeZee Studio',
      url: 'https://see-zee.com',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        availableLanguage: 'English',
        areaServed: 'US',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Louisville',
        addressRegion: 'KY',
        addressCountry: 'US',
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
















