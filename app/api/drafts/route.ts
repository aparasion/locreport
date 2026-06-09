import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { slugify, uniqueSlug } from '@/lib/slugify'

export async function GET() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('drafts')
    .select('*')
    .order('created_at', { ascending: false })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const { content, source_url, publisher } = await req.json()
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled'
  const supabase = createServiceClient()
  const slug = await uniqueSlug(slugify(title), 'drafts', supabase)
  const { data, error } = await supabase
    .from('drafts')
    .insert({ title, slug, content, source_url: source_url ?? null, publisher: publisher ?? null, status: 'pending' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}

// Bulk status update
export async function PATCH(req: NextRequest) {
  const { ids, status } = await req.json()
  if (!Array.isArray(ids) || !ids.length || !status) {
    return NextResponse.json({ error: 'ids array and status required' }, { status: 400 })
  }
  const supabase = createServiceClient()
  const { error } = await supabase.from('drafts').update({ status }).in('id', ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
