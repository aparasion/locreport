import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DIRECTORY } from '@/lib/data/directory'
import { createClient } from '@/lib/supabase/server'
import { DirectoryLogo } from './DirectoryLogo'

export const revalidate = 3600

const CAT_DISPLAY: Record<string, string> = {
  tms: 'TMS',
  cat: 'CAT Tool',
  'ai-mt': 'AI / MT',
  lsp: 'LSP',
  'av-localization': 'AV Localization',
  interpreting: 'Interpreting',
  terminology: 'Terminology',
  research: 'Research',
  community: 'Community',
}

async function getEntry(slug: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('directory')
      .select('*')
      .eq('slug', slug)
      .single()
    if (!error && data) return data
  } catch {}
  return DIRECTORY.find(e => e.slug === slug) ?? null
}

export async function generateStaticParams() {
  return DIRECTORY.map(e => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const entry = await getEntry(slug)
  if (!entry) return {}
  return {
    title: `${entry.name} | Language Technology Directory — LocReport`,
    description: entry.description,
  }
}

export default async function DirectoryEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = await getEntry(slug)
  if (!entry) notFound()

  const catLabel = CAT_DISPLAY[entry.category] ?? entry.category
  const domain = entry.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const logoUrl = `https://logo.clearbit.com/${domain}`

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      {/* Breadcrumb */}
      <nav className="dir-breadcrumb" aria-label="Breadcrumb">
        <Link href="/compass/directory" className="dir-breadcrumb-link">Directory</Link>
        <span className="dir-breadcrumb-sep" aria-hidden="true">›</span>
        <span className="dir-breadcrumb-current">{entry.name}</span>
      </nav>

      {/* Hero */}
      <div className="dir-entry-hero">
        <div className="dir-entry-hero-main">
          <div className="dir-entry-header">
            <h1 className="dir-entry-name">{entry.name}</h1>
            <span className="dir-entry-cat">{catLabel}</span>
          </div>
          <p className="dir-entry-tagline">{entry.description}</p>
        </div>
        <div className="dir-entry-hero-aside">
          <DirectoryLogo domain={domain} name={entry.name} />
          <a
            href={entry.website}
            target="_blank"
            rel="noopener noreferrer"
            className="dir-entry-cta"
          >
            Visit website
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Meta grid — Category | Type | Founded | HQ | Website, then Address full-width */}
      <div className="dir-entry-meta-grid">
        <div className="dir-entry-meta-item">
          <span className="dir-entry-meta-label">Category</span>
          <span className="dir-entry-meta-value">{catLabel}</span>
        </div>
        <div className="dir-entry-meta-item">
          <span className="dir-entry-meta-label">Type</span>
          <span className="dir-entry-meta-value">{entry.type}</span>
        </div>
        <div className="dir-entry-meta-item">
          <span className="dir-entry-meta-label">Founded</span>
          <span className="dir-entry-meta-value">{entry.founded}</span>
        </div>
        <div className="dir-entry-meta-item">
          <span className="dir-entry-meta-label">Headquarters</span>
          <span className="dir-entry-meta-value">{entry.hq}</span>
        </div>
        <div className="dir-entry-meta-item">
          <span className="dir-entry-meta-label">Website</span>
          <a
            href={entry.website}
            target="_blank"
            rel="noopener noreferrer"
            className="dir-entry-meta-link"
          >
            {entry.website.replace(/^https?:\/\//, '')}
          </a>
        </div>
        {entry.address && (
          <div className="dir-entry-meta-item dir-entry-meta-full">
            <span className="dir-entry-meta-label">Address</span>
            <span className="dir-entry-meta-value">{entry.address}</span>
          </div>
        )}
      </div>

      {/* About */}
      <div className="dir-entry-body">
        <h2 className="dir-entry-section-title">About {entry.name}</h2>
        <p className="dir-entry-long-desc">{entry.long_description || entry.description}</p>
      </div>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="dir-entry-tags">
          {entry.tags.map((tag: string) => (
            <span key={tag} className="dir-entry-tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Back link */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <Link href="/compass/directory" className="dir-entry-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to directory
        </Link>
      </div>
    </div>
  )
}
