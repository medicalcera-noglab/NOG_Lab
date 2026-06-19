import type { LucideProps } from 'lucide-react'
import * as icons from 'lucide-react'

type IconComponent = React.ComponentType<LucideProps>

/** Resolve a Lucide icon name string (e.g. "microscope", "flask-conical") to its component. */
export function resolveLucideIcon(name: string | null | undefined): IconComponent | null {
  if (!name) return null
  const key = name
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
  const icon = (icons as Record<string, unknown>)[key]
  return typeof icon === 'function' ? (icon as IconComponent) : null
}

/**
 * Renders a Lucide icon resolved from a DB name string (e.g. "microscope").
 * Lucide icons are stateless SVG components with no hooks — safe to render
 * dynamically. The disable below is intentional: the lint rule guards against
 * resetting *stateful* component instances, which does not apply here.
 */
export function LucideIcon({
  name,
  ...props
}: Omit<LucideProps, 'name'> & { name: string | null | undefined }) {
  const Icon = resolveLucideIcon(name)
  if (!Icon) return null
  // eslint-disable-next-line react-hooks/static-components
  return <Icon {...props} />
}
