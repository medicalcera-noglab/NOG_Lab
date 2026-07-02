import Link from 'next/link'
import { PlaceholderSvg } from '@/components/placeholders/PlaceholderSvg'

export default function NotFound() {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center px-4 py-20 text-center"
      style={{ background: 'var(--bg)', color: 'var(--fg)' }}
    >
      <div className="mb-6 w-40 opacity-75" aria-hidden="true">
        <PlaceholderSvg forceVariant={2} seed={404} className="h-auto w-full" />
      </div>

      <p
        className="mb-2 font-mono text-6xl font-bold"
        style={{ color: 'var(--primary)' }}
        aria-hidden="true"
      >
        404
      </p>

      <h1
        className="mb-3 text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)' }}
      >
        Page not found
      </h1>

      <p className="mb-8 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/"
        className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-fg)',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ['--tw-ring-color' as any]: 'var(--ring)',
        }}
      >
        Go home
      </Link>
    </div>
  )
}
