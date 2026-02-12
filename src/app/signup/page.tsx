import { buildPageMetadata } from '@/lib/metadata'
import SignupClient from './SignupClient'

export const metadata = buildPageMetadata(
  'Create Account | A Vision For You Recovery',
  'Create your A Vision For You account to join our recovery community and access exclusive resources.'
)

export default function SignupPage() {
  return <SignupClient />
}
