import { MetadataRoute } from 'next'

const BASE_URL = 'https://weedej-cannabis-eshop-dek4dences-projects.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/checkout', '/account'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
