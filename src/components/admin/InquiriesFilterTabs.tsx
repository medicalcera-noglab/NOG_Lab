'use client'
import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'

const TABS = [
  { label: 'All', value: undefined },
  { label: 'Contact Messages', value: 'contact' },
  { label: 'Join Applications', value: 'join' },
] as const

export function InquiriesFilterTabs() {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const currentFilter = (searchParams.get('where[formType][equals]') ?? undefined) as
    | 'contact'
    | 'join'
    | undefined

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '16px 0 12px',
        marginBottom: '4px',
        borderBottom: '1px solid var(--theme-elevation-100)',
      }}
    >
      {TABS.map(({ label, value }) => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('page')
        if (value !== undefined) {
          params.set('where[formType][equals]', value)
        } else {
          params.delete('where[formType][equals]')
        }

        const isActive = currentFilter === value
        const href = params.toString() ? `${pathname}?${params.toString()}` : pathname

        return (
          <Link
            key={label}
            href={href}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              background: isActive
                ? 'var(--theme-success-500, #0E6E6E)'
                : 'var(--theme-elevation-50, #2a2a2a)',
              color: isActive ? '#fff' : 'var(--theme-text)',
              textDecoration: 'none',
              border: isActive
                ? '1px solid transparent'
                : '1px solid var(--theme-elevation-200, #444)',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
