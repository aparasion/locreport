import { cn } from '@/lib/utils'
import React, { InputHTMLAttributes } from 'react'

export function Input({ className, style, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2',
        className
      )}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
        '--tw-ring-color': 'var(--accent-soft)',
        ...style,
      } as React.CSSProperties}
      {...props}
    />
  )
}
