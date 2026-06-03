/**
 * One-time migration: Jekyll _posts/*.md → Supabase articles table.
 *
 * Run:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     npx ts-node --skip-project scripts/migrate-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import matter from 'gray-matter'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const POSTS_DIR = path.resolve(process.cwd(), '_posts')
const BATCH_SIZE = 50

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log(`Connecting to: ${SUPABASE_URL}`)
console.log(`Key prefix: ${SUPABASE_SERVICE_KEY.slice(0, 20)}...`)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Verify connection before migrating
async function testConnection() {
  const { count, error } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
  if (error) {
    console.error('Connection test FAILED:', error.message)
    process.exit(1)
  }
  console.log(`Connection OK. Current articles count: ${count}`)
}

function filenameToSlug(filename: string): string {
  // e.g. "2026-06-03-some-article-title.md"
  // → "2026/06/03/some-article-title"
  const base = path.basename(filename, '.md')
  const match = base.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/)
  if (!match) return base
  const [, year, month, day, slug] = match
  return `${year}/${month}/${day}/${slug}`
}

function parseBusinessImplications(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String)
  return []
}

async function main() {
  await testConnection()

  const files = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()

  console.log(`Found ${files.length} posts to migrate.`)

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE)
    const rows = []

    for (const file of batch) {
      try {
        const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')
        // Deduplicate repeated front-matter keys (e.g. redirect_from appearing twice)
        const deduped = raw.replace(
          /^(---\n)([\s\S]*?)(---)/m,
          (_match, open, body, close) => {
            const seen = new Set<string>()
            const lines = body.split('\n').filter((line: string) => {
              const key = line.match(/^[a-zA-Z_]+:/)?.[0]
              if (!key) return true
              if (seen.has(key)) return false
              seen.add(key)
              return true
            })
            return open + lines.join('\n') + close
          }
        )
        const { data: fm, content } = matter(deduped)

        const slug = filenameToSlug(file)

        rows.push({
          title: String(fm.title ?? ''),
          slug,
          excerpt: fm.excerpt ? String(fm.excerpt) : null,
          content: content.trim(),
          article_type: fm.article_type ?? fm.categories?.includes?.('monthly-summary')
            ? 'monthly-summary'
            : fm.article_type === 'theory' ? 'theory' : 'industry',
          author: fm.author ? String(fm.author) : null,
          publisher: fm.publisher ? String(fm.publisher) : null,
          source_url: fm.source_url ? String(fm.source_url) : null,
          signal_ids: Array.isArray(fm.signal_ids) ? fm.signal_ids.map(String) : [],
          signal_stance: fm.signal_stance ? String(fm.signal_stance) : null,
          signal_confidence: fm.signal_confidence ? String(fm.signal_confidence) : null,
          impact_score: fm.impact_score ? Number(fm.impact_score) : null,
          time_horizon: fm.time_horizon ? String(fm.time_horizon) : null,
          affected_segments: Array.isArray(fm.affected_segments)
            ? fm.affected_segments.map(String)
            : [],
          business_implications: parseBusinessImplications(fm.business_implications),
          tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
          published_at: fm.date
            ? new Date(fm.date as string).toISOString()
            : new Date().toISOString(),
          draft_id: null,
        })
      } catch (err) {
        console.error(`Error parsing ${file}:`, err)
        errors++
      }
    }

    if (rows.length === 0) continue

    const { error } = await supabase
      .from('articles')
      .upsert(rows, { onConflict: 'slug', ignoreDuplicates: true })

    if (error) {
      console.error(`\nBatch ${Math.floor(i / BATCH_SIZE) + 1} FAILED: ${error.message}`)
      console.error(`  (code: ${error.code}, hint: ${error.hint ?? 'none'})`)
      errors += rows.length
    } else {
      inserted += rows.length
      process.stdout.write(`\rMigrated ${Math.min(i + BATCH_SIZE, files.length)}/${files.length}`)
    }
  }

  console.log(`\n\nDone.`)
  console.log(`  Inserted/skipped: ${inserted}`)
  console.log(`  Errors:           ${errors}`)

  // Final verification
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
  console.log(`  DB count now:     ${count}`)

  if (errors > 0) process.exit(1)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
