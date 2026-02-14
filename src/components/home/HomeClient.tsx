'use client'

import dynamic from 'next/dynamic'

// Loading skeleton for below-the-fold sections
function SectionSkeleton({ minHeight = 400, bg = 'bg-gray-100' }: { minHeight?: number; bg?: string }) {
  return (
    <div className={`animate-pulse ${bg}`} style={{ minHeight }} />
  )
}

// Lazy-loaded below-the-fold sections
const ProgramsSection = dynamic(() => import('@/components/home/ProgramsSection'), {
  loading: () => <SectionSkeleton minHeight={500} bg="bg-white" />,
})

const LeadCaptureCTA = dynamic(() => import('@/components/shared/LeadCaptureCTA'), {
  loading: () => <SectionSkeleton minHeight={200} bg="bg-purple-50" />,
})

const ImpactMetrics = dynamic(() => import('@/components/shared/ImpactMetrics'), {
  loading: () => <SectionSkeleton minHeight={300} bg="bg-gray-50" />,
})

const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'), {
  loading: () => <SectionSkeleton minHeight={400} bg="bg-purple-50" />,
})

const StatsBanner = dynamic(() => import('@/components/home/StatsBanner'), {
  loading: () => <SectionSkeleton minHeight={150} bg="bg-purple-900" />,
})

const CommunitySection = dynamic(() => import('@/components/home/CommunitySection'), {
  loading: () => <SectionSkeleton minHeight={500} bg="bg-purple-50" />,
})

const DonationCTA = dynamic(() => import('@/components/home/DonationCTA'), {
  loading: () => <SectionSkeleton minHeight={250} bg="bg-green-50" />,
})

const InstagramFeed = dynamic(() => import('@/components/shared/InstagramFeed'), {
  loading: () => <SectionSkeleton minHeight={400} bg="bg-gray-50" />,
})

export default function HomeClient() {
  return (
    <>
      {/* Programs Section */}
      <ProgramsSection />

      {/* Lead Capture CTA */}
      <LeadCaptureCTA variant="banner" />

      {/* Impact Metrics */}
      <ImpactMetrics />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Stats Banner */}
      <StatsBanner />

      {/* Community Section */}
      <CommunitySection />

      {/* Donation CTA */}
      <DonationCTA />

      {/* Instagram Feed */}
      <InstagramFeed />
    </>
  )
}
