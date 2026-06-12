import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SIGNALS } from '@/lib/signals'
import { articleHref } from '@/lib/utils'
import { SearchRefine } from './SearchRefine'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search — LocReport',
  robots: {
    index: false,
    follow: true,
  },
}

const STATIC_PAGES = [
  { title: '2026 Annual Global Market Report', href: '/reports/2026-annual-global-market-report', section: 'Reports', excerpt: 'Data-rich strategic brief covering market evolution, AI disruption, and competitive dynamics.' },
  { title: 'LocStock — Localization Market Index', href: '/compass/locstock', section: 'Compass', excerpt: 'Live equity overview of 34 publicly traded companies in language services and AI translation.' },
  { title: 'Compass — Industry Tools', href: '/compass', section: 'Compass', excerpt: 'Market intelligence tools: LocStock, industry directory, events, LLM pricing tracker.' },
  { title: 'Intelligence Overview', href: '/intelligence', section: 'Intelligence', excerpt: 'High-impact signals, trends and analysis for the localization industry.' },
  { title: 'Industry Directory', href: '/compass/directory', section: 'Compass', excerpt: 'Directory of companies in language services, translation technology, and localization.' },
  { title: 'LLM Pricing Tracker', href: '/compass/llm-pricing', section: 'Compass', excerpt: 'Comparative pricing for large language models used in translation and localization.' },
  { title: 'Events', href: '/compass/events', section: 'Compass', excerpt: 'Upcoming and recent industry events in localization and language technology.' },
]

function highlight(text: string, q: string): string {
  if (!q || !text) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const query = q.trim()

  const supabase = await createClient()

  // Sidebar data — always fetched
  const { data: monthlyReports } = await supabase
    .from('articles')
    .select('id, title, slug, published_at')
    .eq('article_type', 'monthly-summary')
    .order('published_at', { ascending: false })
    .limit(1)

  const latestMonthly = monthlyReports?.[0] ?? null
  const activeSignals = SIGNALS.filter(s => s.current_status === 'supported' || s.current_status === 'emerging').slice(0, 6)

  if (!query) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <SearchRefine initialQ="" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>Search</h1>
            <p style={{ color: 'var(--muted)' }}>Enter a search term above to search across all LocReport sections.</p>
          </div>
          <SearchSidebar latestMonthly={latestMonthly} activeSignals={activeSignals} />
        </div>
      </div>
    )
  }

  const qLower = query.toLowerCase()

  // Articles from Supabase
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, publisher, published_at, impact_score')
    .neq('article_type', 'theory')
    .neq('article_type', 'monthly-summary')
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,publisher.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(20)

  // Signals (static)
  const signals = SIGNALS.filter(s =>
    s.title.toLowerCase().includes(qLower) ||
    s.description.toLowerCase().includes(qLower) ||
    s.keywords.some(k => k.toLowerCase().includes(qLower))
  )

  // Static pages
  const pages = STATIC_PAGES.filter(p =>
    p.title.toLowerCase().includes(qLower) ||
    p.excerpt.toLowerCase().includes(qLower)
  )

  const total = (articles?.length ?? 0) + signals.length + pages.length

  const IMPACT_LABEL: Record<number, string> = { 2: 'Notable', 3: 'Significant', 4: 'Major', 5: 'Disruptive' }
  const IMPACT_COLOR: Record<number, string> = { 2: '#6b7280', 3: '#f59e0b', 4: '#ef4444', 5: '#7c3aed' }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'flex-start' }}>

        {/* Main results */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>
          <SearchRefine initialQ={query} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Results for <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>{query}</em>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 'var(--space-8)' }}>
            {total} result{total !== 1 ? 's' : ''} across all sections
          </p>

          {pages.length > 0 && (
            <Section label="Pages" count={pages.length}>
              {pages.map(p => (
                <ResultRow key={p.href} href={p.href} section={p.section}
                  title={<span dangerouslySetInnerHTML={{ __html: highlight(p.title, query) }} />}
                  excerpt={<span dangerouslySetInnerHTML={{ __html: highlight(p.excerpt, query) }} />}
                />
              ))}
            </Section>
          )}

          {signals.length > 0 && (
            <Section label="Signals" count={signals.length}>
              {signals.map(s => (
                <ResultRow key={s.id} href={`/intelligence/signals/${s.id}`} section="Intelligence"
                  title={<span dangerouslySetInnerHTML={{ __html: highlight(s.title, query) }} />}
                  excerpt={<span dangerouslySetInnerHTML={{ __html: highlight(s.description, query) }} />}
                  meta={<span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'capitalize' }}>{s.current_status} · {s.category}</span>}
                />
              ))}
            </Section>
          )}

          {(articles?.length ?? 0) > 0 && (
            <Section label="Articles" count={articles!.length}>
              {articles!.map(a => (
                <ResultRow key={a.id} href={articleHref(a.slug)} section={a.publisher ?? 'Article'}
                  title={<span dangerouslySetInnerHTML={{ __html: highlight(a.title, query) }} />}
                  excerpt={a.excerpt ? <span dangerouslySetInnerHTML={{ __html: highlight(a.excerpt, query) }} /> : null}
                  meta={
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {fmtDate(a.published_at)}
                      {a.impact_score && a.impact_score >= 2 && (
                        <span style={{ color: IMPACT_COLOR[a.impact_score], fontWeight: 600 }}>
                          {IMPACT_LABEL[a.impact_score]}
                        </span>
                      )}
                    </span>
                  }
                />
              ))}
            </Section>
          )}

          {total === 0 && (
            <p style={{ color: 'var(--muted)', marginTop: 'var(--space-6)' }}>
              No results found. Try a different search term.
            </p>
          )}
        </div>

        <SearchSidebar latestMonthly={latestMonthly} activeSignals={activeSignals} />
      </div>
    </div>
  )
}

function SearchSidebar({ latestMonthly, activeSignals }: {
  latestMonthly: { title: string; slug: string; published_at: string } | null
  activeSignals: typeof SIGNALS
}) {
  return (
    <aside className="post-sidebar" style={{ flexShrink: 0, width: 260 }}>
      {latestMonthly && (
        <div className="post-sidebar-widget">
          <p className="post-sidebar-widget__title">Latest Monthly Report</p>
          <Link href={articleHref(latestMonthly.slug)} style={{ textDecoration: 'none', color: 'var(--text)' }}>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.4, marginBottom: '0.25rem' }}>{latestMonthly.title}</p>
            <p style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
              {new Date(latestMonthly.published_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </p>
          </Link>
        </div>
      )}

      <div className="post-sidebar-widget">
        <p className="post-sidebar-widget__title">Annual Report</p>
        <Link href="/reports/2026-annual-global-market-report" style={{ textDecoration: 'none', color: 'var(--text)' }}>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.4, marginBottom: '0.25rem' }}>2026 Annual Global Market Report</p>
          <p style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>Localization &amp; Translation Industry</p>
        </Link>
      </div>

      <div className="post-sidebar-widget">
        <p className="post-sidebar-widget__title">Active Signals</p>
        <ul className="post-sidebar-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {activeSignals.map(s => (
            <li key={s.id} style={{ marginBottom: '0.5rem' }}>
              <Link href={`/intelligence/signals/${s.id}`} style={{ fontSize: '0.82rem', color: 'var(--text)', textDecoration: 'none', lineHeight: 1.4, display: 'block' }}>
                {s.title}
              </Link>
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'capitalize' }}>{s.current_status}</span>
            </li>
          ))}
        </ul>
        <Link href="/intelligence/signals" style={{ fontSize: '0.78rem', color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}>
          All signals →
        </Link>
      </div>
    </aside>
  )
}

function Section({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: 'var(--space-3)', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>{label}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', opacity: 0.7 }}>{count}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>{children}</div>
    </div>
  )
}

function ResultRow({ href, title, excerpt, meta, section }: {
  href: string
  title: React.ReactNode
  excerpt?: React.ReactNode | null
  meta?: React.ReactNode
  section: string
}) {
  return (
    <Link href={href} style={{ display: 'block', padding: '0.75rem 0', borderBottom: '1px solid var(--border, #f0f0f0)', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem', color: 'var(--text)' }}>{title}</div>
          {excerpt && <div style={{ fontSize: '0.83rem', color: 'var(--muted)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{excerpt}</div>}
          {meta && <div style={{ marginTop: '0.25rem' }}>{meta}</div>}
        </div>
        <span style={{ flexShrink: 0, fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-light, #eef2ff)', padding: '0.15rem 0.5rem', borderRadius: 4, whiteSpace: 'nowrap' }}>{section}</span>
      </div>
    </Link>
  )
}
