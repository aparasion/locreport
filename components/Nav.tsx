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

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname.startsWith(href) && href !== '/'
          ? 'text-[#3D5AFE]'
          : 'text-[#5A6278] hover:text-[#111827]'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
        <Link href="/" className="font-['Outfit'] text-lg font-700 text-[#111827]">
          LocReport
        </Link>
        <nav className="flex items-center gap-6">
          {link('/articles', 'Articles')}
          {isAdmin && link('/admin', 'Admin')}
          {email ? (
            <button onClick={signOut} className="text-sm text-[#5A6278] hover:text-[#111827]">
              Sign out
            </button>
          ) : (
            <Link href="/login" className="text-sm text-[#5A6278] hover:text-[#111827]">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
