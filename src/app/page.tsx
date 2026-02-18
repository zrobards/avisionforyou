import Link from 'next/link'
import HomeClient from '@/components/home/HomeClient'
import { buildPageMetadata } from '@/lib/metadata'

const HERO_VIDEO_SRC = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "/videos/cloud-background.mp4"

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

      {/* Hero Section with Video Background - Eager (above the fold) */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/AVFY%20LOGO.jpg"
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center text-white py-24">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">A Vision For You</h1>
            <p className="text-xl mb-2 font-semibold drop-shadow-md">501(c)(3) Charity</p>
            <p className="text-lg md:text-xl mb-8 opacity-95 drop-shadow-md max-w-4xl mx-auto">&quot;To empower the homeless, addicted, maladjusted, and mentally ill to lead productive lives through housing, education, self-help, treatment, or any other available resource&quot;</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/programs" className="px-8 py-4 bg-white text-brand-purple rounded-lg font-bold hover:bg-brand-green hover:text-white transition shadow-lg hover:shadow-xl">Explore Programs</Link>
              <Link href="/donate" className="px-8 py-4 bg-brand-green text-white rounded-lg font-bold hover:bg-green-500 transition shadow-lg hover:shadow-xl">Make a Donation</Link>
              <a href="tel:+15027496344" className="px-8 py-4 border-2 border-white bg-black/20 backdrop-blur-sm text-white rounded-lg font-bold hover:bg-brand-green hover:border-brand-green transition shadow-lg hover:shadow-xl">Call (502) 749-6344</a>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach - Eager (near the fold, first content section) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Approach</h2>
          <p className="text-lg text-gray-700 mb-4">There is hope for recovery and treatment is possible. We combine multiple proven methods including:</p>
          <ul className="text-lg text-gray-700 space-y-2 mb-6">
            <li>{"\u2713"} Intensive Outpatient Treatment (IOP)</li>
            <li>{"\u2713"} Peer Driven Behavior Modification</li>
            <li>{"\u2713"} Twelve Step Groups</li>
            <li>{"\u2713"} Therapy &amp; Psychiatry</li>
            <li>{"\u2713"} Primary Care Referral</li>
            <li>{"\u2713"} Career Reentry &amp; Aftercare</li>
          </ul>
          <p className="text-lg font-semibold text-brand-purple">Our approach? Provide clients with the recovery path that will best meet their individual needs.</p>
        </div>
      </section>

      {/* Below-the-fold sections - Lazy-loaded via HomeClient */}
      <HomeClient />
    </>
  )
}
