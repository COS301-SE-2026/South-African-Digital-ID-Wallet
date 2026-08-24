import { PHASE_DEVELOPMENT_SERVER } from 'next/dist/shared/lib/constants'
import type { NextConfig } from 'next'
import path from 'node:path'

export default (phase: string): NextConfig => ({
  output: 'standalone',
  ...(phase === PHASE_DEVELOPMENT_SERVER
    ? {}
    : { outputFileTracingRoot: path.join(__dirname, '../')}),
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_INTERNAL_URL ?? 'http://localhost:5118'}/api/:path*`,
      },
    ]
  },
})
