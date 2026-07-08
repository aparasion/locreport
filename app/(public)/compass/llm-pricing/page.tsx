import type { Metadata } from 'next'
import { LLM_MODELS, LLM_PRICE_HISTORY } from '@/lib/data/llm-pricing'
import { PricingClient } from './PricingClient'
import { PricingHistoryChart } from './PricingHistoryChart'

export const metadata: Metadata = {
  title: 'AI Translation Cost Simulator | LocReport Compass',
  description: 'Compare monthly API translation costs across GPT-4o, Claude, Gemini, DeepSeek and more. Build your language programme pair by pair.',
  alternates: { canonical: '/compass/llm-pricing' },
}

export default function LLMPricingPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <h1 style={{ marginBottom: 'var(--space-2)' }}>AI Translation Cost Simulator</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-6)' }}>
        Build your language programme pair by pair, set word volumes, and compare monthly API costs across leading LLMs.
      </p>
      <PricingClient models={LLM_MODELS} />
      <PricingHistoryChart models={LLM_MODELS} history={LLM_PRICE_HISTORY} />
    </div>
  )
}
