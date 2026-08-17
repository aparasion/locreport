'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { SparkPoint } from '@/components/SignalSparkline'

// Recharts stays out of the homepage's initial bundle — sparklines hydrate
// after load and the panel renders fine (flat lines) without them.
const SignalSparkline = dynamic(
  () => import('@/components/SignalSparkline').then(m => m.SignalSparkline),
  { ssr: false, loading: () => <div style={{ height: 26 }} /> }
)

export interface SignalPulseItem {
  id: string
  label: string
  momentum: 'rising' | 'stable' | 'declining'
  recentCount: number
  weekly: SparkPoint[]
}

const GLYPH: Record<SignalPulseItem['momentum'], string> = { rising: '↑', stable: '→', declining: '↓' }

// The homepage's one data-forward signature: real coverage-momentum for the
// signals we track, not a decorative widget. Lives beside the masthead
// headline rather than buried in a sidebar.
export function SignalPulse({ items }: { items: SignalPulseItem[] }) {
  if (items.length === 0) return null
  return (
    <div className="signal-pulse" aria-label="Signal pulse — coverage momentum">
      <div className="signal-pulse__head">
        <span className="signal-pulse__live" aria-hidden="true" />
        <span className="signal-pulse__title">Signal pulse</span>
        <span className="signal-pulse__sub">8-week momentum</span>
      </div>
      <div className="signal-pulse__list">
        {items.map(item => (
          <Link key={item.id} href={`/intelligence/signals/${item.id}`} className="signal-pulse__row">
            <span className="signal-pulse__row-text">
              <span className="signal-pulse__label">{item.label}</span>
              <span className={`signal-pulse__momentum signal-pulse__momentum--${item.momentum}`}>
                {GLYPH[item.momentum]} {item.momentum} · {item.recentCount}/8wk
              </span>
            </span>
            <span className="signal-pulse__chart"><SignalSparkline data={item.weekly} height={26} /></span>
          </Link>
        ))}
      </div>
      <Link href="/intelligence/signals" className="signal-pulse__more">All signals →</Link>
    </div>
  )
}
