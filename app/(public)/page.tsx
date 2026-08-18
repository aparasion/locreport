import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Article } from '@/lib/types'
import { articleHref, estimateReadMinutes, extractTeaser } from '@/lib/utils'
import { SIGNALS, SIGNAL_MAP } from '@/lib/signals'
import { TOPIC_DEFS } from '@/lib/topics'
import { SubscribeForm } from '@/components/SubscribeForm'
import { ArticleCard } from '@/components/ArticleCard'
import { SignalPulse } from '@/components/SignalPulse'
import { getIntelligenceData, signalShortLabel } from '@/lib/intelligence'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const IMPACT_LABEL: Record<number, string> = { 1: 'Routine', 2: 'Notable', 3: 'Significant', 4: 'Major', 5: 'Disruptive' }
const DAY_KEY_OPTS: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }

// Canonical per-day grouping key — also used to detect "today"/"yesterday".
function dayKeyOf(d: Date): string {
  return d.toLocaleDateString('en-US', DAY_KEY_OPTS)
}

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

  // Top cluster: the lead plus up to 2 more high-impact recent stories,
  // ranked from the latest 10 and pulled out of the day stream below so
  // nothing repeats. More entry points for a first-time visitor to land
  // on — still every one a real, dated story, not a promo tile.
  const leadPool = allArticles.slice(0, 10)
  const rankedPool = [...leadPool].sort(
    (a, b) => (b.impact_score ?? 0) - (a.impact_score ?? 0) || b.published_at.localeCompare(a.published_at)
  )
  const lead = rankedPool[0]
  const secondaries = rankedPool.slice(1, 3)
  const topClusterIds = new Set(rankedPool.slice(0, 3).map(a => a.id))
  const leadSignals = (lead?.signal_ids ?? [])
    .map(id => SIGNAL_MAP.get(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .slice(0, 3)
  const leadReadMinutes = lead ? estimateReadMinutes(lead.content) : 0

  // Group by day (up to 3 days); each section below excludes whatever's
  // already surfaced in the top cluster so no story appears twice.
  const byDay = new Map<string, Article[]>()
  for (const a of allArticles) {
    const day = dayKeyOf(new Date(a.published_at))
    if (!byDay.has(day)) {
      if (byDay.size >= 3) break
      byDay.set(day, [])
    }
    byDay.get(day)!.push(a)
  }
  const todayKey = dayKeyOf(new Date())
  const yesterdayKey = dayKeyOf(new Date(Date.now() - 86400000))

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

  // Signal pulse: the homepage's one data-forward signature. Rising signals
  // lead, busiest coverage fills the rest — real coverage-momentum, not decoration.
  const intel = await getIntelligenceData(supabase)
  const rising = intel.signalSeries.filter(s => s.observedMomentum === 'rising')
  const filler = intel.signalSeries
    .filter(s => s.observedMomentum !== 'rising')
    .sort((a, b) => b.recentCount - a.recentCount)
  const pulseItems = [...rising.sort((a, b) => b.recentCount - a.recentCount), ...filler]
    .slice(0, 4)
    .filter(s => s.recentCount > 0)
    .map(s => ({
      id: s.signalId,
      label: signalShortLabel(s.signalId),
      momentum: s.observedMomentum,
      recentCount: s.recentCount,
      weekly: s.weekly,
    }))

  return (
    <>
      {/* ── The top story opens the page — no separate hero/masthead. A
          few more high-impact picks and the signal pulse ride alongside
          it: more doors in for a new visitor, still real product. ── */}
      {lead && (
        <section className="home-top">
          <div className="home-top__inner container">
            <div className="home-top__main">
              <article className="lead-story">
                <div className="lead-story__meta">
                  <span className="lead-story__eyebrow">Top story</span>
                  <span className="lead-story__date">
                    {new Date(lead.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    <span className="read-time"> · {leadReadMinutes} min read</span>
                  </span>
                  {lead.impact_score && lead.impact_score >= 4 && (
                    <span className="lead-story__impact">{IMPACT_LABEL[lead.impact_score]}</span>
                  )}
                </div>
                <h1 className="lead-story__title"><Link href={articleHref(lead.slug)}>{lead.title}</Link></h1>
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

              {secondaries.length > 0 && (
                <div className="top-secondary" aria-label="More top stories">
                  <p className="top-secondary__label">More top stories</p>
                  {secondaries.map(article => {
                    const readMinutes = estimateReadMinutes(article.content)
                    return (
                      <article key={article.id} className="top-secondary__item">
                        <div className="top-secondary__meta">
                          <span className="article-row__date">
                            {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            <span className="read-time"> · {readMinutes} min read</span>
                          </span>
                          {article.impact_score && article.impact_score >= 4 && (
                            <span className="article-row__impact">
                              <span className="article-row__impact-dot" aria-hidden="true" />
                              {IMPACT_LABEL[article.impact_score]}
                            </span>
                          )}
                        </div>
                        <h3 className="top-secondary__title"><Link href={articleHref(article.slug)}>{article.title}</Link></h3>
                        <p className="top-secondary__excerpt">{article.excerpt || extractTeaser(article.content)}</p>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="home-top__aside">
              <SignalPulse items={pulseItems} />
              <div className="home-topics" aria-label="Browse by topic">
                <p className="home-topics__label">Browse by topic</p>
                <div className="home-topics__pills">
                  {Object.entries(TOPIC_DEFS).map(([id, def]) => (
                    <Link key={id} href={`/articles?topic=${id}`} className="topic-pill">{def.label}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── The old hero's message, compressed into one quiet, thin bar ── */}
      <section className="brand-bar">
        <div className="brand-bar__inner container">
          <p className="brand-bar__message">
            <strong>The pulse of the language services industry.</strong> Daily coverage of translation, localization, and AI — tracked through the signals that matter.
          </p>
          <p className="brand-bar__date">{todayLabel}</p>
        </div>
      </section>

      <div className="home-layout container">
        <main className="home-main">
          {[...byDay.entries()].map(([key, allDayArticles], dayIndex) => {
            const dayArticles = allDayArticles.filter(a => !topClusterIds.has(a.id))
            if (dayArticles.length === 0) return null
            const displayDate = new Date(allDayArticles[0].published_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })
            const isToday = key === todayKey
            const label = isToday ? 'Today' : key === yesterdayKey ? 'Yesterday' : displayDate
            const storyWord = dayArticles.length === 1 ? 'story' : 'stories'
            return (
              <section key={dayIndex} className="day-section">
                <h2 className="day-header">
                  <span>
                    {isToday ? <span className="day-header__today">{label}</span> : label} · {dayArticles.length} {storyWord}
                  </span>
                </h2>
                <div className="article-list">
                  {dayArticles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )
          })}

          <div className="home-view-all">
            <Link href="/articles" className="btn btn--secondary">Browse the full archive →</Link>
          </div>

          {/* Digest subscription */}
          <section className="subscribe-band" aria-label="Subscribe to the digest">
            <div className="subscribe-band__copy">
              <h2 className="subscribe-band__title">The industry, digested</h2>
              <ul className="subscribe-band__list">
                <li>Impact-ranked stories, not just aggregated headlines</li>
                <li>Signals tracked over time — momentum, not one-off news</li>
                <li>One email. No noise. Unsubscribe anytime.</li>
              </ul>
            </div>
            <div className="subscribe-band__form">
              <SubscribeForm compact />
              <Link href="/feed.xml" className="subscribe-band__rss">Prefer RSS? Subscribe to the feed →</Link>
            </div>
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
            <Link href="/articles">All Articles</Link>
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
