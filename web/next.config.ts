import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../'),
  allowedDevOrigins: ['10.0.0.7'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5118/api/:path*',
      },
    ]
  },
}

export default nextConfig
