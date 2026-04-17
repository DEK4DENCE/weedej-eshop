import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

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

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
  // Only upload source maps when SENTRY_AUTH_TOKEN is present
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
})
