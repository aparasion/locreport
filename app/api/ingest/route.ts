import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { fetchFeed, fetchArticleText } from '@/lib/rss'
import { getOpenAI } from '@/lib/openai'
import { slugify, uniqueSlug } from '@/lib/slugify'
import { DEFAULT_EXTRACTOR_PROMPT, DEFAULT_INDUSTRY_PROMPT } from '@/lib/prompts'
import { classifyArticle } from '@/lib/classify'

async function getPrompt(supabase: ReturnType<typeof createServiceClient>, key: string, fallback: string): Promise<string> {
  try {
    const { data } = await supabase.from('settings').select('value').eq('key', key).single()
    return data?.value || fallback
  } catch {
    return fallback
  }
}

export const maxDuration = 300

export async function GET(req: NextRequest) {
  return POST(req)
}

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

  const supabase = createServiceClient()
  const { searchParams } = new URL(req.url)
  const sourceFilter = searchParams.get('sources')?.split(',').map(s => s.trim()).filter(Boolean) ?? []

  let sourcesQuery = supabase.from('rss_sources').select('*').eq('active', true)
  if (sourceFilter.length > 0) sourcesQuery = sourcesQuery.in('id', sourceFilter)
  const { data: sources } = await sourcesQuery

  if (!sources?.length) return NextResponse.json({ processed: 0 })

  const { data: existingDrafts } = await supabase
    .from('drafts')
    .select('source_url')
    .not('source_url', 'is', null)

  const seen = new Set((existingDrafts ?? []).map(d => d.source_url))

  const { data: existingArticles } = await supabase
    .from('articles')
    .select('source_url')
    .not('source_url', 'is', null)

  ;(existingArticles ?? []).forEach(a => seen.add(a.source_url))

  // Also check seen_urls table (imported from Jekyll seen.json)
  const { data: seenUrls } = await supabase.from('seen_urls').select('url')
  ;(seenUrls ?? []).forEach(r => seen.add(r.url))

  const openai = getOpenAI()
  const extractorPrompt = await getPrompt(supabase, 'prompt_extractor', DEFAULT_EXTRACTOR_PROMPT)
  const industryPrompt = await getPrompt(supabase, 'prompt_industry', DEFAULT_INDUSTRY_PROMPT)
  let processed = 0
  const errors: string[] = []
  const skipped: string[] = []

  for (const source of sources) {
    const items = await fetchFeed(source.url)
    console.log(`[ingest] ${source.url}: ${items.length} items, ${items.filter(i => i.link && !seen.has(i.link)).length} fresh`)
    const fresh = items.filter(i => i.link && !seen.has(i.link)).slice(0, 2)

    for (const item of fresh) {
      try {
        // Prefer full article text over RSS snippet — RSS feeds only carry teasers
        const fetchedText = item.link ? await fetchArticleText(item.link) : null
        const articleText = fetchedText ?? item.contentSnippet ?? item.content ?? ''
        console.log(`[ingest] article text length for ${item.link}: ${articleText.length} chars${fetchedText ? ' (fetched)' : ' (rss snippet)'}`)

        if (articleText.length < 200) {
          console.log(`[ingest] skipping ${item.link}: text too short (${articleText.length} chars, likely paywalled)`)
          skipped.push(item.link)
          seen.add(item.link)
          continue
        }

        const extractInput = [
          item.link ? `Source URL: ${item.link}` : '',
          `Title: ${item.title}`,
          `Article content:\n${articleText}`,
        ].filter(Boolean).join('\n\n')

        // Stage 1: extract facts
        const extractRes = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: extractorPrompt },
            { role: 'user', content: extractInput },
          ],
        })
        const facts = extractRes.choices[0].message.content ?? ''

        if (facts.trim() === 'UNUSABLE_CONTENT') {
          console.log(`[ingest] UNUSABLE_CONTENT: ${item.link}`)
          skipped.push(item.link)
          seen.add(item.link)
          continue
        }

        // Stage 2: generate article
        const generateInput = [
          item.link ? `Source URL: ${item.link}` : '',
          `Suggested title: ${item.title}`,
          `Extracted facts:\n${facts}`,
        ].filter(Boolean).join('\n\n')

        const generateRes = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: industryPrompt },
            { role: 'user', content: generateInput },
          ],
        })
        const content = generateRes.choices[0].message.content ?? ''
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1].trim() : item.title
        const slug = await uniqueSlug(slugify(title), 'drafts', supabase)

        const classification = await classifyArticle(openai, content)

        const { error: insertError } = await supabase.from('drafts').insert({
          title,
          slug,
          content,
          source_url: item.link,
          source_feed_id: source.id,
          source_published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          status: 'pending',
          ai_impact_score: classification.impact_score,
          ai_time_horizon: classification.time_horizon,
          ai_signal_ids: classification.signal_ids,
        })

        if (insertError) {
          console.error(`[ingest] DB insert failed for ${item.link}:`, insertError)
          errors.push(`${item.link}: ${insertError.message}`)
        } else {
          seen.add(item.link)
          processed++
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`[ingest] Error processing ${item.link}:`, err)
        errors.push(`${item.link}: ${msg}`)
      }
    }
  }

  return NextResponse.json({ processed, skipped: skipped.length, errors })
}
