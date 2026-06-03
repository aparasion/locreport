import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  const { data } = await supabase.from('rss_sources').select('*').order('name')
  return NextResponse.json(data ?? [])
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
