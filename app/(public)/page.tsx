import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Article } from '@/lib/types'
import { articleHref, extractTeaser } from '@/lib/utils'
import { SIGNALS, SIGNAL_MAP } from '@/lib/signals'
import { SubscribeForm } from '@/components/SubscribeForm'
import { ArticleCard } from '@/components/ArticleCard'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const IMPACT_LABEL: Record<number, string> = { 1: 'Routine', 2: 'Notable', 3: 'Significant', 4: 'Major', 5: 'Disruptive' }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(60)

  const { data: latestFacts } = await supabase
    .from('facts')
    .select('id, content, created_at, article_id')
    .not('article_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(3)

  const factArticleIds = [...new Set((latestFacts ?? []).map(f => f.article_id).filter(Boolean))]
  const factSlugMap = new Map<string, string>()
  if (factArticleIds.length > 0) {
    const { data: factArticles } = await supabase
      .from('articles')
      .select('id, slug')
      .in('id', factArticleIds as string[])
    for (const a of factArticles ?? []) factSlugMap.set(a.id, a.slug)
  }

  const allArticles = (articles as Article[]) ?? []

  // Lead story: impact-ranked pick from the latest 10 articles. Presented as
  // the first, larger item in the stream rather than a separate dashboard module.
  const leadPool = allArticles.slice(0, 10)
  const lead = [...leadPool].sort(
    (a, b) => (b.impact_score ?? 0) - (a.impact_score ?? 0) || b.published_at.localeCompare(a.published_at)
  )[0]
  const leadSignals = (lead?.signal_ids ?? [])
    .map(id => SIGNAL_MAP.get(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .slice(0, 3)

  // Group by day (up to 3 days)
  const byDay = new Map<string, Article[]>()
  for (const a of allArticles) {
    const day = new Date(a.published_at).toLocaleDateString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    })
    if (!byDay.has(day)) {
      if (byDay.size >= 3) break
      byDay.set(day, [])
    }
    byDay.get(day)!.push(a)
  }

  // Latest monthly report — surfaced as a single quiet line, not a promo card
  const { data: latestReport } = await supabase
    .from('articles')
    .select('id, title, slug, published_at')
    .eq('article_type', 'monthly-summary')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <>
      {/* ── Masthead: a statement, not a landing page ── */}
      <section className="masthead">
        <div className="masthead__inner container">
          <p className="masthead__eyebrow">Language services intelligence · {todayLabel}</p>
          <h1 className="masthead__title">The pulse of the language services industry</h1>
          <p className="masthead__subtitle">Daily coverage of translation, localization, and AI — curated, analyzed, and tracked through the signals that matter.</p>
        </div>
      </section>

      <div className="home-layout container">
        <main className="home-main">
          {lead && (
            <article className="lead-story">
              <div className="lead-story__meta">
                <span className="lead-story__eyebrow">Top story</span>
                <span className="lead-story__date">
                  {new Date(lead.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {lead.impact_score && lead.impact_score >= 4 && (
                  <span className="lead-story__impact">{IMPACT_LABEL[lead.impact_score]}</span>
                )}
              </div>
              <h2 className="lead-story__title"><Link href={articleHref(lead.slug)}>{lead.title}</Link></h2>
              <p className="lead-story__excerpt">{lead.excerpt || extractTeaser(lead.content)}</p>
              {leadSignals.length > 0 && (
                <div className="lead-story__signals">
                  {leadSignals.map(s => (
                    <Link key={s.id} href={`/intelligence/signals/${s.id}`} className="lead-story__signal">
                      {s.title.length > 42 ? s.title.slice(0, 42) + '…' : s.title}
                    </Link>
                  ))}
                </div>
              )}
              <Link className="article-row__read-more" href={articleHref(lead.slug)}>Read the story →</Link>
            </article>
          )}

          {[...byDay.entries()].map(([, allDayArticles], dayIndex) => {
            const dayArticles = allDayArticles.filter(a => a.id !== lead?.id)
            if (dayArticles.length === 0) return null
            const displayDate = new Date(allDayArticles[0].published_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })
            return (
              <section key={dayIndex} className="day-section">
                <h2 className="day-header">{displayDate}</h2>
                <div className="article-list">
                  {dayArticles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )
          })}

          {/* Digest subscription */}
          <section className="subscribe-band" aria-label="Subscribe to the digest">
            <div className="subscribe-band__copy">
              <h2 className="subscribe-band__title">The industry, digested</h2>
              <p className="subscribe-band__text">
                One weekly email: impact-ranked stories, mapped to the signals
                shaping language services. No noise.
              </p>
            </div>
            <SubscribeForm />
          </section>
        </main>

        <aside className="home-sidebar" aria-label="Sidebar">
          <div className="intel-rail">
            {latestFacts && latestFacts.length > 0 && (
              <div className="intel-rail__group">
                <p className="intel-rail__label">
                  <span className="sidebar-factflow__dot" aria-hidden="true" />
                  Fact Flow
                </p>
                {latestFacts.map(fact => {
                  const slug = fact.article_id ? factSlugMap.get(fact.article_id) : undefined
                  return (
                    <div key={fact.id} className="sidebar-factflow__item">
                      <span className="sidebar-factflow__time">{timeAgo(fact.created_at)}</span>
                      {slug ? (
                        <Link href={articleHref(slug)} className="sidebar-factflow__content">{fact.content}</Link>
                      ) : (
                        <span className="sidebar-factflow__content">{fact.content}</span>
                      )}
                    </div>
                  )
                })}
                <Link href="/fact-flow" className="sidebar-widget__more">Follow the live feed →</Link>
              </div>
            )}

            <div className="intel-rail__group">
              <p className="intel-rail__label">Signals to watch</p>
              <div className="sidebar-signal-list">
                {SIGNALS.slice(0, 5).map(signal => (
                  <Link key={signal.id} href={`/intelligence/signals/${signal.id}`} className="sidebar-signal">
                    <span className={`sidebar-signal__status sidebar-signal__status--${signal.current_status}`} aria-label={signal.current_status} />
                    <span className="sidebar-signal__title">{signal.title.length > 58 ? signal.title.slice(0, 58) + '…' : signal.title}</span>
                  </Link>
                ))}
              </div>
              <Link href="/intelligence/signals" className="sidebar-widget__more">All {SIGNALS.length} signals →</Link>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Explore: everything else, reachable without competing for attention ── */}
      <section className="explore-strip">
        <div className="explore-strip__inner container">
          <span className="explore-strip__label">Also from LocReport</span>
          <nav className="explore-strip__links" aria-label="More from LocReport">
            <Link href="/intelligence">Intelligence Dashboard</Link>
            <Link href="/compass">Compass Tools</Link>
            {latestReport ? (
              <Link href={articleHref(latestReport.slug)}>Latest Monthly Report</Link>
            ) : (
              <Link href="/reports/monthly">Monthly Reports</Link>
            )}
            <Link href="/fact-flow">Fact Flow</Link>
            <Link href="/reports/2026-annual-global-market-report">2026 Annual Report</Link>
          </nav>
        </div>
      </section>
    </>
  )
}
