import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { articleHref } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Monthly Reports — LocReport',
  description: 'Monthly localization industry reports — curated summaries of translation, AI, and language technology trends.',
}

export const revalidate = 3600

function getTopicChips(title: string, excerpt: string): string[] {
  const text = `${title} ${excerpt}`.toLowerCase()
  const chips: string[] = []
  if (/\bai\b|llm|machine learning|neural/.test(text)) chips.push('AI')
  if (/lsp|language service|vendor|provider/.test(text)) chips.push('LSP')
  if (/platform|tool|workflow|software/.test(text)) chips.push('Tools')
  if (/regulation|law|compliance|policy/.test(text)) chips.push('Policy')
  return chips
}

export default async function MonthlyReportsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, published_at, signal_ids, source_count')
    .eq('article_type', 'monthly-summary')
    .order('published_at', { ascending: false })

  const posts = data ?? []
  const totalSources = posts.reduce((sum, p) => sum + ((p as any).source_count ?? 0), 0)
  const latest = posts[0]
  const archive = posts.slice(1)

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-12)' }}>

      {/* Hero */}
      <div className="mr-hero">
        <span className="mr-hero-eyebrow">Industry Intelligence</span>
        <p className="mr-hero-desc">Each month we scan hundreds of sources across translation, AI, and language technology — then distill the signals that matter for localization leaders.</p>
        <div className="mr-hero-stats">
          <div className="mr-stat">
            <span className="mr-stat-num">{posts.length}</span>
            <span className="mr-stat-label">Reports</span>
          </div>
          <div className="mr-stat-divider" />
          <div className="mr-stat">
            <span className="mr-stat-num">{totalSources > 0 ? `${totalSources}+` : '—'}</span>
            <span className="mr-stat-label">Articles analyzed</span>
          </div>
          <div className="mr-stat-divider" />
          <div className="mr-stat">
            <span className="mr-stat-num">Free</span>
            <span className="mr-stat-label">Always</span>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No monthly reports have been published yet.</p>
      ) : (
        <>
          {/* Featured — latest report */}
          <div className="mr-featured">
            <div className="mr-featured-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
              </svg>
              Latest Report
            </div>
            <h2 className="mr-featured-title">
              <Link href={articleHref(latest.slug)}>{latest.title}</Link>
            </h2>
            <p className="mr-featured-meta">
              {new Date(latest.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {(latest as any).source_count ? ` · ${(latest as any).source_count} articles analyzed` : ''}
            </p>
            {latest.excerpt && <p className="mr-featured-excerpt">{latest.excerpt}</p>}
            {latest.signal_ids?.length > 0 && (
              <div className="mr-featured-signals">
                {latest.signal_ids.slice(0, 3).map((sig: string) => (
                  <span key={sig} className="mr-signal-chip">{sig.replace(/-/g, ' ')}</span>
                ))}
              </div>
            )}
            <Link href={articleHref(latest.slug)} className="mr-featured-cta">Read Full Report →</Link>
          </div>

          {/* Archive */}
          {archive.length > 0 && (
            <>
              <div className="mr-archive-header">
                <span className="mr-archive-title">Archive</span>
              </div>
              <div className="mr-archive-grid">
                {archive.map(post => {
                  const chips = getTopicChips(post.title, post.excerpt ?? '')
                  return (
                    <article key={post.id} className="mr-card">
                      <div className="mr-card-top">
                        <span className="mr-card-date">
                          {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        {(post as any).source_count && (
                          <span className="mr-card-sources">{(post as any).source_count} articles</span>
                        )}
                      </div>
                      <h3 className="mr-card-title">
                        <Link href={articleHref(post.slug)}>{post.title}</Link>
                      </h3>
                      {post.excerpt && <p className="mr-card-excerpt">{post.excerpt}</p>}
                      {chips.length > 0 && (
                        <div className="mr-card-topics">
                          {chips.map(t => <span key={t} className="mr-topic-chip">{t}</span>)}
                        </div>
                      )}
                      <Link href={articleHref(post.slug)} className="mr-card-link">Read report →</Link>
                    </article>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
