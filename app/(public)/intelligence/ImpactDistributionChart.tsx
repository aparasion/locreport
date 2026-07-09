'use client'

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ImpactBucket } from '@/lib/intelligence'

// Grouped bars: impact-score distribution for the trailing 90 days against
// the 90 days before it. Two series only — brand accent vs neutral.
export function ImpactDistributionChart({ data }: { data: ImpactBucket[] }) {
  const empty = data.every(d => d.recent === 0 && d.prior === 0)
  if (empty) {
    return <p className="momentum-panel__empty">Not enough scored coverage yet to chart the distribution.</p>
  }

  return (
    <div className="impact-chart">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }} barGap={2}>
          <CartesianGrid vertical={false} stroke="var(--hairline)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'var(--accent-soft, rgba(53, 80, 245, 0.08))' }}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--text)',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: 'var(--muted)' }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="recent" name="Last 90 days" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
          <Bar dataKey="prior" name="Prior 90 days" fill="var(--viz-neutral)" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
