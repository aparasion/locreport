'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { DirectoryEntry } from '@/lib/data/directory'

interface Props {
  entries: DirectoryEntry[]
}

const CATEGORIES = [
  { value: 'all',            label: 'All' },
  { value: 'tms',            label: 'TMS' },
  { value: 'cat',            label: 'CAT Tools' },
  { value: 'ai-mt',          label: 'AI / MT' },
  { value: 'lsp',            label: 'LSPs' },
  { value: 'av-localization',label: 'AV Localization' },
  { value: 'interpreting',   label: 'Interpreting' },
  { value: 'terminology',    label: 'Terminology' },
  { value: 'research',       label: 'Research' },
  { value: 'community',      label: 'Community' },
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
  terminology: 'Terminology', research: 'Research', community: 'Community',
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
            <div className="dir-card-top">
              <span className="dir-card-name">{entry.name}</span>
              <span className="dir-card-cat">{CAT_DISPLAY[entry.category] ?? entry.category}</span>
            </div>
            <div className="dir-card-meta">
              <span>{entry.hq}</span>
              <span>Est. {entry.founded}</span>
            </div>
            <div className="dir-card-type">{entry.type}</div>
            <p className="dir-card-desc">{entry.description}</p>
            <div className="dir-card-arrow" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
