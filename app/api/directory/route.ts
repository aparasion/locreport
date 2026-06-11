import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DIRECTORY } from '@/lib/data/directory'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('directory')
    .select('*')
    .order('name', { ascending: true })

  if (error || !data || data.length === 0) {
    return NextResponse.json(DIRECTORY)
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()

  if (!body.slug && body.name) {
    body.slug = body.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80)
  }

  const { data, error } = await supabase
    .from('directory')
    .insert([body])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
