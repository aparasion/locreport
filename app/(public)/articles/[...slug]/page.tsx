import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { marked } from 'marked'
import { Article } from '@/lib/types'
import { articleHref } from '@/lib/utils'
import { SIGNAL_MAP } from '@/lib/signals'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 86400

type Props = { params: Promise<{ slug: string[] }> }

const IMPACT_LABEL: Record<number, string> = { 1: 'Routine', 2: 'Notable', 3: 'Significant', 4: 'Major', 5: 'Disruptive' }

async function fetchArticle(slugParts: string[]) {
  const supabase = await createClient()
  const joined = slugParts.join('/')
  const bare = slugParts[slugParts.length - 1]

  const { data: exact } = await supabase
    .from('articles').select('*').eq('slug', joined).maybeSingle()
  if (exact) return { article: exact as Article, shouldRedirect: slugParts.length > 1 }

  const { data: bySuffix } = await supabase
    .from('articles').select('*').ilike('slug', `%/${bare}`).maybeSingle()
  if (bySuffix) return { article: bySuffix as Article, shouldRedirect: false }

  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await fetchArticle(slug)
  if (!result) return {}
  const { article: a } = result
  return { title: `${a.title} — LocReport`, description: a.excerpt ?? undefined }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const result = await fetchArticle(slug)
  if (!result) notFound()

  const { article, shouldRedirect } = result!

  if (shouldRedirect) {
    redirect(articleHref(article.slug))
  }

  const a = article as Article

  // Strip excerpt from the top of content when the generator duplicates it
  let content = a.content
  if (a.excerpt) {
    const excerptNorm = a.excerpt.trim()
    const contentTrimmed = content.trimStart()
    if (contentTrimmed.startsWith(excerptNorm)) {
      content = contentTrimmed.slice(excerptNorm.length).trimStart()
    }
  }
  const html = marked.parse(content) as string
  const date = new Date(a.published_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  // Resolve signal metadata for this article
  const articleSignals = (a.signal_ids ?? [])
    .map(id => SIGNAL_MAP.get(id))
    .filter(Boolean)

  // Fetch related articles (share at least one signal_id, excluding this article)
  const supabase = await createClient()
  let relatedArticles: Article[] = []
  if (articleSignals.length > 0) {
    const { data: related } = await supabase
      .from('articles')
      .select('id, title, slug, publisher, published_at, signal_ids')
      .neq('slug', a.slug)
      .neq('article_type', 'theory')
      .overlaps('signal_ids', a.signal_ids)
      .order('published_at', { ascending: false })
      .limit(5)
    relatedArticles = (related as Article[]) ?? []
  }

  const hasSidebar = (a.business_implications?.length > 0) || (a.affected_segments?.length > 0) || !!a.impact_score || articleSignals.length > 0

  if (hasSidebar) {
    return (
      <div className="post-layout">
        <article className="post">
          <PostHeader a={a} date={date} html={html} articleSignals={articleSignals as NonNullable<ReturnType<typeof SIGNAL_MAP.get>>[]} />
        </article>
        <aside className="post-sidebar">
          {a.impact_score && (
            <div className="post-sidebar-widget">
              <p className="post-sidebar-widget__title">Intelligence</p>
              <div className="post-sidebar-badges">
                <span className={`impact-badge impact-badge--${a.impact_score} impact-badge--inline`}>
                  {IMPACT_LABEL[a.impact_score]}
                </span>
                {a.time_horizon && (
                  <span className={`time-horizon-badge time-horizon-badge--${a.time_horizon}`}>
                    {a.time_horizon === 'now' ? 'Immediate' : a.time_horizon === '6months' ? '6-Month Horizon' : 'Long-Term'}
                  </span>
                )}
              </div>
              {a.business_implications?.length > 0 && (
                <div className="post-sidebar-section">
                  <p className="post-sidebar-section__label">Why this matters</p>
                  <ul className="post-sidebar-list">
                    {a.business_implications.map((imp, i) => <li key={i}>{imp}</li>)}
                  </ul>
                </div>
              )}
              {a.affected_segments?.length > 0 && (
                <div className="intelligence-segments post-sidebar-segments">
                  {a.affected_segments.map(seg => (
                    <span key={seg} className="segment-tag" data-segment={seg}>{seg}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {articleSignals.length > 0 && (
            <div className="post-sidebar-widget">
              <p className="post-sidebar-widget__title">Signals</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                {(articleSignals as NonNullable<ReturnType<typeof SIGNAL_MAP.get>>[]).map(s => (
                  <Link
                    key={s.id}
                    href={`/intelligence/signals/${s.id}`}
                    style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', lineHeight: 1.4 }}
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {relatedArticles.length > 0 && (
            <div className="post-sidebar-widget">
              <p className="post-sidebar-widget__title">Related Reading</p>
              <ul className="post-sidebar-related">
                {relatedArticles.map(r => (
                  <li key={r.id}>
                    <Link href={articleHref(r.slug)}>
                      {r.title}
                      <span className="related-date">
                        {new Date(r.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    )
  }

  return (
    <div className="container">
      <article className="post">
        <PostHeader a={a} date={date} html={html} articleSignals={[]} />
      </article>
    </div>
  )
}

type SignalType = NonNullable<ReturnType<typeof SIGNAL_MAP.get>>

function PostHeader({ a, date, html, articleSignals }: { a: Article; date: string; html: string; articleSignals: SignalType[] }) {
  return (
    <>
      <nav style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 'var(--space-4)', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: 'var(--muted)' }}>Home</Link>
        <span>›</span>
        <Link href="/articles" style={{ color: 'var(--muted)' }}>Articles</Link>
        <span>›</span>
        <span style={{ color: 'var(--text)' }}>{a.title.slice(0, 40)}{a.title.length > 40 ? '…' : ''}</span>
      </nav>

      <h1>{a.title}</h1>

      <div className="post-meta" style={{ marginBottom: 'var(--space-5)' }}>
        <span>{date}</span>
        {a.publisher && <span style={{ margin: '0 0.4rem' }}>·</span>}
        {a.publisher && <span>{a.publisher}</span>}
        {a.author && <span style={{ margin: '0 0.4rem' }}>·</span>}
        {a.author && <span>{a.author}</span>}
      </div>

      {a.excerpt && (
        <p style={{ fontSize: '1.15rem', color: 'var(--muted)', marginBottom: 'var(--space-6)', lineHeight: 1.6, fontWeight: 400 }}>
          {a.excerpt}
        </p>
      )}

      {/* Signal context — mirrors Jekyll post.html signal-context paragraph */}
      {articleSignals.length > 0 && (
        <p className="signal-context">
          {articleSignals.map((s, i) => (
            <span key={s.id}>
              <Link href={`/intelligence/signals/${s.id}`}>{s.title}</Link>
              {i < articleSignals.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      )}

      <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />

      {a.source_url && (
        <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border)' }}>
          <a href={a.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 600 }}>
            View original source →
          </a>
        </div>
      )}

      {a.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: 'var(--space-6)' }}>
          {a.tags.map(tag => (
            <Link key={tag} href={`/articles?q=${encodeURIComponent(tag)}`}
              style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', color: 'var(--muted)', padding: '3px 10px', borderRadius: '100px', fontWeight: 500 }}>
              {tag}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
