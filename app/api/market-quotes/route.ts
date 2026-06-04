import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import yahooFinance from 'yahoo-finance2'

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
  // 30-day history window
  const period1 = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000)

  let updated = 0
  let failed = 0

  for (const ticker of TICKERS) {
    try {
      const [quote, historical] = await Promise.all([
        yahooFinance.quote(ticker),
        yahooFinance.historical(ticker, { period1, interval: '1d' }).catch(() => []),
      ])

      const history = (historical as Array<{ date: Date; close: number }>)
        .map(h => ({ date: h.date.toISOString().slice(0, 10), close: h.close }))
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
      updated++
    } catch {
      failed++
    }
  }

  return NextResponse.json({ updated, failed, total: TICKERS.length })
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
