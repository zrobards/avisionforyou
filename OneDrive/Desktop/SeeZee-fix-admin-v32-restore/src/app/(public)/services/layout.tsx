import { generatePageMetadata } from '@/lib/metadata'

export const metadata = generatePageMetadata({
  title: 'Website Packages & Pricing',
  description:
    'Choose the perfect website package for your business. Starter sites from $299 setup + $49/month, Business sites from $799 + $99/month, or E-Commerce stores from $1,999 + $149/month. All plans include hosting, security, and lifetime maintenance through your SeeZee Dashboard.',
  path: '/services',
  keywords: [
    'website packages',
    'website pricing',
    'small business website',
    'e-commerce website',
    'website design packages',
    'affordable web development',
    'website maintenance',
    'Louisville web design pricing',
    'business website cost',
  ],
})

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Structured data for Service offerings
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'SeeZee Studio Website Packages',
    description: 'Professional website packages for businesses of all sizes',
    itemListElement: [
      {
        '@type': 'Offer',
        position: 1,
        name: 'Starter Site',
        description: 'Perfect for small businesses getting started online',
        price: '49',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '49',
          priceCurrency: 'USD',
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: '1',
            unitText: 'MONTH',
          },
        },
        seller: {
          '@type': 'Organization',
          name: 'SeeZee Studio',
        },
      },
      {
        '@type': 'Offer',
        position: 2,
        name: 'Business Site',
        description: 'Ideal for growing businesses with more content needs',
        price: '99',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '99',
          priceCurrency: 'USD',
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: '1',
            unitText: 'MONTH',
          },
        },
        seller: {
          '@type': 'Organization',
          name: 'SeeZee Studio',
        },
      },
      {
        '@type': 'Offer',
        position: 3,
        name: 'E-Commerce Store',
        description: 'Complete online store with payment processing',
        price: '149',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '149',
          priceCurrency: 'USD',
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: '1',
            unitText: 'MONTH',
          },
        },
        seller: {
          '@type': 'Organization',
          name: 'SeeZee Studio',
        },
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
















