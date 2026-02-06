import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata(
  'Our Team',
  'Meet the leadership, board, and clinical team supporting recovery at A Vision For You.'
)

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return children
}
