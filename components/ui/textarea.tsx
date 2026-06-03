import { cn } from '@/lib/utils'
import { TextareaHTMLAttributes } from 'react'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#5A6278] focus:border-[#3D5AFE] focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/20 resize-y',
        className
      )}
      {...props}
    />
  )
}
