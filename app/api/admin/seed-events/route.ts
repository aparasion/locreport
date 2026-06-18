import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { EVENTS } from '@/lib/data/events'
import { slugify } from '@/lib/slugify'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  // Fetch existing events to avoid duplicates (match by name + start_date)
  const { data: existing } = await service.from('events').select('name, start_date, slug')
  const existingKeys = new Set(
    (existing ?? []).map((e: { name: string; start_date: string }) => `${e.name}|${e.start_date}`)
  )
  const existingSlugs = new Set((existing ?? []).map((e: { slug?: string }) => e.slug).filter(Boolean))

  const toInsert = EVENTS.filter(
    ev => !existingKeys.has(`${ev.name}|${ev.start_date}`) && !existingSlugs.has(ev.id)
  )

  if (toInsert.length === 0) {
    return NextResponse.json({ inserted: 0, message: 'All static events already in database.' })
  }

  const rows = toInsert.map(ev => ({
    name: ev.name,
    organizer: ev.organizer,
    start_date: ev.start_date,
    end_date: ev.end_date,
    location: ev.location,
    format: ev.format,
    category: ev.category,
    url: ev.url,
    description: ev.description,
    tags: ev.tags,
    slug: ev.id, // static event id is already a clean slug (e.g. 'slatorcon-london')
  }))

  // Try with slug field first; if slug column doesn't exist yet, retry without it
  let { error } = await service.from('events').insert(rows)
  if (error?.message?.includes('slug')) {
    const rowsWithoutSlug = rows.map(({ slug: _slug, ...rest }) => rest)
    const retry = await service.from('events').insert(rowsWithoutSlug)
    if (retry.error) return NextResponse.json({ error: retry.error.message }, { status: 500 })
  } else if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ inserted: toInsert.length })
}
