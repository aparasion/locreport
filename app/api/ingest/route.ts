import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchFeed } from '@/lib/rss'
import { getOpenAI } from '@/lib/openai'
import { slugify } from '@/lib/slugify'

const SYSTEM_PROMPT = `You are a journalist for LocReport, covering the language services and localization industry.
Rewrite the provided article as a polished, insightful news article for industry professionals.
Use the format:
# Article Title

Opening paragraph...

## Key Takeaway

Analysis paragraph...

## Industry Implications

Implications paragraph...

Write 400-600 words. Be specific, avoid filler, cite concrete details from the source.`

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  const openai = getOpenAI()
  let processed = 0

  for (const source of sources) {
    const items = await fetchFeed(source.url)
    const fresh = items.filter(i => i.link && !seen.has(i.link)).slice(0, 5)

    for (const item of fresh) {
      try {
        const userContent = `Title: ${item.title}\nURL: ${item.link}\n\n${item.contentSnippet ?? item.content ?? ''}`
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userContent },
          ],
        })
        const content = completion.choices[0].message.content ?? ''
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1].trim() : item.title
        const slug = slugify(title)

        await supabase.from('drafts').insert({
          title,
          slug,
          content,
          source_url: item.link,
          source_feed_id: source.id,
          status: 'pending',
        })

        seen.add(item.link)
        processed++
      } catch {}
    }
  }

  return NextResponse.json({ processed })
}
