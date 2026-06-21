import path from 'path'
import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  // sharp is a native module (.node binaries) — Turbopack cannot bundle it.
  // Marking it external makes Next.js require() it at runtime instead.
  serverExternalPackages: ['sharp'],
  turbopack: {
    // Pin workspace root so Next.js doesn't infer the wrong monorepo root
    root: path.resolve(__dirname),
  },
}

export default withPayload(nextConfig)
