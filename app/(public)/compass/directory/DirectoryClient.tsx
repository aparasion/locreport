'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { DirectoryEntry } from '@/lib/data/directory'

interface Props {
  entries: DirectoryEntry[]
}

const CATEGORIES = [
  { value: 'all',              label: 'All' },
  { value: 'tms',              label: 'TMS' },
  { value: 'cat',              label: 'CAT Tools' },
  { value: 'ai-mt',            label: 'AI / MT' },
  { value: 'lsp',              label: 'LSPs' },
  { value: 'av-localization',  label: 'AV Localization' },
  { value: 'interpreting',     label: 'Interpreting' },
  { value: 'voice-ai',         label: 'Voice AI' },
  { value: 'data-ai',          label: 'Data & AI' },
  { value: 'terminology',      label: 'Terminology' },
  { value: 'transcription',    label: 'Transcription' },
  { value: 'live-communication', label: 'Live Comms' },
  { value: 'ai-sign',          label: 'Sign Language AI' },
  { value: 'research',         label: 'Research' },
  { value: 'community',        label: 'Community' },
]

const SORT_OPTIONS = [
  { value: 'az',      label: 'A – Z' },
  { value: 'za',      label: 'Z – A' },
  { value: 'newest',  label: 'Newest first' },
  { value: 'oldest',  label: 'Oldest first' },
]

const CAT_DISPLAY: Record<string, string> = {
  tms: 'TMS', cat: 'CAT', 'ai-mt': 'AI/MT', lsp: 'LSP',
  'av-localization': 'AV', interpreting: 'Interpreting',
  'voice-ai': 'Voice AI', 'data-ai': 'Data & AI',
  terminology: 'Terminology', transcription: 'Transcription',
  'live-communication': 'Live Comms', 'ai-sign': 'Sign AI',
  research: 'Research', community: 'Community',
}

function CardLogo({ entry }: { entry: DirectoryEntry }) {
  const domain = entry.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const initial = entry.name.charAt(0).toUpperCase()
  const [src, setSrc] = useState<string | null>(
    entry.logo_url || `https://logo.clearbit.com/${domain}`
  )
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return (
      <div className="dir-card-logo-fallback" aria-hidden="true">
        {initial}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="dir-card-logo"
      onError={() => {
        if (entry.logo_url && src === entry.logo_url) {
          setSrc(`https://logo.clearbit.com/${domain}`)
        } else {
          setFailed(true)
        }
      }}
    />
  )
}

export function DirectoryClient({ entries }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('az')

  const results = useMemo(() => {
    let filtered = entries
    if (category !== 'all') {
      filtered = filtered.filter(e => e.category === category)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      )
    }
    return [...filtered].sort((a, b) => {
      if (sort === 'az') return a.name.localeCompare(b.name)
      if (sort === 'za') return b.name.localeCompare(a.name)
      if (sort === 'newest') return b.founded - a.founded
      return a.founded - b.founded
    })
  }, [entries, search, category, sort])

  return (
    <>
      <div className="dir-controls">
        <div className="dir-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="dir-search"
            placeholder="Search tools and companies…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search directory"
          />
        </div>
        <select className="dir-sort" value={sort} onChange={e => setSort(e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="dir-cats">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            className={`dir-cat-btn${category === c.value ? ' active' : ''}`}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="dir-count">{results.length} result{results.length !== 1 ? 's' : ''}</p>

      <div className="dir-grid">
        {results.map(entry => (
          <Link
            key={entry.slug || entry.name}
            href={`/compass/directory/${entry.slug || entry.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="dir-card"
          >
            <div className="dir-card-header">
              <CardLogo entry={entry} />
              <div className="dir-card-header-text">
                <div className="dir-card-top">
                  <span className="dir-card-name">{entry.name}</span>
                  <span className="dir-card-cat">{CAT_DISPLAY[entry.category] ?? entry.category}</span>
                </div>
                <div className="dir-card-meta">
                  <span>{entry.hq}</span>
                  <span>Est. {entry.founded}</span>
                </div>
              </div>
            </div>
            <p className="dir-card-desc">{entry.description}</p>
            <div className="dir-card-footer">
              <span className="dir-card-type">{entry.type}</span>
              <div className="dir-card-arrow" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
