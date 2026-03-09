import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/board/', '/community/'],
      },
    ],
    sitemap: 'https://avisionforyourecovery.org/sitemap.xml',
  }
}
