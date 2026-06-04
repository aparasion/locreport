'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
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

const RELEVANCE_LABEL: Record<number, string> = {
  1: 'Peripheral', 2: 'Relevant', 3: 'Notable', 4: 'Major', 5: 'Groundbreaking',
}

const DOMAINS = [
  'syntax', 'semantics', 'phonology', 'sociolinguistics',
  'pragmatics', 'morphology', 'computational linguistics',
  'psycholinguistics', 'communication theory', 'applied linguistics',
  'historical linguistics',
]

const BATCH = 30

export default function ResearchClient({ articles }: { articles: ResearchRow[] }) {
  const [domain, setDomain] = useState('all')
  const [relevance, setRelevance] = useState('all')
  const [sort, setSort] = useState('date')
  const [loadedCount, setLoadedCount] = useState(BATCH)
  const [filterOpen, setFilterOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Domains actually present in data
  const activeDomains = DOMAINS.filter(d =>
    articles.some(a => a.research_domain?.toLowerCase() === d)
  )

  const filtered = (() => {
    let list = articles.filter(a => {
      if (domain !== 'all' && a.research_domain?.toLowerCase() !== domain) return false
      if (relevance !== 'all' && (a.relevance_score ?? 0) < parseInt(relevance)) return false
      return true
    })
    if (sort === 'relevance') {
      list = [...list].sort((a, b) => (b.relevance_score ?? 0) - (a.relevance_score ?? 0))
    } else if (sort === 'oldest') {
      list = [...list].sort((a, b) => a.published_at.localeCompare(b.published_at))
    } else {
      list = [...list].sort((a, b) => b.published_at.localeCompare(a.published_at))
    }
    return list
  })()

  useEffect(() => { setLoadedCount(BATCH) }, [domain, relevance, sort])

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setLoadedCount(c => c + BATCH)
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const visible = filtered.slice(0, loadedCount)
  const activeFilters = [domain !== 'all', relevance !== 'all'].filter(Boolean).length

  return (
    <div className="container">
      <div className="all-articles-header">
        <div className="all-articles-header__left">
          <h1 className="all-articles-title">Language Science</h1>
          <span className="all-articles-count">{filtered.length} paper{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <button
          className={`filter-toggle-btn${filterOpen ? ' is-active' : ''}`}
          onClick={() => setFilterOpen(v => !v)}
          aria-expanded={filterOpen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/>
          </svg>
          Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
        </button>
      </div>

      {filterOpen && (
        <div className="filter-bar">
          {/* Domain */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="res-domain">Domain</label>
            <select id="res-domain" className="filter-select" value={domain} onChange={e => setDomain(e.target.value)}>
              <option value="all">All domains</option>
              {activeDomains.map(d => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Relevance */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="res-relevance">Min. relevance</label>
            <select id="res-relevance" className="filter-select" value={relevance} onChange={e => setRelevance(e.target.value)}>
              <option value="all">Any</option>
              <option value="3">Notable+</option>
              <option value="4">Major+</option>
              <option value="5">Groundbreaking</option>
            </select>
          </div>

          {/* Sort */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="res-sort">Sort</label>
            <select id="res-sort" className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="date">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="relevance">By relevance</option>
            </select>
          </div>

          {activeFilters > 0 && (
            <button className="filter-clear-btn" onClick={() => { setDomain('all'); setRelevance('all'); setSort('date') }}>
              Clear filters
            </button>
          )}
        </div>
      )}

      <div className="article-list" style={{ marginTop: 'var(--space-5)' }}>
        {visible.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic', padding: 'var(--space-8) 0' }}>No papers match the current filters.</p>
        ) : visible.map((a, i) => {
          const isFeatured = i === 0 && loadedCount === BATCH && domain === 'all' && relevance === 'all'
          const date = new Date(a.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          if (isFeatured) {
            return (
              <article key={a.id} className="article-row article-row--featured">
                <div className="article-row__header">
                  <span className="article-row__badge article-row__badge--latest">Latest</span>
                  {a.relevance_score && (
                    <span className={`relevance-badge relevance-badge--${a.relevance_score}`}>
                      {RELEVANCE_LABEL[a.relevance_score]}
                    </span>
                  )}
                  {a.research_domain && (
                    <span className="research-domain-tag">{a.research_domain}</span>
                  )}
                  <span className="article-row__date">{date}</span>
                </div>
                <h2 className="article-row__title"><Link href={articleHref(a.slug)}>{a.title}</Link></h2>
                {a.excerpt && <p className="article-row__excerpt">{a.excerpt}</p>}
                <div className="article-row__footer">
                  {a.publisher && <span className="article-row__publisher">{a.publisher}</span>}
                  <Link className="article-row__read-more" href={articleHref(a.slug)}>Read more →</Link>
                </div>
              </article>
            )
          }
          return (
            <article key={a.id} className="article-row">
              <div className="article-row__header">
                <span className="new-badge">NEW</span>
                <span className="article-row__date">{date}</span>
                {a.relevance_score && a.relevance_score >= 3 && (
                  <span className={`relevance-badge relevance-badge--${a.relevance_score} relevance-badge--sm`}>
                    {RELEVANCE_LABEL[a.relevance_score]}
                  </span>
                )}
                {a.research_domain && (
                  <span className="research-domain-tag">{a.research_domain}</span>
                )}
              </div>
              <h2 className="article-row__title"><Link href={articleHref(a.slug)}>{a.title}</Link></h2>
              {a.excerpt && <p className="article-row__excerpt">{a.excerpt}</p>}
              <div className="article-row__footer">
                {a.publisher && <span className="article-row__publisher">{a.publisher}</span>}
                <Link className="article-row__read-more" href={articleHref(a.slug)}>Read more →</Link>
              </div>
            </article>
          )
        })}
      </div>

      <div ref={sentinelRef} style={{ height: 1 }} />
      {loadedCount < filtered.length && (
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', padding: 'var(--space-4) 0' }}>
          Showing {Math.min(loadedCount, filtered.length)} of {filtered.length}
        </p>
      )}
    </div>
  )
}
