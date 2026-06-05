import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { fetchFeed } from '@/lib/rss'
import { getOpenAI } from '@/lib/openai'
import { slugify } from '@/lib/slugify'
import { DEFAULT_EXTRACTOR_PROMPT, DEFAULT_INDUSTRY_PROMPT } from '@/lib/prompts'

async function getPrompt(supabase: ReturnType<typeof createServiceClient>, key: string, fallback: string): Promise<string> {
  try {
    const { data } = await supabase.from('settings').select('value').eq('key', key).single()
    return data?.value || fallback
  } catch {
    return fallback
  }
}

export const maxDuration = 60

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
  const { data: sources } = await supabase
    .from('rss_sources')
    .select('*')
    .eq('active', true)

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

  for (const source of sources) {
    const items = await fetchFeed(source.url)
    const fresh = items.filter(i => i.link && !seen.has(i.link)).slice(0, 2)

    for (const item of fresh) {
      try {
        const articleText = item.contentSnippet ?? item.content ?? ''
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

        if (facts === 'UNUSABLE_CONTENT') {
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
        const slug = slugify(title)

        await supabase.from('drafts').insert({
          title,
          slug,
          content,
          source_url: item.link,
          source_feed_id: source.id,
          source_published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          status: 'pending',
        })

        seen.add(item.link)
        processed++
      } catch {}
    }
  }

  return NextResponse.json({ processed })
}
