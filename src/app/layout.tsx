import type { Metadata } from "next"
import { AuthProvider } from "@/providers"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"
import "./globals.css"

export const metadata: Metadata = {
  title: "A Vision For You Recovery",
  description: "A faith-based nonprofit recovery center providing comprehensive support for homeless, addicted, maladjusted, and mentally ill individuals in Louisville, Kentucky.",
  keywords: ["recovery", "addiction", "mental health", "housing", "Louisville", "nonprofit"],
  authors: [{ name: "A Vision For You Recovery" }],
  icons: {
    icon: "/favicon.ico"
  }
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
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
