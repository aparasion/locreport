import Parser from 'rss-parser'

export interface RssItem {
  title: string
  link: string
  contentSnippet?: string
  content?: string
  pubDate?: string
}

const parser = new Parser()

export async function fetchFeed(url: string): Promise<RssItem[]> {
  try {
    // Use fetch + parseString to avoid rss-parser's internal url.parse() call
    const res = await fetch(url, { headers: { 'User-Agent': 'LocReport/1.0' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()
    const feed = await parser.parseString(xml)
    return feed.items.map((item) => ({
      title: item.title ?? '',
      link: item.link ?? '',
      contentSnippet: item.contentSnippet,
      content: item.content,
      pubDate: item.pubDate,
    }))
  } catch (err) {
    console.error(`[rss] fetchFeed failed for ${url}:`, err)
    return []
  }
}
