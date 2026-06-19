import { cn } from '@/lib/utils'
import { LucideIcon } from '@/lib/lucideIcon'
import type { ResearchTheme } from '@/lib/data'

interface ResearchInPageNavProps {
  themes: ResearchTheme[]
  className?: string
}

export function ResearchInPageNav({ themes, className }: ResearchInPageNavProps) {
  return (
    <nav
      aria-label="Jump to research theme"
      className={cn(
        'border-border bg-bg/80 sticky top-16 z-20 -mx-4 px-4 py-3 backdrop-blur-sm',
        'border-b',
        className,
      )}
    >
      <ul role="list" className="flex flex-wrap justify-center gap-x-1 gap-y-2">
        {themes.map((theme) => (
          <li key={theme.id}>
            <a
              href={`#theme-${theme.slug ?? theme.id}`}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
                'text-sm font-medium transition-colors duration-150',
                'text-muted hover:text-fg hover:bg-surface-raised',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              )}
              style={{ '--tc': theme.color } as React.CSSProperties}
            >
              <LucideIcon
                name={theme.icon}
                size={14}
                aria-hidden="true"
                style={{ color: 'var(--tc)' }}
              />
              {theme.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
