'use client'
import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

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

interface Props {
  quotes: Record<string, unknown>
  updatedAt: string
}

const COMPANIES = [
  { t:'NVDA',      s:'NVDA',   n:'NVIDIA Corporation',      ex:'NASDAQ',         co:'US', cat:'aiplatform', ft:true },
  { t:'GOOGL',     s:'GOOGL',  n:'Alphabet (Google)',       ex:'NASDAQ',         co:'US', cat:'bigtech',    ft:true },
  { t:'MSFT',      s:'MSFT',   n:'Microsoft Corporation',   ex:'NASDAQ',         co:'US', cat:'bigtech',    ft:true },
  { t:'META',      s:'META',   n:'Meta Platforms Inc.',     ex:'NASDAQ',         co:'US', cat:'bigtech',    ft:true },
  { t:'AMZN',      s:'AMZN',   n:'Amazon.com Inc.',         ex:'NASDAQ',         co:'US', cat:'bigtech',    ft:true },
  { t:'NFLX',      s:'NFLX',   n:'Netflix Inc.',            ex:'NASDAQ',         co:'US', cat:'media',      ft:true },
  { t:'DUOL',      s:'DUOL',   n:'Duolingo Inc.',           ex:'NASDAQ',         co:'US', cat:'learning',   ft:true },
  { t:'RWS.L',     s:'RWS',    n:'RWS Holdings plc',        ex:'LSE',            co:'UK', cat:'lsp',        ft:true },
  { t:'SOUN',      s:'SOUN',   n:'SoundHound AI Inc.',      ex:'NASDAQ',         co:'US', cat:'aiplatform'        },
  { t:'AI',        s:'AI',     n:'C3.ai Inc.',              ex:'NYSE',           co:'US', cat:'aiplatform'        },
  { t:'BIDU',      s:'BIDU',   n:'Baidu Inc.',              ex:'NASDAQ',         co:'CN', cat:'bigtech'           },
  { t:'035420.KS', s:'NAVER',  n:'Naver Corporation',       ex:'KRX',            co:'KR', cat:'bigtech'           },
  { t:'0700.HK',   s:'0700',   n:'Tencent Holdings',        ex:'HKEX',           co:'HK', cat:'bigtech'           },
  { t:'SPOT',      s:'SPOT',   n:'Spotify Technology S.A.', ex:'NYSE',           co:'SE', cat:'media'             },
  { t:'ADBE',      s:'ADBE',   n:'Adobe Inc.',              ex:'NASDAQ',         co:'US', cat:'enterprise'        },
  { t:'ORCL',      s:'ORCL',   n:'Oracle Corporation',      ex:'NYSE',           co:'US', cat:'enterprise'        },
  { t:'SAP',       s:'SAP',    n:'SAP SE',                  ex:'NYSE',           co:'DE', cat:'enterprise'        },
  { t:'IBM',       s:'IBM',    n:'IBM Corporation',         ex:'NYSE',           co:'US', cat:'enterprise'        },
  { t:'TEP.PA',    s:'TEP',    n:'Teleperformance SE',      ex:'Euronext Paris', co:'FR', cat:'bpo'               },
  { t:'AMN',       s:'AMN',    n:'AMN Healthcare Services', ex:'NYSE',           co:'US', cat:'bpo'               },
  { t:'TASK',      s:'TASK',   n:'TaskUs Inc.',             ex:'NASDAQ',         co:'US', cat:'bpo'               },
  { t:'INFY',      s:'INFY',   n:'Infosys Ltd',             ex:'NYSE',           co:'IN', cat:'bpo'               },
  { t:'WIT',       s:'WIT',    n:'Wipro Ltd',               ex:'NYSE',           co:'IN', cat:'bpo'               },
  { t:'ZOO.L',     s:'ZOO',    n:'ZOO Digital Group plc',   ex:'LSE AIM',        co:'UK', cat:'lsp'               },
  { t:'APX.AX',    s:'APX',    n:'Appen Limited',           ex:'ASX',            co:'AU', cat:'lsp'               },
  { t:'AIM.AX',    s:'AIM',    n:'Ai-Media Technologies',   ex:'ASX',            co:'AU', cat:'lsp'               },
  { t:'STG.AX',    s:'STG',    n:'Straker Limited',         ex:'ASX',            co:'NZ', cat:'lsp'               },
  { t:'2483.T',    s:'2483',   n:'Honyaku Center Inc.',     ex:'TSE',            co:'JP', cat:'lsp'               },
  { t:'6182.T',    s:'6182',   n:'Metareal Corp.',          ex:'TSE',            co:'JP', cat:'lsp'               },
  { t:'7812.T',    s:'7812',   n:'CRESTEC Inc.',            ex:'TSE',            co:'JP', cat:'lsp'               },
  { t:'300080.KQ', s:'300080', n:'Flitto Inc.',             ex:'KOSDAQ',         co:'KR', cat:'lsp'               },
  { t:'VQS.V',     s:'VQS',    n:'VIQ Solutions Inc.',      ex:'TSX-V',          co:'CA', cat:'lsp'               },
  { t:'ONEI',      s:'ONEI',   n:'OneMeta Inc.',            ex:'OTCQB',          co:'US', cat:'lsp'               },
  { t:'STAR7.MI',  s:'STAR7',  n:'STAR7 S.p.A.',            ex:'Euronext Milan', co:'IT', cat:'lsp', warn:'⚠ Delisting planned' },
  { t:'301236.SZ', s:'301236', n:'iSoftStone Technology',   ex:'SZSE',           co:'CN', cat:'aidata'            },
] as const

// Featured tickers shown in the performance chart
const CHART_TICKERS = ['NVDA','GOOGL','MSFT','DUOL','RWS.L'] as const
const CHART_COLORS: Record<string, string> = {
  NVDA:'#76b900', GOOGL:'#4285F4', MSFT:'#00a4ef', DUOL:'#58CC02', 'RWS.L':'#8b5cf6',
}

const CAT_LABELS: Record<string, string> = {
  all:'All', aiplatform:'AI Platform', bigtech:'Big Tech',
  media:'Media', learning:'Learning', lsp:'Language Services',
  enterprise:'Enterprise SW', bpo:'BPO & Staffing', aidata:'AI & Data',
}

const COUNTRY_FLAGS: Record<string, string> = {
  US:'🇺🇸', UK:'🇬🇧', CN:'🇨🇳', KR:'🇰🇷', HK:'🇭🇰', SE:'🇸🇪', DE:'🇩🇪',
  FR:'🇫🇷', IN:'🇮🇳', AU:'🇦🇺', NZ:'🇳🇿', JP:'🇯🇵', CA:'🇨🇦', IT:'🇮🇹',
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD:'$', EUR:'€', GBP:'£', GBp:'p', HKD:'HK$', KRW:'₩', JPY:'¥',
  AUD:'A$', CAD:'C$', NZD:'NZ$',
}

const DELISTED = [
  { ticker:'KWS',  name:'Keywords Studios',    ex:'LSE AIM',  reason:'Acquired by EQT Partners (private equity), 2024' },
  { ticker:'TIXT', name:'TELUS International', ex:'NYSE/TSX', reason:'Taken private by TELUS Corp, 2024' },
  { ticker:'STIX', name:'Semantix',            ex:'NASDAQ',   reason:'Merged / delisted 2023' },
  { ticker:'SDL',  name:'SDL plc',             ex:'LSE',      reason:'Acquired by RWS Holdings, 2021' },
  { ticker:'LBI',  name:'Lionbridge',          ex:'NASDAQ',   reason:'Taken private by H.I.G. Capital, 2017' },
  { ticker:'SUL',  name:'Summa Linguae',       ex:'WSE',      reason:'Delisted from Warsaw Stock Exchange' },
]

function formatMCap(v: number): string {
  if (v >= 1e12) return `${(v/1e12).toFixed(1)}T`
  if (v >= 1e9)  return `${(v/1e9).toFixed(1)}B`
  if (v >= 1e6)  return `${(v/1e6).toFixed(1)}M`
  return v.toLocaleString()
}

function formatPrice(price: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + ' '
  if (['KRW','JPY'].includes(currency)) return `${sym}${Math.round(price).toLocaleString()}`
  return `${sym}${price.toFixed(2)}`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day:'numeric', month:'short', year:'numeric',
    hour:'2-digit', minute:'2-digit', timeZoneName:'short',
  })
}

// SVG sparkline from history array
function Sparkline({ history, dir }: { history: HistoryPoint[]; dir: string }) {
  if (!history || history.length < 2) return null
  const prices = history.map(h => h.close)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const W = 80, H = 28
  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * W
    const y = H - ((p - min) / range) * H
    return `${x},${y}`
  }).join(' ')
  const color = dir === 'up' ? '#16a34a' : dir === 'down' ? '#dc2626' : '#94a3b8'
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="market-sparkline">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" points={points} />
    </svg>
  )
}

// Build normalised (% from first close) chart data for featured tickers
function buildChartData(quotes: Record<string, unknown>): Record<string, number | string>[] {
  const series: Record<string, { date: string; close: number }[]> = {}
  for (const t of CHART_TICKERS) {
    const q = quotes[t] as Quote | undefined
    if (q?.history?.length) series[t] = q.history
  }
  // Collect all dates
  const dateSet = new Set<string>()
  Object.values(series).forEach(h => h.forEach(p => dateSet.add(p.date)))
  const dates = Array.from(dateSet).sort()

  return dates.map(date => {
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
}

export function LocStockClient({ quotes, updatedAt }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [showChart, setShowChart] = useState(true)

  const cats = Object.keys(CAT_LABELS)
  const catCounts = cats.reduce<Record<string,number>>((acc, cat) => {
    acc[cat] = cat === 'all' ? COMPANIES.length : COMPANIES.filter(c => c.cat === cat).length
    return acc
  }, {})

  const filtered = activeFilter === 'all' ? [...COMPANIES] : COMPANIES.filter(c => c.cat === activeFilter)

  let gainers = 0, decliners = 0, unchanged = 0
  for (const c of COMPANIES) {
    const q = quotes[c.t] as Quote | undefined
    if (!q) continue
    if (q.change_pct > 0) gainers++
    else if (q.change_pct < 0) decliners++
    else unchanged++
  }

  const chartData = buildChartData(quotes)

  return (
    <>
      <div className="market-hero">
        <h1>LocStock</h1>
        <p className="market-subtitle">
          Live equity overview of 34 publicly traded companies with exposure to language services,
          AI translation, and localization technology across 14 global exchanges.
        </p>
      </div>

      <div className="market-stats-bar">
        <div className="market-stat">
          <span className="market-stat-value up">{gainers}</span>
          <span className="market-stat-label">Gainers</span>
        </div>
        <div className="market-stat">
          <span className="market-stat-value down">{decliners}</span>
          <span className="market-stat-label">Decliners</span>
        </div>
        <div className="market-stat">
          <span className="market-stat-value">{unchanged}</span>
          <span className="market-stat-label">Unchanged</span>
        </div>
        <div className="market-stat">
          <span className="market-stat-value">{COMPANIES.length}</span>
          <span className="market-stat-label">Companies</span>
        </div>
      </div>

      {/* 30-day performance chart */}
      {chartData.length > 1 && (
        <div className="market-chart-section">
          <div className="market-chart-header">
            <span className="market-chart-title">30-day performance — key stocks (% change from start)</span>
            <button className="market-chart-toggle" onClick={() => setShowChart(v => !v)}>
              {showChart ? 'Hide chart' : 'Show chart'}
            </button>
          </div>
          {showChart && (
            <div className="market-chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--muted, #6b7280)' }}
                    tickFormatter={d => d.slice(5)}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--muted, #6b7280)' }}
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
      )}

      <div className="market-filters">
        {cats.map(cat => (
          <button
            key={cat}
            className={`market-filter-btn${activeFilter === cat ? ' active' : ''}`}
            onClick={() => setActiveFilter(cat)}
          >
            {CAT_LABELS[cat]}
            <span className="market-filter-count">{catCounts[cat]}</span>
          </button>
        ))}
      </div>

      <div className="market-updated">
        Updated: {updatedAt ? fmtDate(updatedAt) : '—'}
      </div>

      <div className="market-mosaic">
        {filtered.map(co => {
          const q = quotes[co.t] as Quote | undefined
          const dir = !q ? 'flat' : q.change_pct > 0 ? 'up' : q.change_pct < 0 ? 'down' : 'flat'
          const isFeatured = 'ft' in co && co.ft
          const warn = 'warn' in co ? co.warn : undefined
          return (
            <div key={co.t} className={`market-card ${dir}${isFeatured ? ' featured' : ''}`}>
              <div className="market-card-ticker">{co.s}</div>
              <div className="market-card-name">{co.n}</div>
              {q ? (
                <>
                  <div className="market-card-price">{formatPrice(q.price, q.currency)}</div>
                  <div className={`market-card-change ${dir}`}>
                    {q.change_pct >= 0 ? '+' : ''}{q.change_pct.toFixed(2)}%
                    {' '}({q.change >= 0 ? '+' : ''}{q.change.toFixed(2)})
                  </div>
                  {q.history && q.history.length > 1 && (
                    <Sparkline history={q.history} dir={dir} />
                  )}
                  <div className="market-card-mcap">{formatMCap(q.market_cap)}</div>
                </>
              ) : (
                <div className="market-card-change flat">No data</div>
              )}
              <div className="market-card-meta">
                {COUNTRY_FLAGS[co.co] ?? co.co} {co.ex}
                {warn && <span style={{ marginLeft: 4 }}>{warn}</span>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="market-delisted-section">
        <div className="market-delisted-title">Delisted / Former listings</div>
        <div className="market-delisted-grid">
          {DELISTED.map(d => (
            <div key={d.ticker} className="market-delisted-card">
              <div className="market-delisted-ticker">{d.ticker}</div>
              <div className="market-delisted-name">{d.name}</div>
              <div className="market-delisted-meta">{d.ex}</div>
              <div className="market-delisted-reason">{d.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
