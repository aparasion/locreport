export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Returns the bare slug (last segment only) for use in article URLs.
// DB slugs are stored as "2026/06/04/article-name"; URLs use "/articles/article-name".
export function articleHref(slug: string): string {
  return `/articles/${slug.split('/').pop()}`
}

// Extracts 1-2 plain-text sentences from markdown content for use as a teaser.
export function extractTeaser(content: string, maxSentences = 1): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, '')           // fenced code blocks
    .replace(/`[^`\n]+`/g, '')               // inline code
    .replace(/!\[.*?\]\(.*?\)/g, '')          // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → keep text
    .replace(/^#{1,6}\s+/gm, '')             // headings
    .replace(/^[-*_]{3,}\s*$/gm, '')         // horizontal rules
    .replace(/^\s*[-*+]\s+/gm, '')           // unordered list items
    .replace(/^\s*\d+\.\s+/gm, '')           // ordered list items
    .replace(/[*_]{1,3}([^*_\n]+)[*_]{1,3}/g, '$1') // bold / italic
    .replace(/~~([^~\n]+)~~/g, '$1')         // strikethrough
    .replace(/<[^>]+>/g, '')                 // HTML tags
    .replace(/\n+/g, ' ')                   // newlines → space
    .trim()

  const sentences = plain.match(/[^.!?]*[.!?]+(?:\s|$)/g) ?? []
  const result = sentences.slice(0, maxSentences).join('').trim()
  return result || plain.slice(0, 140).trim()
}
