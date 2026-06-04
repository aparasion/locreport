import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { marked } from 'marked'
import { Article } from '@/lib/types'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 86400

type Props = { params: Promise<{ slug: string[] }> }

const IMPACT_LABEL: Record<number, string> = { 1: 'Routine', 2: 'Notable', 3: 'Significant', 4: 'Major', 5: 'Disruptive' }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('title, excerpt')
    .eq('slug', slug.join('/'))
    .single()
  if (!data) return {}
  return { title: `${data.title} — LocReport`, description: data.excerpt ?? undefined }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const articleSlug = slug.join('/')

  const supabase = await createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', articleSlug)
    .single()

  if (!article) notFound()

  const a = article as Article

  // Strip excerpt from the top of content if it appears there verbatim
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

  const hasSidebar = (a.business_implications?.length > 0) || (a.affected_segments?.length > 0) || a.impact_score

  if (hasSidebar) {
    return (
      <div className="post-layout">
        <article className="post">
          <PostHeader a={a} date={date} html={html} />
        </article>
        <aside className="post-sidebar">
          {a.impact_score && (
            <div className="post-sidebar-widget">
              <p className="post-sidebar-widget__title">Impact</p>
              <div className="post-sidebar-badges">
                <span className={`impact-badge impact-badge--${a.impact_score} impact-badge--inline`}>
                  {IMPACT_LABEL[a.impact_score]}
                </span>
              </div>
            </div>
          )}
          {a.business_implications?.length > 0 && (
            <div className="post-sidebar-widget">
              <p className="post-sidebar-widget__title">Business implications</p>
              <ul className="post-sidebar-list">
                {a.business_implications.map((imp, i) => <li key={i}>{imp}</li>)}
              </ul>
            </div>
          )}
          {a.affected_segments?.length > 0 && (
            <div className="post-sidebar-widget post-sidebar-segments">
              <p className="post-sidebar-widget__title">Affected segments</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.25rem' }}>
                {a.affected_segments.map(seg => (
                  <span key={seg} style={{ fontSize: '0.78rem', background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: '100px', padding: '2px 10px', fontWeight: 600 }}>
                    {seg}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    )
  }

  return (
    <div className="container">
      <article className="post">
        <PostHeader a={a} date={date} html={html} />
      </article>
    </div>
  )
}

function PostHeader({ a, date, html }: { a: Article; date: string; html: string }) {
  return (
    <>
      {/* Breadcrumb */}
      <nav style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 'var(--space-4)', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: 'var(--muted)' }}>Home</Link>
        <span>›</span>
        <Link href="/articles" style={{ color: 'var(--muted)' }}>Articles</Link>
        <span>›</span>
        <span style={{ color: 'var(--text)' }}>{a.title.slice(0, 40)}{a.title.length > 40 ? '…' : ''}</span>
      </nav>

      <h1>{a.title}</h1>

      {/* Post meta */}
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
