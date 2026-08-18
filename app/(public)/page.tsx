import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Article } from '@/lib/types'
import { articleHref, estimateReadMinutes, extractTeaser } from '@/lib/utils'
import { SIGNAL_MAP } from '@/lib/signals'
import { SubscribeForm } from '@/components/SubscribeForm'
import { ArticleCard } from '@/components/ArticleCard'
import { SignalPulse } from '@/components/SignalPulse'
import { ImpactMeter } from '@/components/ImpactMeter'
import { CoverageSpark } from '@/components/CoverageSpark'
import { getIntelligenceData, signalShortLabel } from '@/lib/intelligence'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const IMPACT_LABEL: Record<number, string> = { 1: 'Routine', 2: 'Notable', 3: 'Significant', 4: 'Major', 5: 'Disruptive' }
const MOMENTUM_GLYPH: Record<string, string> = { rising: '↑', stable: '→', declining: '↓' }
// Same wording the article page uses for the horizon badge.
const HORIZON_LABEL: Record<string, string> = { now: 'Immediate', '6months': '6-month horizon', 'long-term': 'Long-term' }
const DAY_KEY_OPTS: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }

// How much of the stream the homepage carries: the last two publishing days,
// stretched to a third only when those two are thin.
const STREAM_DAYS = 2
const STREAM_DAYS_MAX = 3
const STREAM_MIN_STORIES = 6

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

  // Signal coverage momentum — powers both the lead story's chart and the rail.
  const intel = await getIntelligenceData(supabase)

  // ── The lead: highest impact among the ten most recent stories, most
  // recent breaking the tie. It is pulled out of the day stream below so
  // nothing appears twice. ──
  const lead = [...allArticles.slice(0, 10)].sort(
    (a, b) => (b.impact_score ?? 0) - (a.impact_score ?? 0) || b.published_at.localeCompare(a.published_at)
  )[0]

  const leadSignals = (lead?.signal_ids ?? [])
    .map(id => SIGNAL_MAP.get(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .slice(0, 3)
  const leadImpact = lead?.impact_score ?? 0
  // A 5/5 story is rare enough to earn the reserved warm accent.
  const leadTone = leadImpact >= 5 ? 'gold' : 'accent'
  // Of the lead's own signals, chart the one we've covered most lately.
  const leadSeries = (lead?.signal_ids ?? [])
    .map(id => intel.signalSeries.find(s => s.signalId === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .sort((a, b) => b.recentCount - a.recentCount)[0]
  const leadHorizon = lead?.time_horizon ? HORIZON_LABEL[lead.time_horizon] ?? lead.time_horizon : null
  const leadSegments = (lead?.affected_segments ?? []).slice(0, 2)
  const hasLeadGraphic = Boolean(leadImpact || leadSeries || leadHorizon || leadSegments.length)

  // ── The stream, grouped by publishing day ──
  const byDay = new Map<string, Article[]>()
  for (const a of allArticles) {
    const day = dayKeyOf(new Date(a.published_at))
    if (!byDay.has(day)) {
      if (byDay.size >= STREAM_DAYS_MAX) break
      byDay.set(day, [])
    }
    byDay.get(day)!.push(a)
  }
  const dayGroups = [...byDay.entries()]
    .map(([key, list]) => ({ key, list: list.filter(a => a.id !== lead?.id) }))
    .filter(g => g.list.length > 0)
  const streamDays = dayGroups.slice(0, STREAM_DAYS)
  if (streamDays.reduce((n, g) => n + g.list.length, 0) < STREAM_MIN_STORIES && dayGroups[STREAM_DAYS]) {
    streamDays.push(dayGroups[STREAM_DAYS])
  }

  const todayKey = dayKeyOf(new Date())
  const yesterdayKey = dayKeyOf(new Date(Date.now() - 86400000))
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  // ── Dateline counters: the date only earns its place next to live numbers ──
  const weekCutoff = Date.now() - 7 * 86400000
  const thisWeek = allArticles.filter(a => new Date(a.published_at).getTime() >= weekCutoff)
  const publishedToday = allArticles.filter(a => dayKeyOf(new Date(a.published_at)) === todayKey).length
  const highImpactWeek = thisWeek.filter(a => (a.impact_score ?? 0) >= 4).length
  const risingSignals = intel.signalSeries.filter(s => s.observedMomentum === 'rising')

  // Signal pulse: rising signals lead, busiest coverage fills the rest.
  const pulseItems = [
    ...risingSignals.sort((a, b) => b.recentCount - a.recentCount),
    ...intel.signalSeries.filter(s => s.observedMomentum !== 'rising').sort((a, b) => b.recentCount - a.recentCount),
  ]
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
      {/* ── Dateline: today's date paired with today's actual numbers ── */}
      <section className="dateline" aria-label="Today at a glance">
        <div className="dateline__inner container">
          <p className="dateline__date">{todayLabel}</p>
          <div className="dateline__stats">
            <Link href="/articles" className="dateline__stat">
              <b>{publishedToday || thisWeek.length}</b>
              {publishedToday ? 'stories today' : 'stories this week'}
            </Link>
            <Link href="/intelligence/high-impact" className="dateline__stat">
              <b>{highImpactWeek}</b>
              high-impact this week
            </Link>
            <Link href="/intelligence/signals" className="dateline__stat">
              <b>{risingSignals.length}</b>
              signals rising
            </Link>
          </div>
        </div>
      </section>

      <div className="home-grid container">
        <main className="home-main">
          {/* ── Top story: one panel, accent-ruled, with the impact and
              coverage graphics that make it read as the main thing. ── */}
          {lead && (
            <article className={`lead${leadTone === 'gold' ? ' lead--peak' : ''}`}>
              <div className="lead__body">
                <div className="lead__meta">
                  <span className="lead__eyebrow">Top story</span>
                  <span className="lead__date">
                    {new Date(lead.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' · '}{estimateReadMinutes(lead.content)} min read
                  </span>
                </div>
                <h1 className="lead__title"><Link href={articleHref(lead.slug)}>{lead.title}</Link></h1>
                <p className="lead__excerpt">{lead.excerpt || extractTeaser(lead.content)}</p>
                {leadSignals.length > 0 && (
                  <div className="lead__signals">
                    {leadSignals.map(s => (
                      <Link key={s.id} href={`/intelligence/signals/${s.id}`} className="lead__signal">
                        {signalShortLabel(s.id)}
                      </Link>
                    ))}
                  </div>
                )}
                <Link className="lead__cta" href={articleHref(lead.slug)}>Read the story →</Link>
              </div>

              {hasLeadGraphic && (
                <aside className="graphic-panel" aria-label="Why this story leads">
                  {leadImpact > 0 && (
                    <ImpactMeter score={leadImpact} label={IMPACT_LABEL[leadImpact]} tone={leadTone} />
                  )}
                  {leadSeries && (
                    <div className="graphic-panel__block">
                      <p className="graphic-panel__label">Coverage momentum</p>
                      <p className="graphic-panel__signal">{signalShortLabel(leadSeries.signalId)}</p>
                      <CoverageSpark data={leadSeries.weekly} tone={leadTone} />
                      <p className={`graphic-panel__trend graphic-panel__trend--${leadSeries.observedMomentum}`}>
                        {MOMENTUM_GLYPH[leadSeries.observedMomentum]} {leadSeries.observedMomentum}
                        <span className="graphic-panel__trend-sub">{leadSeries.recentCount} stories · 8 weeks</span>
                      </p>
                    </div>
                  )}
                  {leadHorizon && (
                    <div className="graphic-panel__block">
                      <p className="graphic-panel__label">Horizon</p>
                      <p className="graphic-panel__value">{leadHorizon}</p>
                    </div>
                  )}
                  {leadSegments.length > 0 && (
                    <div className="graphic-panel__block">
                      <p className="graphic-panel__label">Affected</p>
                      <p className="graphic-panel__value">{leadSegments.join(' · ')}</p>
                    </div>
                  )}
                </aside>
              )}
            </article>
          )}

          {/* ── The stream: the last two publishing days, newest first ── */}
          <section className="feed" aria-label="Latest coverage">
            <div className="feed__head">
              <h2 className="feed__head-title">Latest coverage</h2>
              <Link href="/articles" className="feed__head-link">All articles →</Link>
            </div>

            {streamDays.map(({ key, list }) => {
              const isToday = key === todayKey
              const label = isToday
                ? 'Today'
                : key === yesterdayKey
                  ? 'Yesterday'
                  : new Date(list[0].published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              return (
                <section key={key} className="day-group">
                  <div className="day-group__head">
                    <h3 className={`day-group__label${isToday ? ' day-group__label--today' : ''}`}>
                      {isToday && <span className="day-group__live" aria-hidden="true" />}
                      {label}
                    </h3>
                    <span className="day-group__rule" aria-hidden="true" />
                    <span className="day-group__count">{list.length} {list.length === 1 ? 'story' : 'stories'}</span>
                  </div>
                  <div className="article-list">
                    {list.map(article => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              )
            })}

            <div className="home-view-all">
              <Link href="/articles" className="btn btn--secondary">Browse the full archive →</Link>
            </div>
          </section>

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

        {/* ── One rail, two live panels: what's moving, and what just landed ── */}
        <aside className="rail" aria-label="Live intelligence">
          <SignalPulse items={pulseItems} />

          {latestFacts && latestFacts.length > 0 && (
            <div className="rail-card">
              <div className="rail-card__head">
                <span className="rail-card__live" aria-hidden="true" />
                <span className="rail-card__title">Fact Flow</span>
                <span className="rail-card__sub">as it lands</span>
              </div>
              {latestFacts.map(fact => {
                const slug = fact.article_id ? factSlugMap.get(fact.article_id) : undefined
                return (
                  <div key={fact.id} className="rail-fact">
                    <span className="rail-fact__time">{timeAgo(fact.created_at)}</span>
                    {slug ? (
                      <Link href={articleHref(slug)} className="rail-fact__content">{fact.content}</Link>
                    ) : (
                      <span className="rail-fact__content">{fact.content}</span>
                    )}
                  </div>
                )
              })}
              <Link href="/fact-flow" className="rail-card__more">Follow the live feed →</Link>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
