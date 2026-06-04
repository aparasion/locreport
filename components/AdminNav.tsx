'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
  return (
    <nav className="flex gap-1 border-b border-gray-100 mb-6">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            pathname === href
              ? 'border-b-2 border-[#3D5AFE] text-[#3D5AFE]'
              : 'text-[#5A6278] hover:text-[#111827]'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
