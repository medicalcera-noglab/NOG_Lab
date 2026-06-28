import path from 'path'
import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  // sharp is a native module (.node binaries) — Turbopack cannot bundle it.
  // Marking it external makes Next.js require() it at runtime instead.
  serverExternalPackages: ['sharp'],
  turbopack: {
    // Pin workspace root so Next.js doesn't infer the wrong monorepo root
    root: path.resolve(__dirname),
  },
  experimental: {
    serverActions: {
      // Default is 4.5 MB which blocks PDF/Word CV uploads.
      bodySizeLimit: '25mb',
    },
  },
}

const configWithPayload = withPayload(nextConfig)

export default withSentryConfig(configWithPayload, {
  // Only uploads source maps when SENTRY_AUTH_TOKEN is set (CI/production)
  silent: !process.env.CI,
  disableLogger: true,
  // Source map upload requires SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT
  widenClientFileUpload: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  automaticVercelMonitors: false,
})
