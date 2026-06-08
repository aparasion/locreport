import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import YahooFinanceClass from 'yahoo-finance2'
const yahooFinance = new (YahooFinanceClass as any)()

export const maxDuration = 60

const TICKERS = [
  'NVDA','GOOGL','MSFT','META','AMZN','NFLX','DUOL','RWS.L',
  'SOUN','AI','BIDU','035420.KS','0700.HK','SPOT','ADBE','ORCL',
  'SAP','IBM','TEP.PA','AMN','TASK','INFY','WIT','ZOO.L','APX.AX',
  'AIM.AX','STG.AX','2483.T','6182.T','7812.T','300080.KQ','VQS.V',
  'ONEI','STAR7.MI','301236.SZ',
]

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

  const service = createServiceClient()
  const now = new Date()
  // 30-day history window — pass as ISO string for v3 compatibility
  const period1 = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  let updated = 0
  let failed = 0
  const details: Record<string, { history: number; historicalErr?: string } | { error: string }> = {}

  for (const ticker of TICKERS) {
    try {
      let historicalErr = ''
      const [quote, chart] = await Promise.all([
        yahooFinance.quote(ticker),
        yahooFinance.chart(ticker, { period1, interval: '1d' }).catch((e: unknown) => {
          historicalErr = String(e)
          return null
        }),
      ])

      const history = ((chart?.quotes ?? []) as Array<{ date: Date; close: number | null }>)
        .filter(h => h.close != null)
        .map(h => ({ date: (h.date as Date).toISOString().slice(0, 10), close: h.close as number }))
        .sort((a, b) => a.date.localeCompare(b.date))

      const data = {
        price: quote.regularMarketPrice ?? 0,
        change: quote.regularMarketChange ?? 0,
        change_pct: quote.regularMarketChangePercent ?? 0,
        prev_close: quote.regularMarketPreviousClose ?? 0,
        currency: quote.currency ?? 'USD',
        market_cap: quote.marketCap ?? 0,
        history,
      }

      await service.from('market_quotes').upsert(
        { ticker, data, updated_at: now.toISOString() },
        { onConflict: 'ticker' }
      )
      details[ticker] = historicalErr ? { history: 0, historicalErr } : { history: history.length }
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
