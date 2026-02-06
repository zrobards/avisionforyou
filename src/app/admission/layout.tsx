import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata(
  'Admission',
  'Start your recovery journey with our admissions process in Louisville, KY. Get help, support, and a personalized path forward.'
)

export default function AdmissionLayout({ children }: { children: React.ReactNode }) {
  return children
}
