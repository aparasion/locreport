'use client'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { useState } from 'react'

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

type Period = '2024' | '2025' | 'ytd' | '1m' | '1w' | '1d'

const PERIODS: { key: Period; label: string; start: () => string }[] = [
  { key: '2024', label: '2024', start: () => '2024-01-01' },
  { key: '2025', label: '2025', start: () => '2025-01-01' },
  { key: 'ytd',  label: 'YTD',  start: () => `${new Date().getFullYear()}-01-01` },
  { key: '1m',   label: '1M',   start: () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10) } },
  { key: '1w',   label: '1W',   start: () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10) } },
  { key: '1d',   label: '1D',   start: () => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().slice(0, 10) } },
]

export function LocStockChart({ quotes, tickers }: { quotes: Record<string, unknown>; tickers: string[] }) {
  const [period, setPeriod] = useState<Period>('ytd')
  const [show, setShow] = useState(true)

  const periodStart = PERIODS.find(p => p.key === period)!.start()

  // Collect filtered histories
  const histories: Record<string, HistoryPoint[]> = {}
  for (const t of tickers) {
    const q = quotes[t] as Quote | undefined
    const hist = q?.history?.filter(h => h.date >= periodStart).sort((a, b) => a.date.localeCompare(b.date))
    if (hist && hist.length > 1) histories[t] = hist
  }

  const tickerCount = Object.keys(histories).length

  // Collect all dates in range
  const dateSet = new Set<string>()
  Object.values(histories).forEach(h => h.forEach(p => dateSet.add(p.date)))
  const dates = Array.from(dateSet).sort()

  // Base each ticker to 100 at first available date in period
  const bases: Record<string, number> = {}
  for (const [t, h] of Object.entries(histories)) {
    if (h[0]) bases[t] = h[0].close
  }

  // Build equal-weighted index
  const chartData = dates.length >= 2
    ? dates.map(date => {
        const values: number[] = []
        for (const [t, h] of Object.entries(histories)) {
          const pt = h.find(p => p.date === date)
          const base = bases[t]
          if (pt && base) values.push((pt.close / base) * 100)
        }
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
        return { date, index: avg != null ? parseFloat(avg.toFixed(2)) : null }
      })
    : []

  const noData = tickerCount === 0 || chartData.length < 2

  return (
    <div className="market-chart-section">
      <div className="market-chart-header">
        <span className="market-chart-title">
          LocIndex — equal-weighted, base&nbsp;100
          {tickerCount > 0 && <span className="market-chart-count">{tickerCount} ticker{tickerCount !== 1 ? 's' : ''}</span>}
        </span>
        <div className="market-chart-controls">
          <div className="market-period-group">
            {PERIODS.map(p => (
              <button
                key={p.key}
                className={`market-period-btn${period === p.key ? ' active' : ''}`}
                onClick={() => setPeriod(p.key)}
              >{p.label}</button>
            ))}
          </div>
          <button className="market-chart-toggle" onClick={() => setShow(v => !v)}>
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {show && (
        noData ? (
          <div className="market-chart-empty">No history data available for this period</div>
        ) : (
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
                  tickFormatter={v => `${Number(v).toFixed(0)}`}
                  domain={['auto', 'auto']}
                  width={48}
                />
                <ReferenceLine y={100} stroke="var(--muted,#94a3b8)" strokeDasharray="4 2" />
                <Tooltip
                  formatter={(v: unknown) => [`${Number(v).toFixed(1)}`, 'Index']}
                  labelFormatter={(l: string) => `Date: ${l}`}
                  contentStyle={{ fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="index"
                  stroke="var(--accent,#3550F5)"
                  dot={false}
                  strokeWidth={2.5}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )
      )}
    </div>
  )
}
