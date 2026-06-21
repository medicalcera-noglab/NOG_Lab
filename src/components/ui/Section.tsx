import { cn } from '@/lib/utils'

interface SectionProps {
  as?: React.ElementType
  className?: string
  children: React.ReactNode
}

export function Section({ as: Tag = 'section', className, children }: SectionProps) {
  return <Tag className={cn('py-10 md:py-16 lg:py-24', className)}>{children}</Tag>
}
