import type { Metadata } from "next"
import { AuthProvider } from "@/providers"
import { ToastProvider } from "@/components/shared/ToastProvider"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL('https://avisionforyou.org'),
  title: {
    default: "A Vision For You Recovery | Faith-Based Recovery in Louisville, KY",
    template: "%s | A Vision For You Recovery"
  },
  description: "A faith-based nonprofit recovery center providing comprehensive support for homeless, addicted, maladjusted, and mentally ill individuals in Louisville, Kentucky. We offer IOP programs, peer support, and community resources.",
  keywords: ["recovery", "addiction treatment", "mental health", "housing assistance", "Louisville Kentucky", "nonprofit", "faith-based recovery", "IOP program", "peer support", "community resources"],
  authors: [{ name: "A Vision For You Recovery", url: "https://avisionforyou.org" }],
  creator: "A Vision For You Recovery",
  publisher: "A Vision For You Recovery",
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
    siteName: 'A Vision For You Recovery',
    title: 'A Vision For You Recovery | Faith-Based Recovery in Louisville, KY',
    description: 'Comprehensive recovery support for homeless, addicted, and mentally ill individuals. Join our community-based programs in Louisville, Kentucky.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'A Vision For You Recovery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Vision For You Recovery | Louisville, KY',
    description: 'Faith-based recovery center providing IOP programs, peer support, and community resources.',
    images: ['/og-image.jpg'],
  },
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
            <Navbar />
            {children}
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
