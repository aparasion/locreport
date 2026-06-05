'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/drafts', label: 'Drafts' },
  { href: '/admin/articles', label: 'Articles' },
  { href: '/admin/sources', label: 'Sources' },
  { href: '/admin/compose', label: 'Compose' },
  { href: '/admin/prompts', label: 'Prompts' },
]

export function AdminNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const current = links.find(l => l.href === pathname) ?? links[0]

  return (
    <nav className="mb-6">
      {/* Mobile dropdown */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-[#15191C]"
          aria-expanded={open}
        >
          <span>{current.label}</span>
          <svg
            className={`w-4 h-4 text-[#5B665F] transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-[#E2F0EA] text-[#0F6E52]'
                    : 'text-[#5B665F] hover:text-[#15191C] hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Desktop tab bar */}
      <div className="hidden sm:flex gap-1 border-b border-gray-100">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              pathname === href
                ? 'border-b-2 border-[#0F6E52] text-[#0F6E52]'
                : 'text-[#5B665F] hover:text-[#15191C]'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
