import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { articleHref } from '@/lib/utils'

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

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, author, published_at')
    .order('published_at', { ascending: false })
    .limit(50)

  const items = (articles ?? [])
    .map(a => {
      const link = `${BASE_URL}${articleHref(a.slug)}`
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>
      ${a.author ? `<dc:creator>${escapeXml(a.author)}</dc:creator>` : ''}
      ${a.excerpt ? `<description>${escapeXml(a.excerpt)}</description>` : ''}
    </item>`
    }).join('\n')

  const lastBuildDate = articles?.[0]
    ? new Date(articles[0].published_at).toUTCString()
    : new Date().toUTCString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>LocReport</title>
    <link>${BASE_URL}</link>
    <description>Daily translation and localization news capturing the trends, innovations, and movements shaping the language services industry.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/icon.png</url>
      <title>LocReport</title>
      <link>${BASE_URL}</link>
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
