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
    default: "A Vision For You | Addiction Recovery & Treatment in Louisville, KY",
    template: "%s | A Vision For You"
  },
  description: "A nonprofit providing comprehensive recovery support, treatment, and community services in Louisville, Kentucky.",
  keywords: ["recovery", "addiction treatment", "mental health", "housing assistance", "Louisville Kentucky", "nonprofit", "peer support", "community resources"],
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
