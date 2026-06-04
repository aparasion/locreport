import Link from 'next/link'
import type { Metadata } from 'next'
import { SIGNALS, STATUS_LABEL, MOMENTUM_ICON, CATEGORY_COLOR } from '@/lib/signals'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Signal Tracker — LocReport Intelligence',
  description: 'All tracked industry signals across quality, operations, governance, market, and strategy.',
}

export const revalidate = 3600

const STATUS_CLASS: Record<string, string> = {
  supported: 'badge--supported',
  emerging: 'badge--emerging',
  disputed: 'badge--disputed',
}

const CATEGORIES = ['all', 'quality', 'operations', 'governance', 'market', 'strategy'] as const

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('signal_ids')
    .neq('article_type', 'theory')

  const signalCounts = new Map<string, number>()
  for (const a of articles ?? []) {
    for (const sid of (a.signal_ids ?? [])) {
      signalCounts.set(sid, (signalCounts.get(sid) ?? 0) + 1)
    }
  }

  const filtered = (!category || category === 'all')
    ? SIGNALS
    : SIGNALS.filter(s => s.category === category)

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-12)' }}>
      <nav style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 'var(--space-5) 0 var(--space-2)', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <Link href="/intelligence" style={{ color: 'var(--muted)' }}>Intelligence</Link>
        <span>›</span>
        <span style={{ color: 'var(--text)' }}>Signals</span>
      </nav>

      <section style={{ textAlign: 'center', padding: 'var(--space-6) 0 var(--space-5)' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, margin: '0 0 var(--space-3)', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Signal Tracker
        </h1>
        <p style={{ color: 'var(--muted)', maxWidth: 560, margin: '0 auto', fontSize: '1rem' }}>
          {SIGNALS.length} signals tracked across {CATEGORIES.length - 1} categories.
        </p>
      </section>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
        {CATEGORIES.map(cat => (
          <Link
            key={cat}
            href={cat === 'all' ? '/intelligence/signals' : `/intelligence/signals?category=${cat}`}
            className="intel-filter-pill"
            style={((category ?? 'all') === cat) ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' } : undefined}
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Link>
        ))}
      </div>

      <div className="signals-index-grid">
        {filtered.map(signal => {
          const count = signalCounts.get(signal.id) ?? 0
          return (
            <Link key={signal.id} href={`/intelligence/signals/${signal.id}`} className="signals-index-card">
              <div className="signals-index-card__top">
                <div className="signals-index-card__category-row">
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: CATEGORY_COLOR[signal.category], background: `color-mix(in srgb, ${CATEGORY_COLOR[signal.category]} 10%, transparent)`, padding: '2px 8px', borderRadius: '100px' }}>
                    {signal.category}
                  </span>
                  <div className="signals-index-card__badges">
                    <span className={`status-badge ${STATUS_CLASS[signal.current_status]}`}>{STATUS_LABEL[signal.current_status]}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>
                      {MOMENTUM_ICON[signal.momentum]}
                    </span>
                  </div>
                </div>
                <h3 className="signals-index-card__title">{signal.title}</h3>
                <p className="signals-index-card__desc">{signal.description}</p>
              </div>
              <div className="signals-index-card__bottom">
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{count} article{count !== 1 ? 's' : ''}</span>
                <span className="signals-index-card__cta">View evidence →</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
