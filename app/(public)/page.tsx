import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Article } from '@/lib/types'
import { articleHref, extractTeaser } from '@/lib/utils'
import { SIGNALS } from '@/lib/signals'

// Tools surfaced in the hero "Explore" panel — blog + tools focus
const HERO_TOOLS = [
  { href: '/compass/llm-pricing', name: 'AI Cost Simulator', desc: 'Compare LLM pricing for localization' },
  { href: '/compass/locstock', name: 'LocStock', desc: 'Language-industry market tracker' },
  { href: '/compass/events', name: 'Industry Events', desc: 'Conferences & summits calendar' },
  { href: '/intelligence/signals', name: 'Signals Tracker', desc: 'Trends shaping the industry' },
]

const SOURCES = [
  'TechCrunch','Slator','DeepL','TransPerfect','Crowdin','Phrase','Smartling',
  'Lokalise','NIMDZI','GALA','ELIA','XTM','LanguageLine','Vistatec','PR Newswire',
  'OpenAI','ChatGPT','Google Gemini','Anthropic','Claude','Meta AI','Llama',
  'Hugging Face','Mistral AI',
]

const IMPACT_LABEL: Record<number, string> = { 1: 'Routine', 2: 'Notable', 3: 'Significant', 4: 'Major', 5: 'Disruptive' }

export default async function HomePage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .neq('article_type', 'theory')
    .order('published_at', { ascending: false })
    .limit(60)

  // Group by day (up to 3 days)
  const byDay = new Map<string, Article[]>()
  for (const a of (articles as Article[]) ?? []) {
    const day = new Date(a.published_at).toLocaleDateString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    })
    if (!byDay.has(day)) {
      if (byDay.size >= 3) break
      byDay.set(day, [])
    }
    byDay.get(day)!.push(a)
  }

  // Latest monthly report
  const { data: latestReport } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, published_at')
    .eq('article_type', 'monthly-summary')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <>
      {/* ── Hero: Split Layout ── */}
      <section className="hero hero--split" id="hero-section">
        <div className="hero-bg" aria-hidden="true">
          <span className="hero-orb hero-orb--1" />
          <span className="hero-orb hero-orb--2" />
          <span className="hero-orb hero-orb--3" />
        </div>
        <div className="hero-split container">
          <div className="hero-split__left">
            <span className="hero-eyebrow">
              <svg className="hero-eyebrow-icon" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="22" height="22" rx="6" fill="url(#hg)"/>
                <text x="11" y="16" textAnchor="middle" fontSize="13" fontFamily="system-ui,sans-serif" fill="#fff">L</text>
                <defs><linearGradient id="hg" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#3550F5"/><stop offset="1" stopColor="#7FA1FB"/></linearGradient></defs>
              </svg>
              Language services intelligence
            </span>
            <h1>The pulse of the language services industry</h1>
            <p className="hero-subtitle">Daily coverage of translation, localization, and AI — curated, analyzed, and tracked through the signals that matter.</p>
            <div className="hero-actions">
              <Link href="/articles" className="btn btn--hero-articles">Browse articles</Link>
              <Link href="/intelligence" className="btn btn--hero-intel">Intelligence Dashboard</Link>
              <Link href="/language-science" className="btn btn--hero-research">Language Science</Link>
            </div>
          </div>
          <div className="hero-split__right" aria-label="Explore tools">
            <div className="hero-intel-panel">
              <div className="hero-intel-panel__head">
                <span className="hero-intel-panel__label">Explore</span>
              </div>
              {HERO_TOOLS.map(tool => (
                <Link key={tool.href} href={tool.href} className="hero-tool-row">
                  <span className="hero-tool-row__body">
                    <span className="hero-tool-row__name">{tool.name}</span>
                    <span className="hero-tool-row__desc">{tool.desc}</span>
                  </span>
                  <span className="hero-tool-row__arrow" aria-hidden="true">→</span>
                </Link>
              ))}
              <Link href="/compass" className="hero-intel-panel__footer">All tools →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sources Bar ── */}
      <div className="sources-bar" aria-hidden="true">
        <div className="sources-bar-track">
          {[...SOURCES, ...SOURCES].map((s, i) => (
            <span key={i} className="source-logo">{s}</span>
          ))}
        </div>
      </div>

      {/* ── Home Layout: Main + Sidebar ── */}
      <div className="home-layout container">
        <main className="home-main">
          {[...byDay.entries()].map(([, dayArticles], dayIndex) => {
            const displayDate = new Date(dayArticles[0].published_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })
            return (
              <section key={dayIndex} className="day-section">
                <h2 className="day-header">{displayDate}</h2>
                <div className="article-list">
                  {dayArticles.map((article, i) => {
                    const isFeatured = dayIndex === 0 && i === 0
                    const date = new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    if (isFeatured) {
                      return (
                        <article key={article.id} className="article-row article-row--featured">
                          <div className="article-row__header">
                            <span className="article-row__badge article-row__badge--latest">Latest</span>
                            {article.impact_score && (
                              <span className={`impact-badge impact-badge--${article.impact_score}`}>
                                {IMPACT_LABEL[article.impact_score] ?? ''}
                              </span>
                            )}
                            <span className="article-row__date">{date}</span>
                          </div>
                          <h2 className="article-row__title"><Link href={articleHref(article.slug)}>{article.title}</Link></h2>
                          <p className="article-row__excerpt">{article.excerpt || extractTeaser(article.content)}</p>
                          <div className="article-row__footer">
                            {article.author && <span className="article-row__publisher">{article.author}</span>}
                            <Link className="article-row__read-more" href={articleHref(article.slug)}>Read more →</Link>
                          </div>
                        </article>
                      )
                    }
                    return (
                      <article key={article.id} className="article-row">
                        <div className="article-row__header">
                          <span className="article-row__date">{date}</span>
                          {article.impact_score && article.impact_score >= 3 && (
                            <span className={`impact-dot impact-dot--${article.impact_score}`} title={`Impact: ${IMPACT_LABEL[article.impact_score]}`} />
                          )}
                        </div>
                        <h2 className="article-row__title"><Link href={articleHref(article.slug)}>{article.title}</Link></h2>
                        <p className="article-row__excerpt">{article.excerpt || extractTeaser(article.content)}</p>
                        <div className="article-row__footer">
                          {article.author && <span className="article-row__publisher">{article.author}</span>}
                          <Link className="article-row__read-more" href={articleHref(article.slug)}>Read more →</Link>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}

          {/* CTA */}
          <section className="cta-section">
            <div className="cta-inner">
              <h2>Ready to stay ahead?</h2>
              <p>Join localization professionals who rely on LocReport for daily industry intelligence.</p>
              <div className="cta-actions">
                <Link href="/articles" className="btn btn--primary btn--lg">View all articles</Link>
                <Link href="/intelligence" className="btn btn--ghost btn--lg">Intelligence Dashboard</Link>
              </div>
            </div>
          </section>
        </main>

        <aside className="home-sidebar" aria-label="Sidebar">
          {latestReport && (
            <div className="sidebar-widget sidebar-widget--report">
              <p className="sidebar-report__eyebrow">Monthly Report · {new Date(latestReport.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              <h3 className="sidebar-report__title">{latestReport.title}</h3>
              <p className="sidebar-report__desc">{latestReport.excerpt ?? 'Key themes, signals, and trends from the language services industry.'}</p>
              <Link href={articleHref(latestReport.slug)} className="sidebar-report__link">Read the report →</Link>
            </div>
          )}

          <div className="sidebar-widget sidebar-widget--report">
            <p className="sidebar-report__eyebrow">2026 Report</p>
            <h3 className="sidebar-report__title">Global Market Report</h3>
            <p className="sidebar-report__desc">Market sizing, AI-era growth drivers, and strategic forecasts.</p>
            <a href="/reports/2026-Annual-Global-Market-Report/" className="sidebar-report__link">Read the report →</a>
          </div>

          <div className="sidebar-widget">
            <h3 className="sidebar-widget__title">Active Signals</h3>
            {SIGNALS.slice(0, 6).map(signal => (
              <Link key={signal.id} href={`/intelligence/signals/${signal.id}`} className="sidebar-signal">
                <span className={`sidebar-signal__status sidebar-signal__status--${signal.current_status}`} aria-label={signal.current_status} />
                <span className="sidebar-signal__title">{signal.title.length > 58 ? signal.title.slice(0, 58) + '…' : signal.title}</span>
              </Link>
            ))}
            <Link href="/intelligence/signals" className="sidebar-widget__more">All {SIGNALS.length} signals →</Link>
          </div>
        </aside>
      </div>
    </>
  )
}
