'use client'
import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import type { LLMModel, ModelPriceHistory } from '@/lib/data/llm-pricing'

interface Props {
  models: LLMModel[]
  history: ModelPriceHistory[]
}

const PALETTE = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
  '#84cc16', '#6366f1', '#14b8a6', '#e11d48',
]

type TokenType = 'input' | 'output'

// Build a unified sorted date axis and fill forward missing values per model
function buildChartData(
  selectedIds: string[],
  history: ModelPriceHistory[],
  tokenType: TokenType,
) {
  const historyMap = new Map(history.map(h => [h.modelId, h]))

  // Collect all dates across selected models
  const allDates = new Set<string>()
  for (const id of selectedIds) {
    const h = historyMap.get(id)
    if (h) h.snapshots.forEach(s => allDates.add(s.date))
  }
  const sortedDates = [...allDates].sort()

  if (sortedDates.length === 0) return []

  // Add today if the last snapshot is older
  const today = new Date().toISOString().slice(0, 10)
  if (sortedDates[sortedDates.length - 1] < today) {
    sortedDates.push(today)
  }

  // For each date, carry forward the last known price for each model
  return sortedDates.map(date => {
    const point: Record<string, string | number> = { date }
    for (const id of selectedIds) {
      const h = historyMap.get(id)
      if (!h) continue
      // Find latest snapshot on or before this date
      const snap = [...h.snapshots]
        .filter(s => s.date <= date)
        .sort((a, b) => a.date.localeCompare(b.date))
        .at(-1)
      if (snap) point[id] = tokenType === 'input' ? snap.input : snap.output
    }
    return point
  })
}

function formatDate(d: string) {
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export function PricingHistoryChart({ models, history }: Props) {
  const [tokenType, setTokenType] = useState<TokenType>('input')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(models.slice(0, 5).map(m => m.id))
  )

  const modelMap = useMemo(() => new Map(models.map(m => [m.id, m])), [models])

  function toggle(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) { if (next.size > 1) next.delete(id) }
      else next.add(id)
      return next
    })
  }

  const selected = [...selectedIds]
  const chartData = useMemo(
    () => buildChartData(selected, history, tokenType),
    [selected, history, tokenType]
  )

  const providers = [...new Set(models.map(m => m.provider))]

  return (
    <div className="phc-root">
      <div className="phc-header">
        <div>
          <h2 className="phc-title">Price history</h2>
          <p className="phc-subtitle">
            API list price per 1M tokens over time. Select models to compare.
          </p>
        </div>
        <div className="phc-toggle-group">
          <button
            className={`phc-toggle-btn${tokenType === 'input' ? ' active' : ''}`}
            onClick={() => setTokenType('input')}
          >
            Input
          </button>
          <button
            className={`phc-toggle-btn${tokenType === 'output' ? ' active' : ''}`}
            onClick={() => setTokenType('output')}
          >
            Output
          </button>
        </div>
      </div>

      <div className="phc-model-picker">
        {providers.map(provider => (
          <div key={provider} className="phc-provider-group">
            <div className="phc-provider-label">{provider}</div>
            <div className="phc-chips">
              {models.filter(m => m.provider === provider).map((m, i) => {
                const colorIdx = models.indexOf(m) % PALETTE.length
                const isActive = selectedIds.has(m.id)
                return (
                  <button
                    key={m.id}
                    className={`phc-chip${isActive ? ' active' : ''}`}
                    style={isActive ? {
                      borderColor: PALETTE[colorIdx],
                      color: PALETTE[colorIdx],
                      background: PALETTE[colorIdx] + '18',
                    } : {}}
                    onClick={() => toggle(m.id)}
                  >
                    {m.name}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="phc-chart-wrap">
        {chartData.length < 2 ? (
          <div className="phc-empty">
            Not enough historical data for selected models.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: 'var(--muted)' }}
                minTickGap={40}
              />
              <YAxis
                tickFormatter={v => `$${v}`}
                tick={{ fontSize: 12, fill: 'var(--muted)' }}
                width={52}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `$${value}/1M`,
                  modelMap.get(name)?.name ?? name,
                ]}
                labelFormatter={formatDate}
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
              <Legend
                formatter={(value) => modelMap.get(value)?.name ?? value}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              {selected.map((id, idx) => (
                <Line
                  key={id}
                  type="stepAfter"
                  dataKey={id}
                  stroke={PALETTE[models.findIndex(m => m.id === id) % PALETTE.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="phc-disclaimer">
        Snapshots reflect announced API list prices at point of change. Historical data is manually curated — verify against provider documentation for accuracy.
      </p>
    </div>
  )
}
