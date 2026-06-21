'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  asChild?: boolean
}

const base = [
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium leading-none',
  'transition-colors duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
  'disabled:pointer-events-none disabled:opacity-50',
  'min-h-[44px] min-w-[44px]',
].join(' ')

const variants: Record<Variant, string> = {
  primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] px-5',
  secondary:
    'border border-[var(--primary)] text-[var(--primary)] bg-transparent hover:bg-teal/10 px-5',
  ghost: 'text-[var(--fg)] hover:bg-[var(--surface-raised)] px-4',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm min-h-[36px]',
  md: 'text-base',
  lg: 'text-lg px-7 py-3',
}

// buttonVariants — use this on <Link> or <a> elements that must look like buttons.
export function buttonVariants({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: Variant
  size?: Size
  className?: string
} = {}) {
  return cn(base, variants[variant], sizes[size], className)
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  ),
)

Button.displayName = 'Button'
