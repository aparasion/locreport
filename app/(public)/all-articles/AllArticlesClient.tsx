'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export interface ArticleRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publisher: string | null
  impact_score: number | null
  published_at: string
  topics: string[]
}

const IMPACT_LABEL: Record<number, string> = { 2: 'Notable', 3: 'Significant', 4: 'Major', 5: 'Disruptive' }
const BATCH = 30

function dateInt(iso: string) {
  return parseInt(iso.slice(0, 10).replace(/-/g, ''), 10)
}

export default function AllArticlesClient({ articles }: { articles: ArticleRow[] }) {
  const [topic, setTopic] = useState('all')
  const [impact, setImpact] = useState('all')
  const [source, setSource] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('date')
  const [loadedCount, setLoadedCount] = useState(BATCH)
  const [filterOpen, setFilterOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Populate source options from article data
  const sourceOptions = (() => {
    const map: Record<string, { label: string; count: number }> = {}
    for (const a of articles) {
      if (!a.publisher) continue
      const key = a.publisher.toLowerCase()
      if (!map[key]) map[key] = { label: a.publisher, count: 0 }
      map[key].count++
    }
    return Object.entries(map)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, v]) => ({ value: key, label: `${v.label} (${v.count})` }))
  })()

  // URL hash support
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (['quality', 'operations', 'governance', 'market', 'strategy'].includes(hash)) {
      setTopic(hash)
    }
  }, [])

  // Compute filtered+sorted list
  const filtered = (() => {
    let list = articles.filter(a => {
      if (topic !== 'all' && !a.topics.includes(topic)) return false
      if (impact !== 'all' && (a.impact_score ?? 0) < parseInt(impact)) return false
      const d = dateInt(a.published_at)
      if (dateFrom && d < dateInt(dateFrom + 'T00:00:00Z')) return false
      if (dateTo && d > dateInt(dateTo + 'T00:00:00Z')) return false
      if (source !== 'all' && (a.publisher ?? '').toLowerCase() !== source) return false
      return true
    })
    if (sort === 'impact') {
      list = [...list].sort((a, b) => (b.impact_score ?? 0) - (a.impact_score ?? 0))
    } else if (sort === 'oldest') {
      list = [...list].sort((a, b) => a.published_at.localeCompare(b.published_at))
    } else {
      list = [...list].sort((a, b) => b.published_at.localeCompare(a.published_at))
    }
    return list
  })()

  // Reset loaded count when filters change
  useEffect(() => { setLoadedCount(BATCH) }, [topic, impact, source, dateFrom, dateTo, sort])

  // Infinite scroll observer
  useEffect(() => {
    if (loadedCount >= filtered.length) return
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setLoadedCount(c => Math.min(c + BATCH, filtered.length))
      }
    }, { rootMargin: '300px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadedCount, filtered.length])

  const visible = filtered.slice(0, loadedCount)
  const activeBadge = [topic !== 'all', impact !== 'all', source !== 'all', !!dateFrom, !!dateTo].filter(Boolean).length

  function clearAll() {
    setTopic('all'); setImpact('all'); setSource('all')
    setDateFrom(''); setDateTo(''); setSort('date')
  }

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-12)' }}>
      <section className="all-articles-hero">
        <h1>All articles</h1>
        <p className="all-articles-subtitle">{articles.length} articles across the localization intelligence archive.</p>
      </section>

      <section className={`all-articles-filter-bar${filterOpen ? ' is-open' : ''}`}>
        <button
          className="filter-bar-toggle"
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen(o => !o)}
        >
          <span className="filter-bar-toggle-left">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="filter-bar-toggle-label">Filters</span>
            {activeBadge > 0 && (
              <span className="filter-bar-toggle-badge">{activeBadge}</span>
            )}
          </span>
          <svg className="filter-bar-toggle-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="filter-bar-collapsible">
          <div className="filter-bar-inner">
            <div className="filter-group">
              <label className="filter-label" htmlFor="topic-select">Topic</label>
              <select className="filter-select" id="topic-select" value={topic} onChange={e => setTopic(e.target.value)}>
                <option value="all">All topics</option>
                <option value="quality">Quality</option>
                <option value="operations">Operations</option>
                <option value="governance">Governance</option>
                <option value="market">Market</option>
                <option value="strategy">Strategy</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="impact-select">Impact</label>
              <select className="filter-select" id="impact-select" value={impact} onChange={e => setImpact(e.target.value)}>
                <option value="all">All levels</option>
                <option value="4">Major+</option>
                <option value="3">Significant+</option>
                <option value="2">Notable+</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="source-filter">Source</label>
              <select className="filter-select" id="source-filter" value={source} onChange={e => setSource(e.target.value)}>
                <option value="all">All sources</option>
                {sourceOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="date-from">From</label>
              <input type="date" className="filter-select filter-date" id="date-from" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="date-to">To</label>
              <input type="date" className="filter-select filter-date" id="date-to" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="filter-group filter-group--sort">
              <label className="filter-label" htmlFor="sort-select">Sort</label>
              <select className="filter-select" id="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="date">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="impact">Highest impact</option>
              </select>
            </div>
          </div>
          <div className="filter-status-row">
            <button className="filter-reset-btn" onClick={clearAll}>Clear all</button>
            <p className="filter-count" aria-live="polite">
              {filtered.length === articles.length
                ? `${filtered.length} articles`
                : `${filtered.length} of ${articles.length} articles`}
            </p>
          </div>
        </div>
      </section>

      <p style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
        Looking for research articles? Visit <Link href="/research" style={{ color: 'var(--accent)', fontWeight: 600 }}>Language Science</Link>
      </p>

      <section className="all-articles-feed-section">
        <div className="all-articles-feed">
          {visible.map(article => {
            const dateDisplay = new Date(article.published_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })
            return (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="article-card"
              >
                <div className="article-card-body">
                  <h3 className="article-card-title">{article.title}</h3>
                  {article.excerpt && (
                    <p className="article-card-excerpt">
                      {article.excerpt.length > 160 ? article.excerpt.slice(0, 160) + '…' : article.excerpt}
                    </p>
                  )}
                  {article.topics.length > 0 && (
                    <div className="article-card-tags">
                      {article.topics.map(t => (
                        <span key={t} className={`article-tag article-tag--${t}`}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="article-card-meta">
                  <time className="article-card-date">{dateDisplay}</time>
                  {article.impact_score && article.impact_score >= 2 && (
                    <span className={`article-card-impact article-card-impact--${article.impact_score}`}>
                      {IMPACT_LABEL[article.impact_score]}
                    </span>
                  )}
                  {article.publisher && (
                    <span className="article-card-source">{article.publisher}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {loadedCount < filtered.length && (
          <div className="autoload-loader is-active">Loading more…</div>
        )}
        <div ref={sentinelRef} className="autoload-sentinel" />
      </section>
    </div>
  )
}
