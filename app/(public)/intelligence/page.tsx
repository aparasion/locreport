import Link from 'next/link'
import type { Metadata } from 'next'
import { SIGNALS, STATUS_LABEL, MOMENTUM_ICON, CATEGORY_COLOR } from '@/lib/signals'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Intelligence — LocReport',
  description: 'Track the signals shaping the language services industry — quality, operations, governance, market, and strategy.',
}

export const revalidate = 3600

const STATUS_CLASS: Record<string, string> = {
  supported: 'status-badge--supported',
  emerging: 'status-badge--emerging',
  disputed: 'status-badge--challenged',
}

export default async function IntelligencePage() {
  const supabase = await createClient()

  // Count articles per signal
  const { data: articles } = await supabase
    .from('articles')
    .select('signal_ids, impact_score')
    .neq('article_type', 'theory')

  const signalCounts = new Map<string, number>()
  const highImpactCounts = new Map<string, number>()
  for (const a of articles ?? []) {
    for (const sid of (a.signal_ids ?? [])) {
      signalCounts.set(sid, (signalCounts.get(sid) ?? 0) + 1)
      if ((a.impact_score ?? 0) >= 3) {
        highImpactCounts.set(sid, (highImpactCounts.get(sid) ?? 0) + 1)
      }
    }
  }

  const totalArticles = articles?.length ?? 0
  const supported = SIGNALS.filter(s => s.current_status === 'supported').length
  const emerging = SIGNALS.filter(s => s.current_status === 'emerging').length
  const rising = SIGNALS.filter(s => s.momentum === 'rising').length

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-12)' }}>
      <section className="intel-hero">
        <h1>Intelligence Dashboard</h1>
        <p className="intel-subtitle">
          Tracking the signals that shape the language services industry — from quality and operations to governance, market dynamics, and strategy.
        </p>
      </section>

      {/* Stats */}
      <div className="intel-stats-grid">
        <div className="intel-stat-card">
          <span className="intel-stat-number">{SIGNALS.length}</span>
          <span className="intel-stat-label">Active signals</span>
        </div>
        <div className="intel-stat-card">
          <span className="intel-stat-number">{supported}</span>
          <span className="intel-stat-label">Supported</span>
        </div>
        <div className="intel-stat-card">
          <span className="intel-stat-number">{rising}</span>
          <span className="intel-stat-label">Rising momentum</span>
        </div>
        <div className="intel-stat-card">
          <span className="intel-stat-number">{totalArticles.toLocaleString()}</span>
          <span className="intel-stat-label">Articles tracked</span>
        </div>
      </div>

      {/* Nav cards */}
      <div className="intel-link-grid">
        <Link href="/intelligence/signals" className="intel-link-card">
          <span className="intel-link-card__eyebrow">Signals</span>
          <span className="intel-link-card__title">Signal Tracker</span>
          <p className="intel-link-card__desc">Browse all {SIGNALS.length} tracked signals with status, momentum, and evidence counts.</p>
          <span className="intel-link-card__cta">View all signals →</span>
        </Link>
        <Link href="/articles" className="intel-link-card">
          <span className="intel-link-card__eyebrow">Articles</span>
          <span className="intel-link-card__title">Evidence Archive</span>
          <p className="intel-link-card__desc">Browse {totalArticles.toLocaleString()} articles filtered by topic, impact, and source.</p>
          <span className="intel-link-card__cta">Browse articles →</span>
        </Link>
        <Link href="/articles?type=monthly-summary" className="intel-link-card">
          <span className="intel-link-card__eyebrow">Reports</span>
          <span className="intel-link-card__title">Monthly Reports</span>
          <p className="intel-link-card__desc">Monthly synthesis reports tracking signal evolution and industry momentum.</p>
          <span className="intel-link-card__cta">Read reports →</span>
        </Link>
      </div>

      {/* Signal health grid */}
      <section className="intel-section" id="signals-section">
        <div className="intel-section-header">
          <div>
            <h2 className="intel-section-title">Signal health</h2>
            <p className="intel-section-desc">Current status across all tracked industry signals.</p>
          </div>
        </div>

        <div className="signal-health-grid">
          {SIGNALS.map(signal => {
            const count = signalCounts.get(signal.id) ?? 0
            return (
              <Link key={signal.id} href={`/intelligence/signals/${signal.id}`} className="signal-health-card">
                <div className="signal-health-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'space-between' }}>
                    <span className={`status-badge ${STATUS_CLASS[signal.current_status]}`}>{STATUS_LABEL[signal.current_status]}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>
                      {MOMENTUM_ICON[signal.momentum]} {signal.momentum}
                    </span>
                  </div>
                  <span style={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: CATEGORY_COLOR[signal.category], background: `color-mix(in srgb, ${CATEGORY_COLOR[signal.category]} 10%, transparent)`, padding: '2px 8px', borderRadius: '100px' }}>
                    {signal.category}
                  </span>
                </div>
                <p className="signal-health-title">{signal.title}</p>
                <div className="signal-health-bottom">
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{count} article{count !== 1 ? 's' : ''}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>View →</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
