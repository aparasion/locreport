import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/slugify'

export async function GET() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('drafts')
    .select('*')
    .order('created_at', { ascending: false })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const { content, source_url } = await req.json()
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled'
  const slug = slugify(title)

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('drafts')
    .insert({ title, slug, content, source_url: source_url ?? null, status: 'pending' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
