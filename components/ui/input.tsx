import { cn } from '@/lib/utils'
import { InputHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#15191C] placeholder:text-[#5B665F] focus:border-[#0F6E52] focus:outline-none focus:ring-2 focus:ring-[#0F6E52]/20',
        className
      )}
      {...props}
    />
  )
}
