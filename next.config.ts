import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob storage (production image uploads)
      { protocol: 'https', hostname: '*.vercel-storage.com' },
      { protocol: 'https', hostname: '*.blob.vercel.app' },
      // Fallback: allow any remaining https host (e.g. future CDN migrations)
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default nextConfig
