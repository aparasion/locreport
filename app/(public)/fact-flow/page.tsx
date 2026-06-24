import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Fact Flow — LocReport',
  description: 'Curated news signals from the localization and language technology industry — distilled daily from primary sources.',
  openGraph: {
    title: 'Fact Flow — LocReport',
    description: 'Curated news signals from the localization and language technology industry.',
    url: 'https://locreport.com/fact-flow',
  },
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
    const key = new Date(f.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(f)
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, count: items.length, items }))
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
        .ff-rss-link { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; color: var(--muted); text-decoration: none; padding: 6px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); transition: all .15s; }
        .ff-rss-link:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }
        .ff-rss-icon { color: #E8773E; }

        .ff-day-group { margin-bottom: var(--space-8); }
        .ff-day-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); }
        .ff-day-label { font-family: var(--font-display); font-size: 0.78rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
        .ff-day-line { flex: 1; height: 1px; background: var(--hairline); }
        .ff-day-count { font-size: 0.7rem; font-weight: 600; color: var(--muted); background: var(--bg-secondary); padding: 2px 8px; border-radius: 20px; }

        .ff-stream { display: flex; flex-direction: column; gap: var(--space-2); }

        .ff-bubble { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5); transition: box-shadow .15s, border-color .15s; }
        .ff-bubble:hover { box-shadow: var(--card-shadow-hover); border-color: rgba(53,80,245,.12); }

        .ff-bubble-body { display: flex; align-items: baseline; gap: var(--space-4); }
        .ff-bullet { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; margin-top: 7px; opacity: .5; }
        .ff-content { font-size: 0.975rem; line-height: 1.55; color: var(--text); flex: 1; }

        .ff-bubble-footer { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-3); gap: var(--space-3); flex-wrap: wrap; }
        .ff-meta { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
        .ff-source-name { font-size: 0.72rem; font-weight: 600; color: var(--muted); }
        .ff-source-link { font-size: 0.72rem; color: var(--muted); text-decoration: none; }
        .ff-source-link:hover { color: var(--accent); }
        .ff-sep { font-size: 0.72rem; color: var(--hairline); }
        .ff-time { font-size: 0.7rem; color: var(--muted); }
        .ff-article-link { font-size: 0.75rem; font-weight: 600; color: var(--accent); text-decoration: none; white-space: nowrap; }
        .ff-article-link:hover { text-decoration: underline; }

        .ff-empty { text-align: center; padding: var(--space-16) 0; color: var(--muted); }
        .ff-empty h2 { font-family: var(--font-display); font-size: 1.25rem; color: var(--text); margin-bottom: var(--space-2); }
      `}</style>

      <div className="ff-page">
        <div className="ff-hero">
          <div className="ff-hero-eyebrow">
            <span className="ff-hero-dot" />
            <span className="ff-hero-label">Live stream</span>
          </div>
          <h1>Fact Flow</h1>
          <p className="ff-hero-desc">Bare facts served real-time.</p>
          <a href="/fact-flow/feed.xml" className="ff-rss-link">
            <svg className="ff-rss-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="6.18" cy="17.82" r="2.18"/>
              <path d="M4 11.64A8.36 8.36 0 0 1 12.36 20"/>
              <path d="M4 6a14 14 0 0 1 14 14"/>
            </svg>
            RSS Feed
          </a>
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
                {items.map(fact => (
                  <div key={fact.id} className="ff-bubble">
                    <div className="ff-bubble-body">
                      <span className="ff-bullet" aria-hidden="true" />
                      <p className="ff-content">{fact.content}</p>
                    </div>
                    <div className="ff-bubble-footer">
                      <div className="ff-meta">
                        {fact.source_name && <span className="ff-source-name">{fact.source_name}</span>}
                        {fact.source_name && fact.source_url && <span className="ff-sep">·</span>}
                        {fact.source_url && (
                          <a href={fact.source_url} target="_blank" rel="noopener noreferrer" className="ff-source-link">
                            source ↗
                          </a>
                        )}
                        <span className="ff-sep">·</span>
                        <time className="ff-time" dateTime={fact.created_at} title={formatDate(fact.created_at)}>
                          {timeAgo(fact.created_at)}
                        </time>
                      </div>
                      {fact.article_id ? <ArticleLink articleId={fact.article_id} /> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
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
