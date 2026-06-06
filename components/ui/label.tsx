import { cn } from '@/lib/utils'
import { LabelHTMLAttributes } from 'react'

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('block text-sm font-medium mb-1', className)}
      style={{ color: 'var(--text)' }}
      {...props}
    />
  )
}
