import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface RoleTab {
  role: string
  label: string
  count: number
}

interface RoleTabNavProps {
  tabs: RoleTab[]
  activeRole: string
}

export function RoleTabNav({ tabs, activeRole }: RoleTabNavProps) {
  return (
    <nav aria-label="Filter team by role">
      <ul role="list" className="border-border flex flex-wrap gap-2 border-b pb-px">
        {tabs.map((tab) => {
          const isActive = tab.role === activeRole
          const href = tab.role === 'all' ? '/people' : `/people?role=${tab.role}`

          return (
            <li key={tab.role}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-t-md px-4 py-2 text-sm font-medium',
                  'transition-colors duration-150',
                  'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                  isActive
                    ? 'border-primary text-primary -mb-px border-b-2 bg-transparent'
                    : 'text-muted hover:text-fg',
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                    isActive ? 'bg-primary/10 text-primary' : 'bg-surface-raised text-muted',
                  )}
                  aria-label={`${tab.count} ${tab.count === 1 ? 'person' : 'people'}`}
                >
                  {tab.count}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
