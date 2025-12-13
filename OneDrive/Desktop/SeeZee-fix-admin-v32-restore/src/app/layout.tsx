import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Providers } from './providers'
import DebugHUD from '../components/ui/debug-hud'
import { ClientAnimations } from '../components/ui/client-animations'
import SidebarWrapper from '../components/shared/SidebarWrapper'
import { Toaster } from '../components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'SeeZee Studio | Custom Web & App Development',
    template: '%s | SeeZee Studio',
  },
  description:
    'Fast, reliable web applications and databases for small teams and big ideas. Professional websites built in 48 hours with lifetime maintenance. Next.js, React, and modern tech stack. Louisville, KY.',
  keywords: [
    'web development',
    'app development',
    'Next.js',
    'React',
    'Louisville KY',
    'custom software',
    'full-stack development',
    'website design',
    '48 hour website',
    'small business websites',
    'e-commerce development',
    'web design Louisville',
  ],
  authors: [{ name: 'Sean & Zach', url: 'https://see-zee.com' }],
  creator: 'SeeZee Studio',
  publisher: 'SeeZee Studio',
  metadataBase: new URL('https://see-zee.com'),
  icons: {
    icon: '/icon',
    shortcut: '/favicon.svg',
    apple: '/icon',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SeeZee Studio | Custom Web Development',
    description: 'Professional websites built in 48 hours. Maintained for life.',
    url: 'https://see-zee.com',
    siteName: 'SeeZee Studio',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'SeeZee Studio - Custom Web Development',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SeeZee Studio',
    description: 'Professional websites built in 48 hours. Maintained for life.',
    images: ['/opengraph-image'],
    creator: '@seezee_studio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
    },
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enhanced structured data for SEO
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://see-zee.com/#organization',
        name: 'SeeZee Studio',
        alternateName: 'SeeZee',
        url: 'https://see-zee.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://see-zee.com/icon.png',
        },
        description: 'Professional web and app development for small businesses',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Louisville',
          addressRegion: 'KY',
          addressCountry: 'US',
        },
        founder: [
          {
            '@type': 'Person',
            name: 'Sean McCulloch',
            jobTitle: 'Lead Developer & Designer',
          },
          {
            '@type': 'Person',
            name: 'Zach',
            jobTitle: 'Operations & Client Experience',
          },
        ],
        sameAs: [
          'https://twitter.com/seezee_studio',
          'https://github.com/seezee',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          availableLanguage: 'English',
          areaServed: 'US',
        },
        priceRange: '$$',
        areaServed: {
          '@type': 'Country',
          name: 'United States',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://see-zee.com/#website',
        url: 'https://see-zee.com',
        name: 'SeeZee Studio',
        description: 'Professional websites built in 48 hours with lifetime maintenance',
        publisher: {
          '@id': 'https://see-zee.com/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://see-zee.com/?s={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': 'https://see-zee.com/#localbusiness',
        name: 'SeeZee Studio',
        image: 'https://see-zee.com/opengraph-image',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Louisville',
          addressRegion: 'KY',
          addressCountry: 'US',
        },
        priceRange: '$$',
        url: 'https://see-zee.com',
        telephone: '',
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          opens: '00:00',
          closes: '23:59',
        },
      },
    ],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {/* Sidebar and content wrapper */}
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
          
          <ClientAnimations />
          <DebugHUD />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}