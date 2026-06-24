import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS, type FactCategory } from '@/lib/facts'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://locreport.com'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const supabase = await createClient()

  const { data: facts } = await supabase
    .from('facts')
    .select('id, content, category, source_url, source_name, article_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  type FactRow = { id: string; content: string; category: string; source_url: string | null; source_name: string | null; article_id: string | null; created_at: string }
  const items = (facts as FactRow[] ?? []).map(f => {
    const label = CATEGORY_LABELS[f.category as FactCategory] ?? f.category
    const title = `[${label}] ${f.content.slice(0, 80)}${f.content.length > 80 ? '…' : ''}`
    const link = f.article_id
      ? `${BASE_URL}/articles/${f.article_id}`
      : f.source_url ?? `${BASE_URL}/fact-flow`
    const description = escapeXml(f.content)
    const pubDate = new Date(f.created_at).toUTCString()
    const guid = `${BASE_URL}/fact-flow#${f.id}`
    const sourcePart = f.source_name ? `<source url="${escapeXml(f.source_url ?? '')}">${escapeXml(f.source_name)}</source>` : ''

    return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <category>${escapeXml(label)}</category>
      ${sourcePart}
    </item>`
  }).join('\n')

  const lastBuildDate = facts?.[0]
    ? new Date(facts[0].created_at).toUTCString()
    : new Date().toUTCString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LocReport Fact Flow</title>
    <link>${BASE_URL}/fact-flow</link>
    <description>Raw facts, data points, milestones, and quotes extracted from localization and language technology industry sources.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/fact-flow/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/icon.png</url>
      <title>LocReport Fact Flow</title>
      <link>${BASE_URL}/fact-flow</link>
    </image>
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
