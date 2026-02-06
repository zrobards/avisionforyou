import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata(
  'Recovery Assessment',
  'Complete a confidential assessment to find the right recovery program and support services.'
)

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return children
}
