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
    const feed = await parser.parseURL(url)
    return feed.items.map((item) => ({
      title: item.title ?? '',
      link: item.link ?? '',
      contentSnippet: item.contentSnippet,
      content: item.content,
      pubDate: item.pubDate,
    }))
  } catch {
    return []
  }
}
