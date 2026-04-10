import { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/checkout', '/account', '/search'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
