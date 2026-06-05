import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()

  // Fetch all articles without an author
  const { data: articles, error: fetchError } = await service
    .from('articles')
    .select('id, article_type, draft_id')
    .is('author', null)

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
  if (!articles?.length) return NextResponse.json({ updated: 0, message: 'No articles missing author' })

  // Fetch drafts for articles that have a draft_id, to check source_feed_id
  const draftIds = articles.map(a => a.draft_id).filter(Boolean) as string[]
  const draftFeedMap = new Map<string, string | null>()

  if (draftIds.length) {
    const { data: drafts } = await service
      .from('drafts')
      .select('id, source_feed_id')
      .in('id', draftIds)
    for (const d of drafts ?? []) {
      draftFeedMap.set(d.id, d.source_feed_id)
    }
  }

  // Determine author for each article
  const updates: Array<{ id: string; author: string }> = []
  for (const article of articles) {
    let author: string
    if (article.article_type === 'theory') {
      author = 'LocReport Research Desk'
    } else if (article.article_type === 'monthly-summary') {
      author = 'LocReport Industry Desk'
    } else {
      // industry: check if it came from RSS ingest (has draft with source_feed_id)
      const feedId = article.draft_id ? draftFeedMap.get(article.draft_id) : undefined
      if (feedId) {
        author = 'LocReport Industry Desk'
      } else if (article.draft_id && draftFeedMap.has(article.draft_id)) {
        // draft exists but source_feed_id is null — came from Compose
        author = 'LocReport Editorial Desk'
      } else {
        // No draft link — direct insert, treat as industry
        author = 'LocReport Industry Desk'
      }
    }
    updates.push({ id: article.id, author })
  }

  // Apply updates
  const results = await Promise.allSettled(
    updates.map(({ id, author }) =>
      service.from('articles').update({ author }).eq('id', id)
    )
  )

  const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error))
  const succeeded = updates.length - failed.length

  const breakdown = updates.reduce<Record<string, number>>((acc, { author }) => {
    acc[author] = (acc[author] ?? 0) + 1
    return acc
  }, {})

  return NextResponse.json({ updated: succeeded, failed: failed.length, breakdown })
}
