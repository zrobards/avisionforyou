import { buildPageMetadata } from '@/lib/metadata'
import HomeClient from './HomeClient'

export const metadata = buildPageMetadata(
  'A Vision For You | Addiction Recovery & Treatment in Louisville, KY',
  'Comprehensive addiction recovery and treatment in Louisville, KY. Free programs, safe housing, evidence-based IOP treatment, career reentry, and 24/7 support. 501(c)(3) nonprofit.'
)

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NonprofitOrganization",
        name: "A Vision For You Inc.",
        alternateName: "AVFY",
        url: "https://avisionforyou.org",
        logo: "https://avisionforyou.org/AVFY%20LOGO.jpg",
        description: "501(c)(3) addiction recovery nonprofit providing free programs, safe housing, evidence-based treatment, career reentry, and community support in Louisville, KY.",
        foundingDate: "2019",
        nonprofitStatus: "501(c)(3)",
        telephone: "+1-502-749-6344",
        email: "info@avisionforyourecovery.org",
        address: {
          "@type": "PostalAddress",
          streetAddress: "1675 Story Ave",
          addressLocality: "Louisville",
          addressRegion: "KY",
          postalCode: "40206",
          addressCountry: "US"
        },
        areaServed: {
          "@type": "City",
          name: "Louisville",
          containedInPlace: { "@type": "State", name: "Kentucky" }
        },
        sameAs: [
          "https://www.facebook.com/avisionforyourecovery",
          "https://www.instagram.com/avision_foryourecovery/",
          "https://www.tiktok.com/@avisionforyourecovery",
          "https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/"
        ],
        knowsAbout: ["addiction recovery", "substance abuse treatment", "sober living", "outpatient treatment", "peer support"],
      },
      {
        "@type": "LocalBusiness",
        name: "A Vision For You",
        url: "https://avisionforyou.org",
        image: "https://avisionforyou.org/AVFY%20LOGO.jpg",
        telephone: "+1-502-749-6344",
        address: {
          "@type": "PostalAddress",
          streetAddress: "1675 Story Ave",
          addressLocality: "Louisville",
          addressRegion: "KY",
          postalCode: "40206",
          addressCountry: "US"
        },
        openingHoursSpecification: [
          { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "08:00", closes: "18:00" },
          { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "14:00" }
        ]
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeClient />
    </>
  )
}
