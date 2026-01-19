import type { Metadata } from "next"
import { AuthProvider } from "@/providers"
import { ToastProvider } from "@/components/shared/ToastProvider"
import ConditionalLayout from "@/components/layout/ConditionalLayout"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL('https://avisionforyou.org'),
  title: {
    default: "A Vision For You | Faith-Based Recovery in Louisville, KY",
    template: "%s | A Vision For You"
  },
  description: "A faith-based nonprofit providing comprehensive support for individuals seeking recovery in Louisville, Kentucky. We offer programs, peer support, and community resources.",
  keywords: ["recovery", "addiction support", "mental health", "housing assistance", "Louisville Kentucky", "nonprofit", "faith-based", "peer support", "community resources"],
  authors: [{ name: "A Vision For You", url: "https://avisionforyou.org" }],
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
    url: 'https://avisionforyou.org',
    siteName: 'A Vision For You',
    title: 'A Vision For You | Faith-Based Community Support in Louisville, KY',
    description: 'Comprehensive recovery support for individuals and families. Join our community-based programs in Louisville, Kentucky.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'A Vision For You',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Vision For You | Louisville, KY',
    description: 'Faith-based community support center providing peer support and community resources.',
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code',
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
        <AuthProvider>
          <ToastProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </ToastProvider>
        </AuthProvider>
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  )
}
