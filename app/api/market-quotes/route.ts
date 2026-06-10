import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const maxDuration = 60

const TICKERS = [
  'NVDA','GOOGL','MSFT','META','AMZN','NFLX','DUOL','RWS.L',
  'SOUN','AI','BIDU','035420.KS','0700.HK','SPOT','ADBE','ORCL',
  'SAP','IBM','TEP.PA','AMN','TASK','INFY','WIT','ZOO.L','APX.AX',
  'AIM.AX','STG.AX','2483.T','6182.T','7812.T','300080.KQ','VQS.V',
  'ONEI','STAR7.MI','301236.SZ',
]

// Yahoo-style ticker → Twelve Data symbol (exchange suffix format)
const TD_SYMBOL: Record<string, string> = {
  'RWS.L':     'RWS:LSE',
  'ZOO.L':     'ZOO:LSE',
  '035420.KS': '035420:KRX',
  '0700.HK':   '0700:HKEX',
  'TEP.PA':    'TEP:EURONEXT',
  'APX.AX':    'APX:ASX',
  'AIM.AX':    'AIM:ASX',
  'STG.AX':    'STG:ASX',
  '2483.T':    '2483:TSE',
  '6182.T':    '6182:TSE',
  '7812.T':    '7812:TSE',
  '300080.KQ': '300080:KOSDAQ',
  'VQS.V':     'VQS:TSX',
  'STAR7.MI':  'STAR7:MIL',
  '301236.SZ': '301236:SZSE',
}

function tdSym(ticker: string) {
  return TD_SYMBOL[ticker] ?? ticker
}

const TD_BASE = 'https://api.twelvedata.com'

interface TDQuote {
  symbol: string
  currency?: string
  close?: string
  change?: string
  percent_change?: string
  previous_close?: string
  market_cap?: string
  status?: string
}

interface TDBar {
  datetime: string
  close: string
}

interface TDSeries {
  status?: string
  values?: TDBar[]
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  const isCron = auth === `Bearer ${process.env.CRON_SECRET}`

  if (!isCron) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const key = process.env.TWELVE_DATA_KEY
  if (!key) return NextResponse.json({ error: 'TWELVE_DATA_KEY not set' }, { status: 500 })

  const service = createServiceClient()
  const now = new Date()
  const symbols = TICKERS.map(tdSym).join(',')

  // Fetch quotes and history in parallel — batch all symbols in one request each
  const [quotesRes, historyRes] = await Promise.all([
    fetch(`${TD_BASE}/quote?symbol=${symbols}&apikey=${key}`),
    fetch(`${TD_BASE}/time_series?symbol=${symbols}&interval=1day&start_date=2024-01-01&outputsize=5000&apikey=${key}`),
  ])

  const quotesJson = await quotesRes.json() as Record<string, TDQuote>
  const historyJson = await historyRes.json() as Record<string, TDSeries>

  // If Twelve Data returned a top-level error (e.g. plan limit, invalid key), bail early
  if ((quotesJson as { status?: string }).status === 'error') {
    const msg = (quotesJson as { message?: string }).message ?? 'Unknown Twelve Data error'
    console.error('[market-quotes] API error:', msg, quotesJson)
    return NextResponse.json({ error: msg, raw: quotesJson }, { status: 502 })
  }
  console.log('[market-quotes] quote keys received:', Object.keys(quotesJson).slice(0, 5))

  let updated = 0
  let failed = 0
  const details: Record<string, { history: number } | { error: string }> = {}

  for (const ticker of TICKERS) {
    const sym = tdSym(ticker)
    try {
      // When only one symbol is requested, TD returns the object directly (not nested)
      const q: TDQuote = (quotesJson[sym] ?? quotesJson) as TDQuote
      const s: TDSeries = (historyJson[sym] ?? historyJson) as TDSeries

      if (q.status === 'error' || !q.close) throw new Error(`No quote data for ${sym}`)

      const history = (s.values ?? [])
        .map(b => ({ date: b.datetime, close: parseFloat(b.close) }))
        .filter(b => !isNaN(b.close))
        .sort((a, b) => a.date.localeCompare(b.date))

      const data = {
        price:      parseFloat(q.close ?? '0'),
        change:     parseFloat(q.change ?? '0'),
        change_pct: parseFloat(q.percent_change ?? '0'),
        prev_close: parseFloat(q.previous_close ?? '0'),
        currency:   q.currency ?? 'USD',
        market_cap: q.market_cap ? parseFloat(q.market_cap) : 0,
        history,
      }

      await service.from('market_quotes').upsert(
        { ticker, data, updated_at: now.toISOString() },
        { onConflict: 'ticker' }
      )
      details[ticker] = { history: history.length }
      updated++
    } catch (err) {
      console.error(`[market-quotes] failed ${ticker}:`, err)
      details[ticker] = { error: String(err) }
      failed++
    }
  }

  return NextResponse.json({ updated, failed, total: TICKERS.length, details })
}

export async function GET() {
  const service = createServiceClient()
  const { data, error } = await service
    .from('market_quotes')
    .select('ticker, data, updated_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const quotes: Record<string, unknown> = {}
  let updatedAt = ''
  for (const row of data ?? []) {
    quotes[row.ticker] = row.data
    if (!updatedAt || row.updated_at > updatedAt) updatedAt = row.updated_at
  }
  return NextResponse.json({ quotes, updated_at: updatedAt })
}
