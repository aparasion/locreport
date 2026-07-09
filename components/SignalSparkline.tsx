'use client'

import { Area, AreaChart, ResponsiveContainer } from 'recharts'

export interface SparkPoint {
  week: string
  count: number
}

// Tiny trend-shape indicator (weekly article volume). Values are surfaced in
// text next to it — the sparkline itself is decorative reinforcement.
export function SignalSparkline({ data, height = 36 }: { data: SparkPoint[]; height?: number }) {
  const flat = data.every(d => d.count === 0)
  return (
    <div className="signal-sparkline" style={{ height }} aria-hidden="true">
      {flat ? (
        <span className="signal-sparkline__flat" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--accent)"
              strokeWidth={1.5}
              fill="var(--accent-soft, rgba(53, 80, 245, 0.12))"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
