'use client'

import Link from 'next/link'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface MomentumPanel {
  id: string
  label: string
  momentum: 'rising' | 'stable' | 'declining'
  total: number
  monthly: { month: string; count: number }[]
}

const MOMENTUM_GLYPH: Record<MomentumPanel['momentum'], string> = {
  rising: '↑ Rising',
  stable: '→ Stable',
  declining: '↓ Declining',
}

function monthLabel(m: string): string {
  return new Date(m + '-01T00:00:00Z').toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
}

// Small multiples: one panel per signal, all in the brand accent, so identity
// comes from the panel title rather than color discrimination.
export function SignalMomentumChart({ panels }: { panels: MomentumPanel[] }) {
  const maxCount = Math.max(1, ...panels.flatMap(p => p.monthly.map(d => d.count)))

  return (
    <div className="momentum-grid">
      {panels.map(panel => {
        const flat = panel.monthly.every(d => d.count === 0)
        return (
          <Link key={panel.id} href={`/intelligence/signals/${panel.id}`} className="momentum-panel">
            <div className="momentum-panel__head">
              <span className="momentum-panel__label">{panel.label}</span>
              <span className={`momentum-panel__badge momentum-panel__badge--${panel.momentum}`}>
                {MOMENTUM_GLYPH[panel.momentum]}
              </span>
            </div>
            <p className="momentum-panel__total">{panel.total} article{panel.total !== 1 ? 's' : ''} · 12 mo</p>
            <div className="momentum-panel__chart">
              {flat ? (
                <p className="momentum-panel__empty">No coverage yet in this window</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={panel.monthly} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                    <XAxis
                      dataKey="month"
                      tickFormatter={monthLabel}
                      ticks={[panel.monthly[0]?.month, panel.monthly[panel.monthly.length - 1]?.month].filter(Boolean)}
                      tick={{ fontSize: 10, fill: 'var(--muted)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis hide domain={[0, maxCount]} />
                    <Tooltip
                      cursor={{ stroke: 'var(--border)' }}
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 12,
                        color: 'var(--text)',
                      }}
                      labelFormatter={m => monthLabel(String(m))}
                      formatter={(value) => [`${value} article${value === 1 ? '' : 's'}`, null]}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      fill="var(--accent-soft, rgba(53, 80, 245, 0.12))"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
