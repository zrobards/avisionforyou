import { buildPageMetadata } from '@/lib/metadata'
import AboutClient from './AboutClient'

export const metadata = buildPageMetadata(
  'About A Vision For You | 501(c)(3) Addiction Recovery Nonprofit',
  'Learn about A Vision For You Inc., a 501(c)(3) nonprofit providing comprehensive addiction recovery, housing, and support services in Louisville, KY. Meet our leadership, see our impact, and discover how your support changes lives.'
)

export default function AboutPage() {
  return <AboutClient />
}
