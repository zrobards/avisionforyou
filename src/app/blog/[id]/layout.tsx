import { buildPageMetadata } from '@/lib/metadata'
import { db } from '@/lib/db'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = await db.blogPost.findUnique({
    where: { slug: params.id },
    select: { title: true, excerpt: true, imageUrl: true }
  })

  if (!post) {
    return buildPageMetadata('Blog Post', 'Read recovery resources and updates from A Vision For You.')
  }

  return buildPageMetadata(
    `${post.title} | A Vision For You`,
    post.excerpt || 'Read recovery resources and updates from A Vision For You.'
  )
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return children
}
