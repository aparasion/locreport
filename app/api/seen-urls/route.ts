import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// POST: bulk-insert URLs into seen_urls
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { urls } = await req.json()
  if (!Array.isArray(urls) || !urls.length) {
    return NextResponse.json({ error: 'urls array required' }, { status: 400 })
  }

  const service = createServiceClient()
  const rows = urls.filter((u: unknown) => typeof u === 'string' && u.startsWith('http'))
    .map((url: string) => ({ url }))

  const { error } = await service
    .from('seen_urls')
    .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ imported: rows.length })
}

// GET: count
export async function GET() {
  const service = createServiceClient()
  const { count } = await service.from('seen_urls').select('*', { count: 'exact', head: true })
  return NextResponse.json({ count: count ?? 0 })
}
