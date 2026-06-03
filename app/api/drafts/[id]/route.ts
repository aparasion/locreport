import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/slugify'

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

    const { error: articleError } = await supabase.from('articles').insert({
      title,
      slug,
      content,
      source_url: draft.source_url,
      draft_id: draft.id,
      article_type: 'industry',
    })
    if (articleError) return NextResponse.json({ error: articleError.message }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('drafts')
    .update({ status: body.status, content: body.content })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
