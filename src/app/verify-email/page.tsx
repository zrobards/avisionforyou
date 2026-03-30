import { buildPageMetadata } from '@/lib/metadata'
import VerifyEmailClient from './VerifyEmailClient'

export const metadata = buildPageMetadata(
  'Verify Email | A Vision For You Recovery',
  'Verify your email address to activate your account.'
)

export default function VerifyEmailPage() {
  return <VerifyEmailClient />
}
