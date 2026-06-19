import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NOG Lab',
    short_name: 'NOG Lab',
    description: 'Nutrition, Oral & Gut Microbiome Research Laboratory',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F7F5',
    theme_color: '#0E6E6E',
    icons: [
      {
        src: '/logo-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
