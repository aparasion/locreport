import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { slugify, uniqueSlug } from '@/lib/slugify'
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
    const slug = await uniqueSlug(slugify(title), 'articles', supabase)

    const author = body.content_type === 'theory'
      ? 'LocReport Research Desk'
      : 'LocReport Editorial Desk'

    const openai = getOpenAI()
    const classification = await classifyArticle(openai, content)

    const { error: articleError } = await supabase.from('articles').insert({
      title,
      slug,
      content,
      excerpt: extractTeaser(content),
      source_url: draft.source_url,
      publisher: 'LocReport',
      draft_id: draft.id,
      article_type: body.content_type === 'theory' ? 'theory' : 'industry',
      author,
      impact_score: classification.impact_score,
      time_horizon: classification.time_horizon,
      signal_ids: classification.signal_ids,
      business_implications: classification.business_implications,
      affected_segments: classification.affected_segments,
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
