import type { Metadata } from 'next'
import { DIRECTORY } from '@/lib/data/directory'
import { createClient } from '@/lib/supabase/server'
import { DirectoryClient } from './DirectoryClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Language Technology Directory | LocReport Compass',
  description: 'Comprehensive directory of language technology tools — TMS platforms, CAT tools, AI translation engines, LSPs, interpreting platforms, and more.',
}

async function getEntries() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('directory')
      .select('*')
      .order('name', { ascending: true })
    if (!error && data && data.length > 0) return data
  } catch {}
  return DIRECTORY
}

export default async function DirectoryPage() {
  const entries = await getEntries()

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <h1 style={{ marginBottom: 'var(--space-2)' }}>Language Technology Directory</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-6)' }}>
        {entries.length} tools &amp; companies — TMS platforms, CAT tools, AI translation engines, LSPs, interpreting platforms, and more. Click any entry for the full profile.
      </p>
      <DirectoryClient entries={entries} />
    </div>
  )
}
