import type { Metadata } from "next"
import { AuthProvider } from "@/providers"
import { ToastProvider } from "@/components/shared/ToastProvider"
import ConditionalLayout from "@/components/layout/ConditionalLayout"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister"
import { Analytics } from "@vercel/analytics/react"
import CookieConsent from "@/components/shared/CookieConsent"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL('https://avisionforyourecovery.org'),
  title: {
    default: "A Vision For You | Addiction Recovery & Treatment in Louisville, KY",
    template: "%s | A Vision For You"
  },
  description: "A nonprofit providing comprehensive recovery support, treatment, and community services in Louisville, Kentucky.",
  keywords: ["recovery", "addiction treatment", "mental health", "housing assistance", "Louisville Kentucky", "nonprofit", "peer support", "community resources"],
  authors: [{ name: "A Vision For You", url: "https://avisionforyourecovery.org" }],
  creator: "A Vision For You",
  publisher: "A Vision For You",
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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://avisionforyourecovery.org',
    siteName: 'A Vision For You',
    title: 'A Vision For You | Addiction Recovery & Treatment in Louisville, KY',
    description: 'Comprehensive recovery support for individuals and families in Louisville, Kentucky.',
    images: [
      {
        url: '/AVFY%20LOGO.jpg',
        width: 1200,
        height: 630,
        alt: 'A Vision For You',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Vision For You | Louisville, KY',
    description: 'Recovery support, treatment, and community resources in Louisville, Kentucky.',
    images: ['/AVFY%20LOGO.jpg'],
  },
  manifest: '/manifest.json',
  verification: {
    // Add Google Search Console verification code when available
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["Organization", "LocalBusiness"],
              "name": "A Vision For You Inc.",
              "alternateName": "AVFY",
              "url": "https://avisionforyourecovery.org",
              "logo": "https://avisionforyourecovery.org/AVFY%20LOGO.jpg",
              "description": "Nonprofit addiction recovery organization providing housing, treatment, education, and community support in Louisville, KY.",
              "telephone": "+1-502-749-6344",
              "email": "info@avisionforyourecovery.org",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "1675 Story Ave",
                "addressLocality": "Louisville",
                "addressRegion": "KY",
                "postalCode": "40206",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "38.2527",
                "longitude": "-85.7185"
              },
              "sameAs": [
                "https://www.facebook.com/avfyrecovery",
                "https://www.instagram.com/avision_foryourecovery/",
                "https://www.tiktok.com/@avisionforyourecovery",
                "https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/"
              ],
              "nonprofitStatus": "Nonprofit501c3",
              "taxID": "87-1066569"
            })
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-brand-purple focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <ToastProvider>
            <ConditionalLayout>
              <main id="main-content">
                {children}
              </main>
            </ConditionalLayout>
          </ToastProvider>
        </AuthProvider>
        <ServiceWorkerRegister />
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  )
}
