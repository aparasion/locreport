'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { articleHref } from '@/lib/utils'

export interface ArticleRow {
  id: string
  title: string
  slug: string
  href?: string
  excerpt: string | null
  author: string | null
  article_type: string
  impact_score: number | null
  published_at: string
  topics: string[]
}

const CATEGORY_LABEL: Record<string, string> = {
  industry: 'Current news',
  'monthly-summary': 'Monthly report',
  annual: 'Annual report',
}

const IMPACT_LABEL: Record<number, string> = { 2: 'Notable', 3: 'Significant', 4: 'Major', 5: 'Disruptive' }
const BATCH = 30

function dateInt(iso: string) {
  return parseInt(iso.slice(0, 10).replace(/-/g, ''), 10)
}

export default function AllArticlesClient({ articles }: { articles: ArticleRow[] }) {
  const searchParams = useSearchParams()
  const [topic, setTopic] = useState('all')
  const [impact, setImpact] = useState('all')
  const [category, setCategory] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('date')
  const [sourceSort, setSourceSort] = useState<'count' | 'alpha'>('count')
  const [q, setQ] = useState(() => searchParams.get('q') ?? '')
  const [loadedCount, setLoadedCount] = useState(BATCH)
  const [filterOpen, setFilterOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // URL hash support
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (['quality', 'operations', 'governance', 'market', 'strategy'].includes(hash)) {
      setTopic(hash)
    }
  }, [])

  // Compute filtered+sorted list
  const filtered = (() => {
    const qLower = q.toLowerCase().trim()
    let list = articles.filter(a => {
      if (topic !== 'all' && !a.topics.includes(topic)) return false
      if (impact !== 'all' && (a.impact_score ?? 0) < parseInt(impact)) return false
      const d = dateInt(a.published_at)
      if (dateFrom && d < dateInt(dateFrom + 'T00:00:00Z')) return false
      if (dateTo && d > dateInt(dateTo + 'T00:00:00Z')) return false
      if (category !== 'all' && a.article_type !== category) return false
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
  useEffect(() => { setLoadedCount(BATCH) }, [topic, impact, category, dateFrom, dateTo, sort])

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
  const activeBadge = [topic !== 'all', impact !== 'all', category !== 'all', !!dateFrom, !!dateTo].filter(Boolean).length

  function clearAll() {
    setTopic('all'); setImpact('all'); setCategory('all')
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
              <label className="filter-label" htmlFor="category-filter">Category</label>
              <select className="filter-select" id="category-filter" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                <option value="industry">Current news</option>
                <option value="monthly-summary">Monthly reports</option>
                <option value="annual">Annual reports</option>
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

      <section className="all-articles-feed-section">
        <div className="all-articles-feed">
          {visible.map(article => {
            const dateDisplay = new Date(article.published_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })
            return (
              <Link
                key={article.id}
                href={article.href ?? articleHref(article.slug)}
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
                  {article.author && (
                    <span className="article-card-source">{article.author}</span>
                  )}
                  {CATEGORY_LABEL[article.article_type] && (
                    <span className="article-card-category">{CATEGORY_LABEL[article.article_type]}</span>
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
