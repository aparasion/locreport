import { createClient } from '@/lib/supabase/server'
import { Article } from '@/lib/types'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import AllArticlesClient, { ArticleRow } from '../all-articles/AllArticlesClient'

export const metadata: Metadata = {
  title: 'All Articles — LocReport',
  description: 'Browse all localization industry articles by topic — quality, operations, governance, market dynamics, and strategy.',
}

export const revalidate = 3600

const QUALITY_SIGNALS = ['quality-gap-closure', 'measurable-quality-evaluation']
const QUALITY_KEYWORDS = ['mqm', 'mtpe', 'post-edit', 'linguistic quality', 'quality assurance', 'quality evaluation', 'lqa']
const OPS_SIGNALS = ['localization-operating-system', 'translation-memory-obsolescence', 'agentic-localization-workflows', 'multimodal-content-localization']
const OPS_KEYWORDS = ['translation memory', 'tms', 'cat tool', 'localization platform', 'dubbing', 'subtitl', 'agentic', 'ai agent']
const GOV_SIGNALS = ['governance-in-ai-workflows', 'regulatory-fragmentation']
const GOV_KEYWORDS = ['eu ai act', 'ai regulation', 'compliance requirement', 'language law', 'ai governance', 'guardrail']
const MARKET_SIGNALS = ['human-post-editing-contraction']
const MARKET_KEYWORDS = ['freelance translator', 'translator demand', 'post-editor', 'language services market', 'translation rates']
const STRATEGY_SIGNALS = ['localization-first-content-design']
const STRATEGY_KEYWORDS = ['internationalization', 'i18n', 'locale-aware', 'transcreation', 'localization-first']

function getTopics(article: Article): string[] {
  const signalIds = (article.signal_ids ?? []).map(s => s.toLowerCase())
  const text = `${article.title} ${article.excerpt ?? ''}`.toLowerCase()
  const topics: string[] = []
  const matches = (signals: string[], keywords: string[]) =>
    signals.some(s => signalIds.includes(s)) || keywords.some(k => text.includes(k))
  if (matches(QUALITY_SIGNALS, QUALITY_KEYWORDS)) topics.push('quality')
  if (matches(OPS_SIGNALS, OPS_KEYWORDS)) topics.push('operations')
  if (matches(GOV_SIGNALS, GOV_KEYWORDS)) topics.push('governance')
  if (matches(MARKET_SIGNALS, MARKET_KEYWORDS)) topics.push('market')
  if (matches(STRATEGY_SIGNALS, STRATEGY_KEYWORDS)) topics.push('strategy')
  return topics
}

export default async function ArticlesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, publisher, impact_score, signal_ids, published_at')
    .neq('article_type', 'theory')
    .order('published_at', { ascending: false })

  const rows: ArticleRow[] = ((data as Article[]) ?? []).map(a => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    publisher: a.publisher,
    impact_score: a.impact_score,
    published_at: a.published_at,
    topics: getTopics(a),
  }))

  return <Suspense><AllArticlesClient articles={rows} /></Suspense>
}
