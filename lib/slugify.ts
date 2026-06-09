import { SupabaseClient } from '@supabase/supabase-js'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
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
