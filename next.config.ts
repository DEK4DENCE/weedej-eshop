import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob storage (production image uploads)
      { protocol: 'https', hostname: '*.vercel-storage.com' },
      { protocol: 'https', hostname: '*.blob.vercel.app' },
      // Local development
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
}

export default nextConfig
