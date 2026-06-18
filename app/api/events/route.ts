import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EVENTS } from '@/lib/data/events'
import { slugify } from '@/lib/slugify'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true })

  if (error) {
    // Table may not exist yet — fall back to static data
    return NextResponse.json(EVENTS)
  }

  // If DB is empty, return static seed data
  if (!data || data.length === 0) return NextResponse.json(EVENTS)

  // Merge DB events with static events, DB takes precedence for same id
  const dbIds = new Set(data.map((e: { id: string }) => e.id))
  const merged = [...data, ...EVENTS.filter(e => !dbIds.has(e.id))]
  merged.sort((a, b) => a.start_date.localeCompare(b.start_date))
  return NextResponse.json(merged)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()

  const year = (body.start_date ?? '').slice(0, 4)
  const slug = slugify(`${body.name}${year ? `-${year}` : ''}`)

  const { data, error } = await supabase
    .from('events')
    .insert([{ ...body, slug }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
