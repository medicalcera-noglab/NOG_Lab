import { cn } from '@/lib/utils'

interface SectionProps {
  as?: React.ElementType
  id?: string
  className?: string
  children: React.ReactNode
}

export function Section({ as: Tag = 'section', id, className, children }: SectionProps) {
  return (
    <Tag id={id} className={cn('py-6 md:py-12 lg:py-20', className)}>
      {children}
    </Tag>
  )
}
