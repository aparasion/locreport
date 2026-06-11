import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DIRECTORY } from '@/lib/data/directory'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('directory')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!error && data) return NextResponse.json(data)

  const staticEntry = DIRECTORY.find(e => e.slug === slug)
  if (staticEntry) return NextResponse.json(staticEntry)

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('directory')
    .update(body)
    .eq('slug', slug)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { error } = await supabase.from('directory').delete().eq('slug', slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
