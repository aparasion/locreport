'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useMemo } from 'react'
import { articleHref } from '@/lib/utils'

export interface ResearchRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publisher: string | null
  relevance_score: number | null
  research_domain: string | null
  published_at: string
}

const BATCH = 30

export default function ResearchClient({ articles }: { articles: ResearchRow[] }) {
  const [domain, setDomain] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [source, setSource] = useState('all')
  const [loadedCount, setLoadedCount] = useState(BATCH)
  const [filterOpen, setFilterOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const domainOptions = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of articles) {
      const d = a.research_domain?.toLowerCase()
      if (d) map[d] = (map[d] ?? 0) + 1
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [articles])

  const sourceOptions = useMemo(() => {
    const map: Record<string, { label: string; count: number }> = {}
    for (const a of articles) {
      if (!a.publisher) continue
      const key = a.publisher.toLowerCase()
      if (!map[key]) map[key] = { label: a.publisher, count: 0 }
      map[key].count++
    }
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count)
  }, [articles])

  const filtered = useMemo(() => {
    const now = Date.now()
    const cutoffMs = dateRange !== 'all' ? now - parseInt(dateRange) * 86400000 : null
    return articles.filter(a => {
      if (domain !== 'all' && a.research_domain?.toLowerCase() !== domain) return false
      if (source !== 'all' && (a.publisher ?? '').toLowerCase() !== source) return false
      if (cutoffMs && new Date(a.published_at).getTime() < cutoffMs) return false
      return true
    }).sort((a, b) => b.published_at.localeCompare(a.published_at))
  }, [articles, domain, dateRange, source])

  useEffect(() => { setLoadedCount(BATCH) }, [domain, dateRange, source])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setLoadedCount(c => c + BATCH)
    }, { rootMargin: '300px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const activeFilters = [domain !== 'all', dateRange !== 'all', source !== 'all'].filter(Boolean).length
  const visible = filtered.slice(0, loadedCount)

  function clearFilters() { setDomain('all'); setDateRange('all'); setSource('all') }

  return (
    <>
      <section className="all-articles-hero">
        <h1>Language Science</h1>
        <p className="all-articles-subtitle">{articles.length} peer-reviewed research articles on linguistics and communication theory.</p>
      </section>

      <p className="theory-crosslink" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
        Looking for industry articles? Visit <Link href="/articles" style={{ color: 'var(--accent)', fontWeight: 600 }}>All articles</Link>
      </p>

      <section className={`all-articles-filter-bar research-filter-panel${filterOpen ? ' is-open' : ''}`}>
        <button className="filter-bar-toggle" aria-expanded={filterOpen} onClick={() => setFilterOpen(v => !v)}>
          <span className="filter-bar-toggle-left">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="filter-bar-toggle-label">Filters</span>
            {activeFilters > 0 && <span className="filter-bar-toggle-badge">{activeFilters}</span>}
          </span>
          <svg className="filter-bar-toggle-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="filter-bar-collapsible">
          <div className="filter-bar-inner">
            <div className="filter-group">
              <label className="filter-label" htmlFor="domain-filter">Domain</label>
              <select id="domain-filter" className="filter-select" value={domain} onChange={e => setDomain(e.target.value)}>
                <option value="all">All domains</option>
                {domainOptions.map(([d, count]) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)} ({count})</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="date-filter">Date</label>
              <select id="date-filter" className="filter-select" value={dateRange} onChange={e => setDateRange(e.target.value)}>
                <option value="all">All time</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="source-filter">Source</label>
              <select id="source-filter" className="filter-select" value={source} onChange={e => setSource(e.target.value)}>
                <option value="all">All sources</option>
                {sourceOptions.map(([key, v]) => (
                  <option key={key} value={key}>{v.label} ({v.count})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="filter-status-row">
            <p className="filter-count" aria-live="polite">
              {filtered.length === articles.length
                ? `${filtered.length} articles`
                : `${filtered.length} of ${articles.length} articles`}
            </p>
            {activeFilters > 0 && (
              <button className="filter-reset-btn" onClick={clearFilters}>Clear filters</button>
            )}
          </div>
        </div>
      </section>

      <section className="all-articles-feed-section">
        <div className="intel-high-impact-list">
          {visible.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontStyle: 'italic', padding: 'var(--space-8) 0' }}>No articles match the current filters.</p>
          ) : visible.map(a => {
            const date = new Date(a.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            return (
              <Link key={a.id} href={articleHref(a.slug)} className="intel-impact-item">
                <div className="intel-impact-item-top">
                  {a.research_domain && (
                    <span className="article-tag article-tag--theory">{a.research_domain}</span>
                  )}
                  <span className="intel-impact-date">{date}</span>
                </div>
                <h4 className="intel-impact-title">{a.title}</h4>
                {a.excerpt && (
                  <p className="intel-impact-implication">
                    {a.excerpt.length > 180 ? a.excerpt.slice(0, 180) + '…' : a.excerpt}
                  </p>
                )}
                {a.publisher && (
                  <div className="intel-impact-segments">
                    <span className="segment-tag segment-tag--sm">{a.publisher}</span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
        <div ref={sentinelRef} style={{ height: 1 }} />
        {loadedCount < filtered.length && (
          <div className="autoload-loader is-active">Loading more…</div>
        )}
      </section>
    </>
  )
}
