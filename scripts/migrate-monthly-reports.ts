/**
 * Migrate monthly report posts to Supabase.
 *
 * Run once with your credentials:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   npx ts-node --skip-project scripts/migrate-monthly-reports.ts
 */

import { createClient } from '@supabase/supabase-js'
import matter from 'gray-matter'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const POSTS_DIR = path.resolve(process.cwd(), '_posts')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function filenameToSlug(filename: string): string {
  const base = path.basename(filename, '.md')
  const match = base.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/)
  if (!match) return base
  const [, year, month, day, slug] = match
  return `${year}/${month}/${day}/${slug}`
}

async function main() {
  const { count, error: connErr } = await supabase
    .from('articles').select('*', { count: 'exact', head: true })
  if (connErr) { console.error('Connection failed:', connErr.message); process.exit(1) }
  console.log(`Connected. Current article count: ${count}`)

  const files = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()

  const monthlyFiles = files.filter(f => {
    try {
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8')
      const { data: fm } = matter(raw)
      return Array.isArray(fm.categories) && fm.categories.includes('monthly-summary')
    } catch { return false }
  })

  console.log(`Found ${monthlyFiles.length} monthly-summary posts:`)
  monthlyFiles.forEach(f => console.log(' ', f))

  for (const file of monthlyFiles) {
    const slug = filenameToSlug(file)

    // Check if already exists
    const { data: existing } = await supabase
      .from('articles').select('id').eq('slug', slug).maybeSingle()
    if (existing) {
      console.log(`SKIP (exists): ${slug}`)
      continue
    }

    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')
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

    const row = {
      title: String(fm.title ?? ''),
      slug,
      excerpt: fm.excerpt ? String(fm.excerpt) : null,
      content: content.trim(),
      article_type: 'monthly-summary',
      author: fm.author ? String(fm.author) : null,
      publisher: fm.publisher ? String(fm.publisher) : null,
      source_url: fm.source_url ? String(fm.source_url) : null,
      signal_ids: Array.isArray(fm.signal_ids) ? fm.signal_ids.map(String) : [],
      signal_stance: fm.signal_stance ? String(fm.signal_stance) : null,
      signal_confidence: fm.signal_confidence ? String(fm.signal_confidence) : null,
      impact_score: fm.impact_score ? Number(fm.impact_score) : null,
      time_horizon: fm.time_horizon ? String(fm.time_horizon) : null,
      affected_segments: Array.isArray(fm.affected_segments) ? fm.affected_segments.map(String) : [],
      business_implications: Array.isArray(fm.business_implications) ? fm.business_implications.map(String) : [],
      tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
      published_at: fm.date ? new Date(fm.date).toISOString() : new Date().toISOString(),
    }

    const { error } = await supabase.from('articles').insert(row)
    if (error) {
      console.error(`ERROR inserting ${slug}:`, error.message)
    } else {
      console.log(`INSERT OK: ${slug}`)
    }
  }

  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
