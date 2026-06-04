import type { Metadata } from 'next'
import { LocStockClient } from './LocStockClient'
import data from '@/assets/data/market_quotes.json'

export const dynamic = 'force-static'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'LocStock — Localization Market Index | LocReport',
  description: 'Live equity overview of 34 publicly traded companies with exposure to language services, AI translation, and localization technology.',
}

export default function LocStockPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <LocStockClient quotes={data.quotes} updatedAt={data.updated_at} />
    </div>
  )
}
