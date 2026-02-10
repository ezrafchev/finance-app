import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Removed 'output: export' to enable server-side features (API routes, database)
  // basePath is removed as it's not needed for server deployment
  images: {
    unoptimized: true,
  },
}

export default nextConfig
