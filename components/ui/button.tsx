import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        variant === 'primary' && 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
        variant === 'secondary' && 'bg-[var(--bg-secondary)] text-[var(--text)] hover:opacity-80',
        variant === 'ghost' && 'bg-transparent text-[var(--muted)] hover:bg-[var(--bg-secondary)]',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        className
      )}
      {...props}
    />
  )
}
