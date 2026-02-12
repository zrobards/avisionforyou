import { buildPageMetadata } from '@/lib/metadata'
import LoginClient from './LoginClient'

export const metadata = buildPageMetadata(
  'Sign In | A Vision For You Recovery',
  'Sign in to your A Vision For You account to access community features, board portal, and admin tools.'
)

export default function LoginPage() {
  return <LoginClient />
}
