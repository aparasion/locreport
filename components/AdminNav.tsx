'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ADMIN_LINKS as links } from '@/lib/adminNav'

export function AdminNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const current = links.find(l => l.href === pathname) ?? links[0]

  // Gentle dark-orange (the design system's --gold token) identifies the
  // admin tab bar as distinct from the public site's indigo nav. Inactive
  // tabs get a softened mix of it, same recipe .site-nav uses for --text.
  const INACTIVE_COLOR = 'color-mix(in srgb, var(--gold) 72%, var(--muted))'

  return (
    <nav
      className="mb-6 sticky top-16 sm:top-[72px] z-30 pt-2"
      style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}
    >
      {/* Mobile dropdown */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: 'var(--surface)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)', color: 'var(--gold)' }}
          aria-expanded={open}
        >
          <span>{current.label}</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
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
                className="block px-3 py-2 text-xs font-medium transition-colors"
                style={pathname === href
                  ? { background: 'var(--gold-soft)', color: 'var(--gold)', fontWeight: 600 }
                  : { color: INACTIVE_COLOR }}
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
            className="px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors"
            style={pathname === href
              ? { borderBottom: '2px solid var(--gold)', color: 'var(--gold)', fontWeight: 600, marginBottom: -1 }
              : { color: INACTIVE_COLOR }}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
