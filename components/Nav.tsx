'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? null)
        setIsAdmin(user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL)
      }
    })
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="site-header">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6">
        <Link href="/" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text)', textDecoration: 'none' }}>
          LocReport
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          {[
            { href: '/articles', label: 'Articles' },
            ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive(href) ? 'var(--accent)' : 'var(--muted)',
                transition: 'color 0.15s',
              }}
            >
              {label}
            </Link>
          ))}
          {email ? (
            <button
              onClick={signOut}
              style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Sign out
            </button>
          ) : (
            <Link href="/login" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}>
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
