import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { domainToPublisher } from '@/lib/utils'

function normalisePublisher(raw: string): string {
  // If it looks like a domain (contains a dot, no spaces), convert it
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(raw.trim())) {
    return domainToPublisher(raw.trim())
  }
  return raw
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { dryRun = false } = await req.json().catch(() => ({}))

  const service = createServiceClient()

  const { data: articles, error } = await service
    .from('articles')
    .select('id, publisher')
    .not('publisher', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const updates: { id: string; old: string; new: string }[] = []

  for (const article of articles ?? []) {
    const normalised = normalisePublisher(article.publisher)
    if (normalised !== article.publisher) {
      updates.push({ id: article.id, old: article.publisher, new: normalised })
    }
  }

  if (dryRun) {
    return NextResponse.json({ dryRun: true, count: updates.length, updates })
  }

  let applied = 0
  const errors: string[] = []

  for (const u of updates) {
    const { error: updateError } = await service
      .from('articles')
      .update({ publisher: u.new })
      .eq('id', u.id)

    if (updateError) {
      errors.push(`${u.id}: ${updateError.message}`)
    } else {
      applied++
    }
  }

  return NextResponse.json({ applied, errors, updates })
}
