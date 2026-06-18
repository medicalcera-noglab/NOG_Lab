import path from 'path'
import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  turbopack: {
    // Pin workspace root so Next.js doesn't infer the wrong monorepo root
    root: path.resolve(__dirname),
  },
}

export default withPayload(nextConfig)
