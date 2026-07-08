import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Cross-document/page View Transitions; disable this flag if the
    // experimental API misbehaves after a Next.js upgrade.
    viewTransition: true,
  },
}

export default nextConfig
