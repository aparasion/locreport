import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'rerun'
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-[#EEF1F8] text-[#3D5AFE]',
        variant === 'success' && 'bg-green-100 text-green-700',
        variant === 'warning' && 'bg-yellow-100 text-yellow-700',
        variant === 'danger' && 'bg-red-100 text-red-700',
        variant === 'muted' && 'bg-gray-100 text-gray-500',
        variant === 'rerun' && 'bg-purple-100 text-purple-700',
        className
      )}
      {...props}
    />
  )
}
