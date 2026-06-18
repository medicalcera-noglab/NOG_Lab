import { cn } from '@/lib/utils'

interface SectionProps {
  as?: React.ElementType
  className?: string
  children: React.ReactNode
}

export function Section({ as: Tag = 'section', className, children }: SectionProps) {
  return <Tag className={cn('py-16 md:py-24', className)}>{children}</Tag>
}
