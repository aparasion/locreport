import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Admin section navigation lives solely in the header's "Admin" dropdown
// (components/Nav.tsx) — no separate in-page tab bar.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/login')
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      {children}
    </div>
  )
}
