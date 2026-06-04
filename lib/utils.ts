export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Returns the bare slug (last segment only) for use in article URLs.
// DB slugs are stored as "2026/06/04/article-name"; URLs use "/articles/article-name".
export function articleHref(slug: string): string {
  return `/articles/${slug.split('/').pop()}`
}
