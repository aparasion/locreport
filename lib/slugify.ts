import { SupabaseClient } from '@supabase/supabase-js'

// Latin letters that survive NFKD intact because they are not composed of a base
// letter plus a combining mark. Without these they'd be deleted outright below.
const ASCII_FALLBACKS: Record<string, string> = {
  ß: 'ss', æ: 'ae', œ: 'oe', ø: 'o', đ: 'd', ð: 'd',
  þ: 'th', ł: 'l', ħ: 'h', ı: 'i', ŧ: 't', ŉ: 'n',
}

// Rewrites accented letters to their ASCII base ("māori" → "maori", "lönnrot" → "lonnrot").
// slugify() strips anything outside [A-Za-z0-9_\s-], so without this step accented letters
// are deleted rather than transliterated and the slug reads "mori" / "lnnrot".
export function foldToAscii(text: string): string {
  return text
    .normalize('NFKD')                // "ā" → "a" + combining macron
    .replace(/[\u0300-\u036f]/g, '') // drop the combining marks
    .replace(/[ßæœøđðþłħıŧŉ]/g, c => ASCII_FALLBACKS[c] ?? c)
}

export function slugify(text: string): string {
  return foldToAscii(text.toLowerCase())
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')   // the 80-char cut can land mid-word: don't keep a dangling hyphen
}

export async function uniqueSlug(
  base: string,
  table: 'articles' | 'drafts',
  supabase: SupabaseClient,
): Promise<string> {
  const { data } = await supabase
    .from(table)
    .select('slug')
    .like('slug', `${base}%`)

  const existing = new Set((data ?? []).map((r: { slug: string }) => r.slug))

  if (!existing.has(base)) return base

  let n = 2
  while (existing.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}
