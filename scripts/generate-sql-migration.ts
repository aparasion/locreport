/**
 * Generates a SQL file with INSERT statements for all Jekyll posts.
 * Run: npx ts-node --skip-project --compiler-options '{"module":"commonjs"}' scripts/generate-sql-migration.ts
 * Then paste the output SQL into Supabase SQL Editor.
 */

import matter from 'gray-matter'
import * as fs from 'fs'
import * as path from 'path'

const POSTS_DIR = path.resolve(process.cwd(), '_posts')
const OUTPUT_FILE = path.resolve(process.cwd(), 'migration.sql')

function filenameToSlug(filename: string): string {
  const base = path.basename(filename, '.md')
  const match = base.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/)
  if (!match) return base
  const [, year, month, day, slug] = match
  return `${year}/${month}/${day}/${slug}`
}

function esc(val: string | null | undefined): string {
  if (val == null) return 'NULL'
  return `'${String(val).replace(/'/g, "''")}'`
}

function escArr(arr: unknown): string {
  if (!Array.isArray(arr) || arr.length === 0) return "ARRAY[]::text[]"
  return `ARRAY[${arr.map(v => `'${String(v).replace(/'/g, "''")}'`).join(',')}]`
}

function escJson(arr: unknown): string {
  if (!Array.isArray(arr) || arr.length === 0) return "'[]'::jsonb"
  try {
    return `'${JSON.stringify(arr).replace(/'/g, "''")}'::jsonb`
  } catch {
    return "'[]'::jsonb"
  }
}

function dedupeFrontMatter(raw: string): string {
  return raw.replace(/^(---\n)([\s\S]*?)\n---/m, (_match, open, body) => {
    const seenKeys = new Set<string>()
    const outputLines: string[] = []
    const lines = body.split('\n')
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      const keyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*/)
      if (keyMatch) {
        const key = keyMatch[1]
        if (seenKeys.has(key)) {
          // Skip this key and its continuation lines
          i++
          while (i < lines.length && lines[i].match(/^\s+/)) i++
          continue
        }
        seenKeys.add(key)
        outputLines.push(line)
      } else {
        outputLines.push(line)
      }
      i++
    }
    return open + outputLines.join('\n') + '\n---'
  })
}

const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort()
console.log(`Processing ${files.length} posts...`)

const lines: string[] = [
  '-- LocReport migration: Jekyll _posts → articles table',
  '-- Generated ' + new Date().toISOString(),
  '-- Paste this entire file into Supabase SQL Editor and click Run.',
  '',
  'INSERT INTO public.articles',
  '  (title, slug, excerpt, content, article_type, author, publisher, source_url,',
  '   signal_ids, signal_stance, signal_confidence, impact_score, time_horizon,',
  '   affected_segments, business_implications, tags, published_at, draft_id)',
  'VALUES',
]

let errors = 0
const rows: string[] = []

for (const file of files) {
  try {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')
    const deduped = dedupeFrontMatter(raw)
    const { data: fm, content } = matter(deduped)

    const slug = filenameToSlug(file)
    const articleType = Array.isArray(fm.categories) && fm.categories.includes('monthly-summary')
      ? 'monthly-summary'
      : fm.article_type === 'theory' ? 'theory' : 'industry'

    const publishedAt = fm.date
      ? new Date(fm.date as string).toISOString()
      : new Date().toISOString()

    rows.push(
      `  (${esc(fm.title)}, ${esc(slug)}, ${esc(fm.excerpt)}, ${esc(content.trim())},` +
      ` ${esc(articleType)}, ${esc(fm.author)}, ${esc(fm.publisher)}, ${esc(fm.source_url)},` +
      ` ${escArr(fm.signal_ids)}, ${esc(fm.signal_stance)}, ${esc(fm.signal_confidence)},` +
      ` ${fm.impact_score ? Number(fm.impact_score) : 'NULL'}, ${esc(fm.time_horizon)},` +
      ` ${escArr(fm.affected_segments)}, ${escJson(fm.business_implications)},` +
      ` ${escArr(fm.tags)}, ${esc(publishedAt)}, NULL)`
    )
  } catch (err) {
    console.error(`Error: ${file}:`, (err as Error).message)
    errors++
  }
}

lines.push(rows.join(',\n'))
lines.push('ON CONFLICT (slug) DO NOTHING;')
lines.push('')
lines.push(`-- Total rows: ${rows.length}, parse errors: ${errors}`)

fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8')
const sizeMb = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(1)
console.log(`\nWrote ${OUTPUT_FILE} (${sizeMb} MB)`)
console.log(`Rows: ${rows.length}, Errors: ${errors}`)
console.log('\nNow paste migration.sql into Supabase SQL Editor and click Run.')
