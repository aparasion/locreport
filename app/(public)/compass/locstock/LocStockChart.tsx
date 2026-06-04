'use client'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useState } from 'react'

const CHART_TICKERS = ['NVDA','GOOGL','MSFT','DUOL','RWS.L'] as const
const CHART_COLORS: Record<string, string> = {
  NVDA:'#76b900', GOOGL:'#4285F4', MSFT:'#00a4ef', DUOL:'#58CC02', 'RWS.L':'#8b5cf6',
}

interface HistoryPoint { date: string; close: number }
interface Quote {
  price: number
  change: number
  change_pct: number
  prev_close: number
  currency: string
  market_cap: number
  history?: HistoryPoint[]
}

export function LocStockChart({ quotes }: { quotes: Record<string, unknown> }) {
  const [show, setShow] = useState(true)

  // Build normalised % change series
  const series: Record<string, HistoryPoint[]> = {}
  for (const t of CHART_TICKERS) {
    const q = quotes[t] as Quote | undefined
    if (q?.history?.length && q.history.length > 1) series[t] = q.history
  }

  if (!Object.keys(series).length) return null

  const dateSet = new Set<string>()
  Object.values(series).forEach(h => h.forEach(p => dateSet.add(p.date)))
  const dates = Array.from(dateSet).sort()

  if (dates.length < 2) return null

  const chartData = dates.map(date => {
    const row: Record<string, number | string> = { date }
    for (const t of CHART_TICKERS) {
      const h = series[t]
      if (!h) continue
      const base = h[0]?.close
      const pt = h.find(p => p.date === date)
      if (base && pt) row[t] = parseFloat(((pt.close / base - 1) * 100).toFixed(2))
    }
    return row
  })

  return (
    <div className="market-chart-section">
      <div className="market-chart-header">
        <span className="market-chart-title">30-day performance — key stocks (% from start)</span>
        <button className="market-chart-toggle" onClick={() => setShow(v => !v)}>
          {show ? 'Hide chart' : 'Show chart'}
        </button>
      </div>
      {show && (
        <div className="market-chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border,#e5e7eb)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--muted,#6b7280)' }}
                tickFormatter={d => d.slice(5)}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted,#6b7280)' }}
                tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`}
                width={52}
              />
              <Tooltip
                formatter={(v: number) => [`${v > 0 ? '+' : ''}${v}%`]}
                labelFormatter={l => `Date: ${l}`}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {CHART_TICKERS.map(t => (
                <Line
                  key={t}
                  type="monotone"
                  dataKey={t}
                  stroke={CHART_COLORS[t]}
                  dot={false}
                  strokeWidth={2}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
