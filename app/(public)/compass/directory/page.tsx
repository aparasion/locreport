import type { Metadata } from 'next'
import { DIRECTORY } from '@/lib/data/directory'
import { DirectoryClient } from './DirectoryClient'

export const metadata: Metadata = {
  title: 'Language Technology Directory | LocReport Compass',
  description: 'Comprehensive directory of language technology tools — TMS platforms, CAT tools, AI translation engines, LSPs, interpreting platforms, and more.',
}

export default function DirectoryPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <h1 style={{ marginBottom: 'var(--space-2)' }}>Language Technology Directory</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-6)' }}>
        100+ tools &amp; companies — TMS platforms, CAT tools, AI translation engines, LSPs, interpreting platforms, and more.
      </p>
      <DirectoryClient entries={DIRECTORY} />
    </div>
  )
}
