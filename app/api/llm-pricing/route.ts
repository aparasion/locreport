import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { LLM_MODELS } from '@/lib/data/llm-pricing'

export const maxDuration = 30

interface OpenRouterModel {
  id: string
  context_length?: number
  pricing?: {
    prompt?: string
    completion?: string
  }
}

interface OpenRouterResponse {
  data?: OpenRouterModel[]
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

  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    return NextResponse.json({ error: `OpenRouter fetch failed: ${res.status}` }, { status: 502 })
  }
  const body = await res.json() as OpenRouterResponse
  const byId = new Map((body.data ?? []).map(m => [m.id, m]))

  const service = createServiceClient()
  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  let updated = 0
  let failed = 0
  const details: Record<string, { input: number; output: number } | { error: string }> = {}

  for (const model of LLM_MODELS) {
    try {
      const or = byId.get(model.openrouterId)
      if (!or?.pricing?.prompt || !or?.pricing?.completion) {
        throw new Error(`No pricing for ${model.openrouterId} on OpenRouter`)
      }

      const input = Number(or.pricing.prompt) * 1_000_000
      const output = Number(or.pricing.completion) * 1_000_000
      if (!Number.isFinite(input) || !Number.isFinite(output)) {
        throw new Error('Non-numeric pricing returned')
      }

      await service.from('llm_pricing_quotes').upsert(
        {
          model_id: model.id,
          data: {
            input,
            output,
            context: or.context_length ?? model.context,
            provider: model.provider,
            name: model.name,
          },
          updated_at: now.toISOString(),
        },
        { onConflict: 'model_id' }
      )

      const { data: latest } = await service
        .from('llm_pricing_history')
        .select('input, output')
        .eq('model_id', model.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!latest || latest.input !== input || latest.output !== output) {
        await service.from('llm_pricing_history').upsert(
          { model_id: model.id, date: today, input, output },
          { onConflict: 'model_id,date' }
        )
      }

      details[model.id] = { input, output }
      updated++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[llm-pricing] failed ${model.id}:`, msg)
      details[model.id] = { error: msg }
      failed++
    }
  }

  return NextResponse.json({ updated, failed, total: LLM_MODELS.length, details })
}

export async function GET() {
  const service = createServiceClient()

  const [{ data: quotes }, { data: history }] = await Promise.all([
    service.from('llm_pricing_quotes').select('model_id, data, updated_at'),
    service.from('llm_pricing_history').select('model_id, date, input, output').order('date', { ascending: true }),
  ])

  const models: Record<string, unknown> = {}
  let updatedAt = ''
  for (const row of quotes ?? []) {
    models[row.model_id] = row.data
    if (!updatedAt || row.updated_at > updatedAt) updatedAt = row.updated_at
  }

  const historyByModel = new Map<string, { date: string; input: number; output: number }[]>()
  for (const row of history ?? []) {
    const list = historyByModel.get(row.model_id) ?? []
    list.push({ date: row.date, input: row.input, output: row.output })
    historyByModel.set(row.model_id, list)
  }
  const historyList = [...historyByModel.entries()].map(([modelId, snapshots]) => ({ modelId, snapshots }))

  return NextResponse.json({ models, history: historyList, updated_at: updatedAt })
}
