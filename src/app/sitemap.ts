import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://avisionforyourecovery.org'

  // Static pages with stable last-modified dates
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: '2026-03-09', changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: '2026-03-09', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/programs`, lastModified: '2026-03-09', changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/admission`, lastModified: '2026-03-09', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/donate`, lastModified: '2026-03-09', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: '2026-03-09', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/assessment`, lastModified: '2026-03-09', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/social`, lastModified: '2026-03-09', changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/blog`, lastModified: '2026-03-09', changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/meetings`, lastModified: '2026-03-09', changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/impact`, lastModified: '2026-03-09', changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/team`, lastModified: '2026-03-09', changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/newsletter`, lastModified: '2026-03-09', changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: '2026-03-09', changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: '2026-03-09', changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Dynamic blog posts
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const posts = await db.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    })
    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    // DB unavailable during build — skip dynamic pages
  }

  // Dynamic program pages
  let programPages: MetadataRoute.Sitemap = []
  try {
    const programs = await db.program.findMany({
      select: { slug: true, updatedAt: true },
    })
    programPages = programs.map((program) => ({
      url: `${baseUrl}/programs/${program.slug}`,
      lastModified: program.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB unavailable during build — skip dynamic pages
  }

  return [...staticPages, ...blogPages, ...programPages]
}
