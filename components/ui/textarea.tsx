import { cn } from '@/lib/utils'
import React, { TextareaHTMLAttributes } from 'react'

export function Textarea({ className, style, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y',
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
