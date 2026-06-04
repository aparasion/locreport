import Link from 'next/link'
import type { Metadata } from 'next'
import { SIGNALS } from '@/lib/signals'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Intelligence — LocReport',
  description: 'Actionable localization intelligence — trend signals, impact scoring, and strategic decision-making.',
}

export const revalidate = 3600

export default async function IntelligencePage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('impact_score, published_at')
    .neq('article_type', 'theory')

  const totalArticles = articles?.length ?? 0
  const highImpact = (articles ?? []).filter(a => (a.impact_score ?? 0) >= 4).length
  const nowMonth = new Date().toISOString().slice(0, 7)
  const thisMonth = (articles ?? []).filter(a => a.published_at?.slice(0, 7) === nowMonth).length

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-12)' }}>
      <section className="intel-hero">
        <h1>Localization Intelligence Dashboard</h1>
        <p className="intel-subtitle">Less noise, more clarity. Structured, decision-ready intelligence for the localization industry.</p>
      </section>

      <section className="intel-stats-grid" aria-label="Intelligence overview statistics">
        <div className="intel-stat-card">
          <span className="intel-stat-number">{totalArticles.toLocaleString()}</span>
          <span className="intel-stat-label">Articles Tracked</span>
        </div>
        <div className="intel-stat-card">
          <span className="intel-stat-number">{highImpact}</span>
          <span className="intel-stat-label">High Impact (4–5)</span>
        </div>
        <div className="intel-stat-card">
          <span className="intel-stat-number">{SIGNALS.length}</span>
          <span className="intel-stat-label">Active Signals</span>
        </div>
        <div className="intel-stat-card">
          <span className="intel-stat-number">{thisMonth}</span>
          <span className="intel-stat-label">This Month</span>
        </div>
      </section>

      <section className="intel-link-grid" aria-label="Intelligence tools">
        <Link href="/intelligence/signals" className="intel-link-card">
          <span className="intel-link-card__eyebrow">Tracker</span>
          <span className="intel-link-card__title">Signals tracker</span>
          <span className="intel-link-card__desc">Track active localization and AI signals with linked article evidence.</span>
          <span className="intel-link-card__cta">Open tracker →</span>
        </Link>
        <Link href="/intelligence/correlations" className="intel-link-card">
          <span className="intel-link-card__eyebrow">Matrix</span>
          <span className="intel-link-card__title">Signal Correlation Matrix</span>
          <span className="intel-link-card__desc">See which signals co-occur across the article base and how strongly they connect.</span>
          <span className="intel-link-card__cta">Open matrix →</span>
        </Link>
        <Link href="/intelligence/high-impact" className="intel-link-card">
          <span className="intel-link-card__eyebrow">Articles</span>
          <span className="intel-link-card__title">High Impact Articles</span>
          <span className="intel-link-card__desc">Review recent significant, major, and disruptive localization industry coverage.</span>
          <span className="intel-link-card__cta">Open articles →</span>
        </Link>
      </section>

      <div className="intel-disclaimer">
        <strong>Data note:</strong> The intelligence presented here is derived from analysis of published industry articles and publications gathered by LocReport — not from direct market surveys or primary research. Signal statuses, trends, and scores reflect patterns observed in media coverage and curated content, and may not represent definitive market realities. Treat this as a directional research tool to complement, not replace, your own primary research.
      </div>
    </div>
  )
}
