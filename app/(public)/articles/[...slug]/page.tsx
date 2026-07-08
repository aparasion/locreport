import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { marked } from 'marked'
import { Article } from '@/lib/types'
import { articleHref } from '@/lib/utils'
import { SIGNAL_MAP } from '@/lib/signals'
import { ShareButton } from '@/components/ShareButton'
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
  const canonicalSlug = a.slug.split('/').pop()
  return {
    title: `${a.title} — LocReport`,
    description: a.excerpt ?? undefined,
    alternates: { canonical: `/articles/${canonicalSlug}` },
  }
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

  // Strip leading H1 — title is already rendered in the page header
  let content = a.content.replace(/^#\s+[^\n]+\n?/, '')
  // Strip leading blockquote (excerpt summary) that LLM includes at the top
  content = content.replace(/^\s*>[^\n]*(\n>[^\n]*)*/m, '').trimStart()

  const rawHtml = marked.parse(content) as string
  // Add target/_blank + rel=noopener to all external links in rendered content
  const html = rawHtml.replace(/<a (href="https?:\/\/)/g, '<a target="_blank" rel="noopener" $1')
  const date = new Date(a.published_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  // Read time
  const words = content.trim().split(/\s+/).length
  const readMinutes = Math.max(1, Math.round(words / 200))

  // Resolve signal metadata
  const articleSignals = (a.signal_ids ?? [])
    .map(id => SIGNAL_MAP.get(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof SIGNAL_MAP.get>>[]

  // Fetch related articles — by shared signal, falling back to recent articles
  const supabase = await createClient()
  let relatedArticles: Article[] = []
  if (articleSignals.length > 0) {
    const { data: related } = await supabase
      .from('articles')
      .select('id, title, slug, publisher, published_at, signal_ids')
      .neq('slug', a.slug)
      .overlaps('signal_ids', a.signal_ids)
      .order('published_at', { ascending: false })
      .limit(5)
    relatedArticles = (related as Article[]) ?? []
  }
  if (relatedArticles.length < 3) {
    const { data: recent } = await supabase
      .from('articles')
      .select('id, title, slug, publisher, published_at, signal_ids')
      .neq('slug', a.slug)
      .order('published_at', { ascending: false })
      .limit(5 - relatedArticles.length)
    const existingIds = new Set(relatedArticles.map(r => r.id))
    const extra = ((recent as Article[]) ?? []).filter(r => !existingIds.has(r.id))
    relatedArticles = [...relatedArticles, ...extra]
  }

  const hasSidebar = !!a.impact_score || articleSignals.length > 0 || relatedArticles.length > 0

  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = !!user

  const articleUrl = `https://locreport.com/articles/${a.slug.split('/').pop()}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.excerpt ?? undefined,
    url: articleUrl,
    datePublished: a.published_at,
    dateModified: a.updated_at ?? a.published_at,
    author: a.author ? { '@type': 'Person', name: a.author } : { '@type': 'Organization', name: 'LocReport' },
    publisher: {
      '@type': 'Organization',
      name: 'LocReport',
      url: 'https://locreport.com',
      logo: { '@type': 'ImageObject', url: 'https://locreport.com/icon.png' },
    },
    image: 'https://locreport.com/og-image.jpg',
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
  }

  const articleEl = (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <article className="post">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/articles">Articles</Link></li>
          <li aria-current="page">{a.title}</li>
        </ol>
      </nav>

      <header className="post-header">
        <h1>{a.title}</h1>

        <div className="post-meta-row">
          <p className="post-meta">
            {a.author && <><span className="post-author">{a.author}</span> · </>}
            {date}<span className="read-time"> · {readMinutes} min read</span>
          </p>
          <div className="post-meta-actions">
            {isAdmin && (
              <Link href={`/admin/articles/${a.id}`} className="admin-edit-btn">
                Edit
              </Link>
            )}
            <ShareButton title={a.title} url={articleUrl} />
          </div>
        </div>
      </header>

      <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />

      <div className="support-box">
        <div className="support-box__inner">
          <div className="support-box__copy">
            <p className="support-box__headline">Keep independent coverage alive.</p>
            <p className="support-box__text">No ads. No paywall. No corporate backing. Just sharp, weekly intelligence on the language industry — free, because it should be.</p>
          </div>
          <div className="support-box__actions">
            <a href="https://buymeacoffee.com/locreport" target="_blank" rel="noopener" className="support-box__btn">
              Support LocReport →
            </a>
            <a href={`https://twitter.com/intent/tweet?url=https://locreport.com${articleHref(a.slug)}&text=${encodeURIComponent(a.title)}`} target="_blank" rel="noopener" className="support-box__share">
              Share this article
            </a>
          </div>
        </div>
      </div>
    </article>
    </>
  )

  if (hasSidebar) {
    return (
      <div className="post-layout">
        {articleEl}
        <aside className="post-sidebar" aria-label="Article context">
          {a.impact_score && (
            <div className="post-sidebar-widget">
              <p className="post-sidebar-widget__title">Intelligence</p>
              <div className="post-sidebar-badges">
                <span className={`impact-badge impact-badge--${a.impact_score}`}>
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

          {relatedArticles.length > 0 && (
            <div className="post-sidebar-widget">
              <p className="post-sidebar-widget__title">Related Reading</p>
              <ul className="post-sidebar-related">
                {relatedArticles.map(r => (
                  <li key={r.id}>
                    <Link href={articleHref(r.slug)} className="related-reading-link">
                      <span className="related-reading-title">{r.title}</span>
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
      {articleEl}
    </div>
  )
}
