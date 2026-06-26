import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { DIRECTORY } from '@/lib/data/directory'

// POST /api/admin/seed-directory
// Upserts all hardcoded directory entries into the Supabase directory table.
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const rows = DIRECTORY.map(e => ({
    name: e.name,
    slug: e.slug,
    category: e.category,
    website: e.website,
    description: e.description,
    long_description: e.long_description,
    founded: e.founded,
    hq: e.hq,
    address: e.address,
    type: e.type,
    tags: e.tags,
    logo_url: e.logo_url ?? null,
  }))

  const { error, count } = await supabase
    .from('directory')
    .upsert(rows, { onConflict: 'slug', count: 'exact' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, upserted: count ?? rows.length })
}
