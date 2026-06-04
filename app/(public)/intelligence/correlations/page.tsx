import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SIGNAL_MAP, CATEGORY_COLOR } from '@/lib/signals'
import { articleHref } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Signal Correlation Matrix — LocReport Intelligence',
  description: 'Which localization industry signals move together? Full co-occurrence matrix across all tracked articles.',
}

export const revalidate = 3600

type Pair = {
  signal_a: string
  signal_b: string
  count: number
  strength: 'strong' | 'moderate' | 'weak'
  examples: { id: string; title: string; slug: string; published_at: string }[]
}

export default async function CorrelationsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, signal_ids, published_at')
    .neq('article_type', 'theory')
    .not('signal_ids', 'eq', '{}')

  const articles = data ?? []

  // Build co-occurrence map
  const coMap = new Map<string, { count: number; examples: typeof articles }>()
  for (const a of articles) {
    const ids: string[] = a.signal_ids ?? []
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join('|')
        const entry = coMap.get(key) ?? { count: 0, examples: [] }
        entry.count++
        if (entry.examples.length < 2) entry.examples.push(a)
        coMap.set(key, entry)
      }
    }
  }

  const pairs: Pair[] = Array.from(coMap.entries())
    .filter(([, v]) => v.count >= 1)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([key, v]) => {
      const [signal_a, signal_b] = key.split('|')
      const strength: Pair['strength'] = v.count >= 6 ? 'strong' : v.count >= 3 ? 'moderate' : 'weak'
      return { signal_a, signal_b, count: v.count, strength, examples: v.examples }
    })

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-12)' }}>
      <section className="intel-hero">
        <h1>Signal Correlation Matrix</h1>
        <p className="intel-subtitle">Signals that frequently co-occur in the same articles reveal structural connections — patterns no single article exposes. Updated automatically with each new article batch.</p>
        <p style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
          <Link href="/intelligence" style={{ color: 'var(--accent)', fontSize: '0.88rem', fontWeight: 600 }}>← Back to Intelligence Dashboard</Link>
        </p>
      </section>

      <section className="corr-page-section">
        <h2 className="corr-page-section-title">Co-occurrence Pairs</h2>
        <p className="corr-page-section-desc">Each pair shows how many tracked articles reference both signals simultaneously. Stronger connections indicate the signals are structurally linked in how the industry discusses them.</p>

        <div className="corr-legend">
          <span className="corr-strength corr-strength--strong">Strong ≥6</span>
          <span className="corr-strength corr-strength--moderate">Moderate ≥3</span>
          <span className="corr-strength corr-strength--weak">Weak ≥1</span>
        </div>

        {pairs.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No co-occurrences found yet. Correlations appear as articles with multiple signal IDs are published.</p>
        ) : (
          <div className="corr-pairs-grid">
            {pairs.map(({ signal_a, signal_b, count, strength, examples }) => {
              const sigA = SIGNAL_MAP.get(signal_a)
              const sigB = SIGNAL_MAP.get(signal_b)
              if (!sigA || !sigB) return null
              return (
                <div key={`${signal_a}|${signal_b}`} className={`corr-pair-card corr-pair-card--${strength}`}>
                  <div className="corr-pair-strength">
                    <span className={`corr-strength corr-strength--${strength}`}>{strength}</span>
                    <span className="corr-pair-count">{count} article{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="corr-pair-signals">
                    <Link href={`/intelligence/signals/${signal_a}`} className={`corr-pair-signal corr-pair-signal--${sigA.category}`}>
                      <span className="corr-pair-signal-cat" style={{ color: CATEGORY_COLOR[sigA.category] }}>{sigA.category}</span>
                      <span className="corr-pair-signal-title">{sigA.title}</span>
                    </Link>
                    <span className="corr-pair-connector" aria-hidden="true">↔</span>
                    <Link href={`/intelligence/signals/${signal_b}`} className={`corr-pair-signal corr-pair-signal--${sigB.category}`}>
                      <span className="corr-pair-signal-cat" style={{ color: CATEGORY_COLOR[sigB.category] }}>{sigB.category}</span>
                      <span className="corr-pair-signal-title">{sigB.title}</span>
                    </Link>
                  </div>
                  {examples.length > 0 && (
                    <ul className="corr-pair-examples">
                      {examples.map(e => (
                        <li key={e.id}>
                          <Link href={articleHref(e.slug)}>{e.title}</Link>
                          {' '}<span className="corr-example-date">{new Date(e.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
