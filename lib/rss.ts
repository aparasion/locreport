import Parser from 'rss-parser'

export interface RssItem {
  title: string
  link: string
  contentSnippet?: string
  content?: string
  pubDate?: string
}

const parser = new Parser()

/**
 * Fetch the full text of an article URL by downloading the page HTML and
 * stripping tags. Returns null if the fetch fails or the URL looks like it
 * won't yield readable article text (e.g. Google News redirect URLs).
 */
export async function fetchArticleText(url: string): Promise<string | null> {
  // Google News redirect URLs: follow the HTTP redirect to reach the real article
  if (url.includes('news.google.com/rss/articles/')) {
    const resolved = await resolveGoogleNewsUrl(url)
    if (!resolved) return null
    console.log(`[rss] Google News resolved: ${url} → ${resolved}`)
    url = resolved
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LocReport/1.0; +https://locreport.com)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.warn(`[rss] fetchArticleText HTTP ${res.status} for ${url}`)
      return null
    }
    const html = await res.text()
    return htmlToText(html)
  } catch (err) {
    console.warn(`[rss] fetchArticleText failed for ${url}:`, err instanceof Error ? err.message : err)
    return null
  }
}

async function resolveGoogleNewsUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LocReport/1.0; +https://locreport.com)' },
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
    })
    const location = res.headers.get('location')
    if (location && !location.includes('news.google.com')) return location
    // Some Google News URLs do a JS redirect — try following normally and read the final URL
    const followed = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LocReport/1.0; +https://locreport.com)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    })
    if (followed.url && !followed.url.includes('news.google.com')) return followed.url
    return null
  } catch {
    return null
  }
}

function htmlToText(html: string): string {
  // Remove script, style, nav, header, footer, aside blocks entirely
  let text = html
    .replace(/<(script|style|nav|header|footer|aside|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    // Remove all remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()

  // Cap at ~8 000 chars to avoid excessive token usage
  return text.slice(0, 8000)
}

export async function fetchFeed(url: string): Promise<RssItem[]> {
  try {
    // Use fetch + parseString to avoid rss-parser's internal url.parse() call
    const res = await fetch(url, { headers: { 'User-Agent': 'LocReport/1.0' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()
    const feed = await parser.parseString(xml)
    const base = new URL(url).origin
    return feed.items.map((item) => {
      let link = item.link ?? ''
      if (link && link.startsWith('/')) link = base + link
      return {
        title: item.title ?? '',
        link,
        contentSnippet: item.contentSnippet,
        content: item.content,
        pubDate: item.pubDate,
      }
    })
  } catch (err) {
    console.error(`[rss] fetchFeed failed for ${url}:`, err)
    return []
  }
}
