'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_LINKS as links } from '@/lib/adminNav'

// Desktop-only tab bar. On mobile, the header's own "Admin" dropdown
// (components/Nav.tsx) already lists these same links — no need to
// duplicate that as a second dropdown here.
export function AdminNav() {
  const pathname = usePathname()

  // Gentle dark-orange (the design system's --gold token) identifies the
  // admin tab bar as distinct from the public site's indigo nav. Inactive
  // tabs get a softened mix of it, same recipe .site-nav uses for --text.
  const INACTIVE_COLOR = 'color-mix(in srgb, var(--gold) 72%, var(--muted))'

  return (
    <nav
      className="hidden sm:block mb-6 sticky sm:top-[72px] z-30 pt-2"
      style={{ background: 'var(--bg)' }}
    >
      <div className="flex gap-1" style={{ borderBottom: '1px solid var(--border)' }}>
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
