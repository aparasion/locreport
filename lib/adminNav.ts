// Single source of truth for the admin section's tabs — used by the AdminNav
// tab bar (app/(public)/admin/*) and by the "Admin" dropdown in the main
// site header (components/Nav.tsx) so the two stay in sync.
export interface AdminLink {
  href: string
  label: string
}

export const ADMIN_LINKS: AdminLink[] = [
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
