import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { embedTexts, embeddingInput } from '@/lib/embeddings'

export const maxDuration = 300

const FETCH_LIMIT = 40
const EMBED_BATCH = 20

// Embeds articles that don't have a vector yet. Call repeatedly (or use the
// admin dashboard button) until `remaining` reaches 0.
export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  const isCron = auth === `Bearer ${process.env.CRON_SECRET}`

  if (!isCron) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const service = createServiceClient()
  const { data: articles, error } = await service
    .from('articles')
    .select('id, title, excerpt, content')
    .is('embedding', null)
    .order('published_at', { ascending: false })
    .limit(FETCH_LIMIT)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let embedded = 0
  const errors: string[] = []

  for (let i = 0; i < (articles ?? []).length; i += EMBED_BATCH) {
    const batch = articles!.slice(i, i + EMBED_BATCH)
    try {
      const vectors = await embedTexts(batch.map(a => embeddingInput(a)))
      for (let j = 0; j < batch.length; j++) {
        const { error: updateError } = await service
          .from('articles')
          .update({ embedding: vectors[j] })
          .eq('id', batch[j].id)
        if (updateError) errors.push(`${batch[j].id}: ${updateError.message}`)
        else embedded++
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err))
    }
  }

  const { count: remaining } = await service
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .is('embedding', null)

  return NextResponse.json({ embedded, remaining: remaining ?? 0, errors })
}
