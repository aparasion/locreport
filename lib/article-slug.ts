import type { SupabaseClient } from '@supabase/supabase-js'
import { foldToAscii } from './slugify'
import { articleHref } from './utils'
import type { Article } from './types'

/**
 * Resolving legacy article URLs.
 *
 * Google still crawls a long tail of pre-migration Jekyll permalinks. Four things drift
 * between the URL it holds and the slug actually stored in `articles.slug`:
 *
 *  1. Date prefixes — DB slugs are sometimes stored as `2026/03/04/name`, canonical is `/articles/name`.
 *  2. Truncation    — Jekyll cut titles at ~60 chars, slugify() cuts at 80, so the crawled slug is
 *                     a prefix of the stored one (and may end on a dangling hyphen).
 *  3. Diacritics    — slugify() historically deleted accented letters instead of folding them, so
 *                     the crawled `…elias-lönnrot…` is stored as `…elias-lnnrot…`.
 *  4. Dedupe drift  — retitles append `-1`, `-2`, … to an otherwise identical slug.
 *
 * Rather than hand-maintaining a redirect per URL in vercel.json, derive the plausible stored
 * forms of a requested slug and 301 to whichever article we find. Only the exact lookup runs on
 * the happy path; the fallbacks cost at most two more queries, and only on a would-be 404.
 */

// Prefix matching on a very short slug would sweep in unrelated articles, so require enough
// of the title to be present for the match to mean something.
const MIN_PREFIX_LENGTH = 12

// PostgREST reads `%`, `_` and `*` as wildcards inside ilike patterns.
function escapeLikeLiteral(value: string): string {
  return value.replace(/[\\%_*]/g, m => `\\${m}`)
}

/**
 * The stored forms a requested slug could plausibly have, most faithful first.
 */
export function slugCandidates(requested: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []

  const add = (value: string) => {
    const cleaned = value
      .replace(/\.html?$/i, '')  // Jekyll permalinks carried a file extension
      .replace(/-+/g, '-')       // "president--message" collapses under slugify()
      .replace(/^-+|-+$/g, '')   // a truncated title can leave a dangling hyphen
      .toLowerCase()
    if (!cleaned || seen.has(cleaned)) return
    seen.add(cleaned)
    out.push(cleaned)
  }

  const base = requested.replace(/\.html?$/i, '').toLowerCase()

  add(base)
  // How slugify() writes accented letters today: fold to the ASCII base letter.
  add(foldToAscii(base).replace(/[^\w\s-]/g, ''))
  // How slugify() wrote them before folding landed: drop them entirely.
  add(base.replace(/[^\w\s-]/g, ''))

  return out
}

type Options = {
  /** Columns to select. Defaults to the whole row. */
  select?: string
}

export type ResolvedArticle = {
  article: Article
  /** The canonical `/articles/…` path for the row that matched. */
  canonical: string
  /** True when the requested path is not already the canonical one. */
  shouldRedirect: boolean
}

/**
 * Finds the article a `/articles/**` request refers to, tolerating the legacy slug drift
 * described above. Returns null only when nothing plausibly matches.
 */
export async function resolveArticleBySlug(
  supabase: SupabaseClient,
  slugParts: string[],
  { select = '*' }: Options = {},
): Promise<ResolvedArticle | null> {
  const joined = slugParts.join('/')
  const bare = slugParts[slugParts.length - 1] ?? ''
  if (!bare) return null

  // Compare against the *full* requested path: a legacy `/articles/2026/04/02/name` must still
  // redirect to `/articles/name` rather than rendering the article at both URLs.
  const requestedPath = `/articles/${joined}`
  const candidates = slugCandidates(bare)

  const found = (article: Article): ResolvedArticle => {
    const canonical = articleHref(article.slug)
    return { article, canonical, shouldRedirect: canonical !== requestedPath }
  }

  // Ranks candidate rows by how little they add to what was requested — the shortest slug is
  // the closest match to a truncated prefix — then by recency to break ties deterministically.
  // `select` is a runtime string, so supabase-js cannot infer the row shape for us.
  const best = (rows: unknown): Article | undefined =>
    ((rows ?? []) as Article[])
      .slice()
      .sort((a, b) =>
        a.slug.length - b.slug.length ||
        Date.parse(b.published_at ?? '') - Date.parse(a.published_at ?? ''),
      )[0]

  // 1. Exact — the requested slug, its accent variants, and the full multi-segment path.
  const exactTargets = [...new Set([...candidates, joined.toLowerCase(), joined])]
  const { data: exact } = await supabase
    .from('articles').select(select).in('slug', exactTargets).limit(5)
  const exactHit = best(exact)
  if (exactHit) return found(exactHit)

  // 2. Date-prefixed storage: `2026/03/04/name` for a request of `/articles/name`.
  const suffixFilter = candidates
    .map(c => `slug.ilike.%/${escapeLikeLiteral(c)}`)
    .join(',')
  const { data: bySuffix } = await supabase
    .from('articles').select(select).or(suffixFilter).limit(5)
  const suffixHit = best(bySuffix)
  if (suffixHit) return found(suffixHit)

  // 3. Truncation and dedupe drift: the requested slug is a prefix of the stored one.
  const prefixable = candidates.filter(c => c.length >= MIN_PREFIX_LENGTH)
  if (prefixable.length === 0) return null

  const prefixFilter = prefixable
    .flatMap(c => {
      const escaped = escapeLikeLiteral(c)
      return [`slug.ilike.${escaped}%`, `slug.ilike.%/${escaped}%`]
    })
    .join(',')
  const { data: byPrefix } = await supabase
    .from('articles').select(select).or(prefixFilter).limit(10)
  const prefixHit = best(byPrefix)
  if (prefixHit) return found(prefixHit)

  return null
}
