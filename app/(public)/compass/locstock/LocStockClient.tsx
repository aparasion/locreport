'use client'
import { useState } from 'react'

interface Quote {
  price: number
  change: number
  change_pct: number
  prev_close: number
  currency: string
  market_cap: number
}

interface Props {
  quotes: Record<string, Quote>
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

const CAT_LABELS: Record<string, string> = {
  all: 'All', aiplatform: 'AI Platform', bigtech: 'Big Tech',
  media: 'Media', learning: 'Learning', lsp: 'Language Services',
  enterprise: 'Enterprise SW', bpo: 'BPO & Staffing',
  aidata: 'AI & Data'
}

const COUNTRY_FLAGS: Record<string, string> = {
  US:'🇺🇸', UK:'🇬🇧', CN:'🇨🇳', KR:'🇰🇷', HK:'🇭🇰', SE:'🇸🇪', DE:'🇩🇪',
  FR:'🇫🇷', IN:'🇮🇳', AU:'🇦🇺', NZ:'🇳🇿', JP:'🇯🇵', CA:'🇨🇦', IT:'🇮🇹',
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD:'$', EUR:'€', GBP:'£', GBp:'p', HKD:'HK$', KRW:'₩', JPY:'¥',
  AUD:'A$', CAD:'C$', NZD:'NZ$',
}

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
  return new Date(iso).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZoneName:'short' })
}

const DELISTED = [
  { ticker:'KWS',  name:'Keywords Studios',    ex:'LSE AIM', reason:'Acquired by EQT Partners (private equity), 2024' },
  { ticker:'TIXT', name:'TELUS International', ex:'NYSE/TSX', reason:'Taken private by TELUS Corp, 2024' },
  { ticker:'STIX', name:'Semantix',            ex:'NASDAQ',  reason:'Merged / delisted 2023' },
  { ticker:'SDL',  name:'SDL plc',             ex:'LSE',     reason:'Acquired by RWS Holdings, 2021' },
  { ticker:'LBI',  name:'Lionbridge',          ex:'NASDAQ',  reason:'Taken private by H.I.G. Capital, 2017' },
  { ticker:'SUL',  name:'Summa Linguae',       ex:'WSE',     reason:'Delisted from Warsaw Stock Exchange' },
]

export function LocStockClient({ quotes, updatedAt }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const cats = Object.keys(CAT_LABELS)

  const catCounts = cats.reduce<Record<string,number>>((acc, cat) => {
    if (cat === 'all') { acc[cat] = COMPANIES.length; return acc }
    acc[cat] = COMPANIES.filter(c => c.cat === cat).length
    return acc
  }, {})

  const filtered = activeFilter === 'all' ? [...COMPANIES] : COMPANIES.filter(c => c.cat === activeFilter)

  let gainers = 0, decliners = 0, unchanged = 0
  for (const c of COMPANIES) {
    const q = quotes[c.t]
    if (!q) continue
    if (q.change_pct > 0) gainers++
    else if (q.change_pct < 0) decliners++
    else unchanged++
  }

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
        Updated: {fmtDate(updatedAt)}
      </div>

      <div className="market-mosaic">
        {filtered.map(co => {
          const q = quotes[co.t]
          const dir = !q ? 'flat' : q.change_pct > 0 ? 'up' : q.change_pct < 0 ? 'down' : 'flat'
          const isFeatured = 'ft' in co && co.ft
          const warn = 'warn' in co ? co.warn : undefined
          return (
            <div
              key={co.t}
              className={`market-card ${dir}${isFeatured ? ' featured' : ''}`}
            >
              <div className="market-card-ticker">{co.s}</div>
              <div className="market-card-name">{co.n}</div>
              {q ? (
                <>
                  <div className="market-card-price">{formatPrice(q.price, q.currency)}</div>
                  <div className={`market-card-change ${dir}`}>
                    {q.change_pct >= 0 ? '+' : ''}{q.change_pct.toFixed(2)}%
                    {' '}({q.change >= 0 ? '+' : ''}{q.change.toFixed(2)})
                  </div>
                  <div className="market-card-mcap">Mkt cap: {formatPrice(q.market_cap, q.currency).replace(/\.\d+$/, '')} → {formatMCap(q.market_cap)}</div>
                </>
              ) : (
                <div className="market-card-change flat">No data</div>
              )}
              <div className="market-card-meta">
                {COUNTRY_FLAGS[co.co] ?? co.co} {co.ex}
                {warn && <span style={{marginLeft:4}}>{warn}</span>}
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
