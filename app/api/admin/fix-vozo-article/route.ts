import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// One-time fix: removes a fabricated "298 agencies" statistic hallucinated by
// GPT-4o-mini during article generation. The original Vozo AI source used only
// qualitative language ("agencies often engage in…"). After running, delete this file.
export async function POST() {
  const supabase = await createServiceClient()

  const { data: article, error: fetchError } = await supabase
    .from('articles')
    .select('id, content')
    .eq('slug', 'vozo-ai-urges-agencies-to-prioritize-on-screen-text-translation')
    .single()

  if (fetchError || !article) {
    return NextResponse.json({ error: fetchError?.message ?? 'Article not found' }, { status: 404 })
  }

  const fixed = article.content.replace(
    /With 298 agencies typically involved in such comprehensive projects, ensuring/g,
    'Ensuring'
  )

  if (fixed === article.content) {
    return NextResponse.json({ message: 'No change needed — pattern not found in current content.' })
  }

  const { error: updateError } = await supabase
    .from('articles')
    .update({ content: fixed, updated_at: new Date().toISOString() })
    .eq('id', article.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Article patched. Delete app/api/admin/fix-vozo-article/route.ts now.' })
}
