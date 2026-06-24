import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CATEGORY_LABELS, type FactCategory } from '@/lib/facts'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Fact Flow — LocReport',
  description: 'Raw intelligence extracted from industry sources — a live stream of verified facts, data points, milestones, and quotes from the localization and language technology space.',
  openGraph: {
    title: 'Fact Flow — LocReport',
    description: 'A live stream of verified facts extracted from localization and language technology sources.',
    url: 'https://locreport.com/fact-flow',
  },
}

function categoryStyle(category: FactCategory): { badge: string; icon: string } {
  const map: Record<FactCategory, { badge: string; icon: string }> = {
    entity:    { badge: 'ff-badge ff-badge--entity',    icon: '◈' },
    datapoint: { badge: 'ff-badge ff-badge--datapoint', icon: '◎' },
    milestone: { badge: 'ff-badge ff-badge--milestone', icon: '◆' },
    quote:     { badge: 'ff-badge ff-badge--quote',     icon: '❝' },
  }
  return map[category] ?? map.entity
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function FactFlowPage() {
  const supabase = await createClient()

  const { data: facts } = await supabase
    .from('facts')
    .select('id, content, category, source_url, source_name, article_id, created_at')
    .order('created_at', { ascending: false })
    .limit(120)

  const grouped = groupByDay(facts ?? [])

  return (
    <>
      <style>{`
        .ff-page { max-width: var(--content-width); margin: 0 auto; padding: var(--space-8) var(--page-gutter); }

        .ff-hero { margin-bottom: var(--space-8); }
        .ff-hero-eyebrow { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3); }
        .ff-hero-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: ff-pulse 2s ease-in-out infinite; }
        @keyframes ff-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        .ff-hero-label { font-size: 0.72rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
        .ff-hero h1 { font-family: var(--font-display); font-size: clamp(1.75rem,4vw,2.5rem); font-weight: 700; letter-spacing: -.02em; color: var(--text); margin: 0 0 var(--space-3); }
        .ff-hero-desc { font-size: 1rem; color: var(--muted); line-height: 1.6; max-width: 520px; margin: 0 0 var(--space-4); }
        .ff-hero-actions { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
        .ff-rss-link { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; color: var(--muted); text-decoration: none; padding: 6px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); transition: all .15s; }
        .ff-rss-link:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }
        .ff-rss-icon { color: #E8773E; }

        .ff-legend { display: flex; flex-wrap: wrap; gap: var(--space-2); }
        .ff-legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; font-weight: 600; color: var(--muted); }

        .ff-day-group { margin-bottom: var(--space-8); }
        .ff-day-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); }
        .ff-day-label { font-family: var(--font-display); font-size: 0.78rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
        .ff-day-line { flex: 1; height: 1px; background: var(--hairline); }
        .ff-day-count { font-size: 0.7rem; font-weight: 600; color: var(--muted); background: var(--bg-secondary); padding: 2px 8px; border-radius: 20px; }

        .ff-stream { display: flex; flex-direction: column; gap: var(--space-3); }

        .ff-bubble { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5); transition: box-shadow .15s, border-color .15s; position: relative; }
        .ff-bubble:hover { box-shadow: var(--card-shadow-hover); border-color: rgba(53,80,245,.15); }

        .ff-bubble-top { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-3); }
        .ff-bubble-badges { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
        .ff-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.68rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; padding: 3px 8px; border-radius: var(--radius-sm); }
        .ff-badge--entity    { background: rgba(53,80,245,.1);  color: var(--accent); }
        .ff-badge--datapoint { background: rgba(22,163,74,.1);  color: #16a34a; }
        .ff-badge--milestone { background: rgba(181,116,15,.12); color: var(--gold); }
        .ff-badge--quote     { background: rgba(100,100,120,.1); color: var(--muted); }
        [data-theme="dark"] .ff-badge--datapoint { background: rgba(22,163,74,.15); color: #4ade80; }

        .ff-time { font-size: 0.7rem; color: var(--muted); white-space: nowrap; flex-shrink: 0; margin-top: 2px; }

        .ff-content { font-size: 0.92rem; line-height: 1.55; color: var(--text); }
        .ff-content strong { font-weight: 700; }

        .ff-bubble-footer { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--hairline); gap: var(--space-3); flex-wrap: wrap; }
        .ff-source { font-size: 0.72rem; color: var(--muted); }
        .ff-source strong { color: var(--text); font-weight: 600; }
        .ff-article-link { font-size: 0.72rem; font-weight: 600; color: var(--accent); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
        .ff-article-link:hover { text-decoration: underline; }
        .ff-source-link { font-size: 0.72rem; color: var(--muted); text-decoration: none; }
        .ff-source-link:hover { color: var(--accent); }

        .ff-empty { text-align: center; padding: var(--space-16) 0; color: var(--muted); }
        .ff-empty h2 { font-family: var(--font-display); font-size: 1.25rem; color: var(--text); margin-bottom: var(--space-2); }
      `}</style>

      <div className="ff-page">
        <div className="ff-hero">
          <div className="ff-hero-eyebrow">
            <span className="ff-hero-dot" />
            <span className="ff-hero-label">Live intelligence stream</span>
          </div>
          <h1>Fact Flow</h1>
          <p className="ff-hero-desc">
            Raw facts, data points, milestones, and quotes extracted from industry sources — before editorial shaping. Unfiltered signal.
          </p>
          <div className="ff-hero-actions">
            <a href="/fact-flow/feed.xml" className="ff-rss-link">
              <svg className="ff-rss-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="6.18" cy="17.82" r="2.18"/>
                <path d="M4 11.64A8.36 8.36 0 0 1 12.36 20"/>
                <path d="M4 6a14 14 0 0 1 14 14"/>
              </svg>
              RSS Feed
            </a>
            <div className="ff-legend">
              {(['entity','datapoint','milestone','quote'] as FactCategory[]).map(cat => {
                const { badge, icon } = categoryStyle(cat)
                return (
                  <span key={cat} className="ff-legend-item">
                    <span className={badge}>{icon} {CATEGORY_LABELS[cat]}</span>
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {grouped.length === 0 ? (
          <div className="ff-empty">
            <h2>No facts yet</h2>
            <p>Facts will appear here as articles are ingested.</p>
          </div>
        ) : (
          grouped.map(({ label, count, items }) => (
            <div key={label} className="ff-day-group">
              <div className="ff-day-header">
                <span className="ff-day-label">{label}</span>
                <span className="ff-day-line" />
                <span className="ff-day-count">{count} facts</span>
              </div>
              <div className="ff-stream">
                {items.map(fact => {
                  const { badge, icon } = categoryStyle(fact.category as FactCategory)
                  return (
                    <div key={fact.id} className="ff-bubble">
                      <div className="ff-bubble-top">
                        <div className="ff-bubble-badges">
                          <span className={badge}>{icon} {CATEGORY_LABELS[fact.category as FactCategory] ?? fact.category}</span>
                        </div>
                        <time className="ff-time" dateTime={fact.created_at} title={formatDate(fact.created_at)}>
                          {timeAgo(fact.created_at)}
                        </time>
                      </div>
                      <div
                        className="ff-content"
                        dangerouslySetInnerHTML={{ __html: renderFactContent(fact.content) }}
                      />
                      <div className="ff-bubble-footer">
                        <span className="ff-source">
                          {fact.source_name ? <><strong>{fact.source_name}</strong>{' · '}</> : null}
                          {fact.source_url ? (
                            <a href={fact.source_url} target="_blank" rel="noopener noreferrer" className="ff-source-link">
                              source ↗
                            </a>
                          ) : null}
                        </span>
                        {fact.article_id ? (
                          <ArticleLink articleId={fact.article_id} />
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

function renderFactContent(raw: string): string {
  // Escape HTML, then apply safe inline formatting
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[UNVERIFIED CLAIM BY SOURCE\]/g, '<span style="color:var(--gold);font-size:.7em;font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-right:4px">⚠ Unverified</span>')
}

type FactRow = {
  id: string
  content: string
  category: string
  source_url: string | null
  source_name: string | null
  article_id: string | null
  created_at: string
}

function groupByDay(facts: FactRow[]) {
  const map = new Map<string, FactRow[]>()
  for (const f of facts) {
    const d = new Date(f.created_at)
    const key = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(f)
  }
  return Array.from(map.entries()).map(([label, items]) => ({
    label,
    count: items.length,
    items,
  }))
}

async function ArticleLink({ articleId }: { articleId: string }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('slug')
    .eq('id', articleId)
    .single()
  if (!data?.slug) return null
  return (
    <Link href={`/articles/${data.slug}`} className="ff-article-link">
      Read article →
    </Link>
  )
}
