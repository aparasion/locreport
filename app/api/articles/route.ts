import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { slugify, uniqueSlug } from '@/lib/slugify'

export async function POST(req: NextRequest) {
  const { content } = await req.json()
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled'
  const supabase = createServiceClient()
  const slug = await uniqueSlug(slugify(title), 'articles', supabase)
  const { data, error } = await supabase
    .from('articles')
    .insert({ title, slug, content, article_type: 'industry', author: 'LocReport Editorial Desk', publisher: 'LocReport' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
