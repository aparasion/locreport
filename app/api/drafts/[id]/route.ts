import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/slugify'
import { extractTeaser } from '@/lib/utils'
import { classifyArticle } from '@/lib/classify'
import { getOpenAI } from '@/lib/openai'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('drafts').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const supabase = createServiceClient()

  if (body.status === 'approved') {
    const { data: draft, error: draftError } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', id)
      .single()
    if (draftError) return NextResponse.json({ error: draftError.message }, { status: 404 })

    const content = body.content ?? draft.content
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : draft.title
    const slug = slugify(title)

    const contentType: 'industry' | 'theory' = body.content_type === 'theory' ? 'theory' : 'industry'

    // Determine author based on origin and content type
    let author: string
    if (contentType === 'theory') {
      author = 'LocReport Research Desk'
    } else {
      author = 'LocReport Editorial Desk'
    }

    // Auto-classify if impact_score or time_horizon not provided
    let { impact_score, time_horizon } = body as { impact_score?: number | null; time_horizon?: string | null }
    let signal_ids: string[] = body.signal_ids ?? []

    if (!impact_score || !time_horizon) {
      const openai = getOpenAI()
      const classification = await classifyArticle(openai, content)
      if (!impact_score) impact_score = classification.impact_score
      if (!time_horizon) time_horizon = classification.time_horizon
      if (!signal_ids.length) signal_ids = classification.signal_ids
    }

    const { error: articleError } = await supabase.from('articles').insert({
      title,
      slug,
      content,
      excerpt: extractTeaser(content),
      source_url: draft.source_url,
      publisher: draft.publisher ?? 'LocReport',
      draft_id: draft.id,
      article_type: contentType,
      author,
      impact_score: impact_score ?? null,
      time_horizon: time_horizon ?? null,
      signal_ids: signal_ids.length ? signal_ids : [],
    })
    if (articleError) return NextResponse.json({ error: articleError.message }, { status: 400 })
  }

  const patch: Record<string, unknown> = { status: body.status }
  if (body.content !== undefined) patch.content = body.content

  const { data, error } = await supabase
    .from('drafts')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
