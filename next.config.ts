import path from 'path'
import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary CDN — media images stored in Cloudinary
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Wikimedia / Unsplash / Pexels — demo/seed images
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
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

// Sentry disabled temporarily to isolate admin blank-page issue.
// Re-enable once admin is confirmed working.
export default configWithPayload
