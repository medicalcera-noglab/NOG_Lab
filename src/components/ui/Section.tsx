import { cn } from '@/lib/utils'

interface SectionProps {
  as?: React.ElementType
  className?: string
  children: React.ReactNode
}

export function Section({ as: Tag = 'section', className, children }: SectionProps) {
  return <Tag className={cn('py-6 md:py-12 lg:py-20', className)}>{children}</Tag>
}
