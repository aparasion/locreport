import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [sourcesRes, draftsRes] = await Promise.all([
    supabase.from('rss_sources').select('*').order('created_at', { ascending: true }),
    supabase
      .from('drafts')
      .select('source_feed_id')
      .not('source_feed_id', 'is', null)
      .gte('created_at', thirtyDaysAgo),
  ])

  const draftCounts: Record<string, number> = {}
  for (const d of draftsRes.data ?? []) {
    if (d.source_feed_id) draftCounts[d.source_feed_id] = (draftCounts[d.source_feed_id] ?? 0) + 1
  }

  const sources = (sourcesRes.data ?? []).map(s => ({
    ...s,
    recent_drafts: draftCounts[s.id] ?? 0,
  }))

  return NextResponse.json(sources)
}

export async function POST(req: NextRequest) {
  const { url, name } = await req.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('rss_sources')
    .insert({ url, name })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
