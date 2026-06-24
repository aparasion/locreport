import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { fetchArticleText } from '@/lib/rss'
import { getOpenAI } from '@/lib/openai'
import { DEFAULT_EXTRACTOR_PROMPT, DEFAULT_FACTFLOW_PROMPT } from '@/lib/prompts'
import { parseDistilledFacts } from '@/lib/facts'

export const maxDuration = 60

async function getPrompt(supabase: ReturnType<typeof createServiceClient>, key: string, fallback: string): Promise<string> {
  try {
    const { data } = await supabase.from('settings').select('value').eq('key', key).single()
    return data?.value || fallback
  } catch {
    return fallback
  }
}

// POST /api/admin/backfill-facts
// Body: { article_id?: string, slug?: string }
// Re-fetches source, runs extractor, saves facts linked to the article.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { article_id, slug } = body

  const svc = createServiceClient()

  let query = svc.from('articles').select('id, title, content, source_url, slug, draft_id')
  if (article_id) query = query.eq('id', article_id)
  else if (slug) query = query.eq('slug', slug)
  else return NextResponse.json({ error: 'Provide article_id or slug' }, { status: 400 })

  const { data: article, error: articleError } = await query.single()
  if (articleError || !article) return NextResponse.json({ error: 'Article not found' }, { status: 404 })

  // Check if facts already exist for this article
  const { count } = await svc
    .from('facts')
    .select('id', { count: 'exact', head: true })
    .eq('article_id', article.id)

  if ((count ?? 0) > 0) {
    return NextResponse.json({ message: `Already has ${count} facts — skipping. Delete existing facts first to re-run.`, count })
  }

  const extractorPrompt = await getPrompt(svc, 'prompt_extractor', DEFAULT_EXTRACTOR_PROMPT)
  const openai = getOpenAI()

  // Try source URL first; fall back to the published article body
  let extractText: string | null = null
  let textSource = 'source'

  if (article.source_url) {
    const fetched = await fetchArticleText(article.source_url)
    if (fetched && fetched.length >= 200) {
      extractText = fetched
    }
  }

  if (!extractText) {
    // Use the published article content (strip markdown for cleaner extraction)
    extractText = article.content ?? null
    textSource = 'article body'
  }

  if (!extractText || extractText.length < 200) {
    return NextResponse.json({ error: 'No usable text found in source or article body' }, { status: 422 })
  }

  const extractInput = [
    article.source_url ? `Source URL: ${article.source_url}` : '',
    `Title: ${article.title}`,
    `Article content:\n${extractText}`,
  ].filter(Boolean).join('\n\n')

  const extractRes = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: extractorPrompt },
      { role: 'user', content: extractInput },
    ],
  })
  const raw = extractRes.choices[0].message.content ?? ''

  if (raw.trim() === 'UNUSABLE_CONTENT') {
    return NextResponse.json({ error: `UNUSABLE_CONTENT from ${textSource}` }, { status: 422 })
  }

  // Distil into 2-3 curated news bullets
  const factFlowPrompt = await getPrompt(svc, 'prompt_factflow', DEFAULT_FACTFLOW_PROMPT)
  const distilRes = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: factFlowPrompt },
      { role: 'user', content: raw },
    ],
  })
  const distilled = parseDistilledFacts(distilRes.choices[0].message.content ?? '')
  if (distilled.length === 0) {
    return NextResponse.json({ error: 'No facts parsed after distillation', raw }, { status: 422 })
  }

  // Resolve source_name from rss_sources via draft linkage if available
  const { data: draft } = await svc
    .from('drafts')
    .select('source_feed_id')
    .eq('id', article.draft_id ?? '')
    .maybeSingle()

  let sourceName: string | null = null
  if (draft?.source_feed_id) {
    const { data: src } = await svc
      .from('rss_sources')
      .select('name')
      .eq('id', draft.source_feed_id)
      .single()
    sourceName = src?.name ?? null
  }

  const { error: insertError } = await svc.from('facts').insert(
    distilled.map(content => ({
      content,
      category: 'news',
      source_url: article.source_url,
      source_name: sourceName,
      article_id: article.id,
    }))
  )

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  return NextResponse.json({ ok: true, article_slug: article.slug, facts_saved: distilled.length, text_source: textSource })
}
