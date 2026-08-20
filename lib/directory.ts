import type { SupabaseClient } from '@supabase/supabase-js'
import { DIRECTORY, type DirectoryEntry } from '@/lib/data/directory'

// The directory has two layers: the curated array in lib/data/directory.ts and
// the Supabase `directory` table that /admin/directory writes to.
//
// These merge rather than replace. A row in the table overrides the static
// entry with the same slug, and rows with no static counterpart are appended,
// so a table holding a single edited entry still renders the full directory.
// (Replacing was the old behaviour: one row in the table hid every static
// entry, which made editing a single company collapse the listing to one.)
//
// Consequence worth knowing: deleting a row that also exists statically only
// drops the override — the static definition renders again. Removing a curated
// entry for good means editing lib/data/directory.ts.
export function mergeDirectory(rows: DirectoryEntry[] | null | undefined): DirectoryEntry[] {
  const bySlug = new Map(DIRECTORY.map(e => [e.slug, e]))
  for (const row of rows ?? []) {
    if (row?.slug) bySlug.set(row.slug, row)
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name))
}

// Reads the override table and merges it over the static array. Any failure
// (missing table, RLS, network) falls back to the static array alone.
export async function fetchDirectoryEntries(supabase: SupabaseClient): Promise<DirectoryEntry[]> {
  try {
    const { data, error } = await supabase.from('directory').select('*')
    if (!error) return mergeDirectory(data as DirectoryEntry[] | null)
  } catch {}
  return mergeDirectory(null)
}
