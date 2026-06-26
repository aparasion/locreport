'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/drafts', label: 'Drafts' },
  { href: '/admin/articles', label: 'Articles' },
  { href: '/admin/sources', label: 'Sources' },
  { href: '/admin/fact-flow', label: 'Fact Flow' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/directory', label: 'Directory' },
  { href: '/admin/compose', label: 'Compose' },
  { href: '/admin/direct', label: 'Direct' },
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
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'var(--surface)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)', color: 'var(--text)' }}
          aria-expanded={open}
        >
          <span>{current.label}</span>
          <svg
            className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
            style={{ color: 'var(--muted)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg overflow-hidden z-50" style={{ background: 'var(--surface)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)' }}>
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium transition-colors"
                style={pathname === href
                  ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
                  : { color: 'var(--muted)' }}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Desktop tab bar */}
      <div className="hidden sm:flex gap-1" style={{ borderBottom: '1px solid var(--border)' }}>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors"
            style={pathname === href
              ? { borderBottom: '2px solid var(--accent)', color: 'var(--accent)', marginBottom: -1 }
              : { color: 'var(--muted)' }}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
