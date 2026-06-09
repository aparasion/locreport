import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { classifyArticle } from '@/lib/classify'
import { getOpenAI } from '@/lib/openai'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const slugs: string[] = body.slugs ?? []
  if (!slugs.length) return NextResponse.json({ error: 'No slugs provided' }, { status: 400 })

  const service = createServiceClient()
  const openai = getOpenAI()
  const results: Record<string, string> = {}

  for (const slug of slugs) {
    const { data: article, error } = await service
      .from('articles')
      .select('id, content')
      .eq('slug', slug)
      .maybeSingle()

    if (error || !article) {
      results[slug] = 'not found'
      continue
    }

    const classification = await classifyArticle(openai, article.content)
    const { error: updateError } = await service
      .from('articles')
      .update({
        impact_score: classification.impact_score,
        time_horizon: classification.time_horizon,
        signal_ids: classification.signal_ids,
        business_implications: classification.business_implications,
        affected_segments: classification.affected_segments,
      })
      .eq('id', article.id)

    results[slug] = updateError ? `error: ${updateError.message}` : 'updated'
  }

  return NextResponse.json({ results })
}
