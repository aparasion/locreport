import { Article } from '@/lib/types'

// Editorial topic buckets derived from signal tags plus title/excerpt keywords.
// Used both to badge articles and to build the server-side topic filter.
export const TOPIC_DEFS: Record<string, { label: string; signals: string[]; keywords: string[] }> = {
  quality: {
    label: 'Quality',
    signals: ['quality-gap-closure', 'measurable-quality-evaluation'],
    keywords: ['mqm', 'mtpe', 'post-edit', 'linguistic quality', 'quality assurance', 'quality evaluation', 'lqa'],
  },
  operations: {
    label: 'Operations',
    signals: ['localization-operating-system', 'translation-memory-obsolescence', 'agentic-localization-workflows', 'multimodal-content-localization'],
    keywords: ['translation memory', 'tms', 'cat tool', 'localization platform', 'dubbing', 'subtitl', 'agentic', 'ai agent'],
  },
  governance: {
    label: 'Governance',
    signals: ['governance-in-ai-workflows', 'regulatory-fragmentation'],
    keywords: ['eu ai act', 'ai regulation', 'compliance requirement', 'language law', 'ai governance', 'guardrail'],
  },
  market: {
    label: 'Market',
    signals: ['human-post-editing-contraction'],
    keywords: ['freelance translator', 'translator demand', 'post-editor', 'language services market', 'translation rates'],
  },
  strategy: {
    label: 'Strategy',
    signals: ['localization-first-content-design'],
    keywords: ['internationalization', 'i18n', 'locale-aware', 'transcreation', 'localization-first'],
  },
}

export const TOPIC_IDS = Object.keys(TOPIC_DEFS)

export function getTopics(article: Pick<Article, 'title' | 'excerpt' | 'signal_ids'>): string[] {
  const signalIds = (article.signal_ids ?? []).map(s => s.toLowerCase())
  const text = `${article.title} ${article.excerpt ?? ''}`.toLowerCase()
  return TOPIC_IDS.filter(id => {
    const def = TOPIC_DEFS[id]
    return def.signals.some(s => signalIds.includes(s)) || def.keywords.some(k => text.includes(k))
  })
}

// PostgREST `or=` filter matching the same topic definition server-side.
// Values are hardcoded above, never user input.
export function topicOrFilter(topic: string): string {
  const def = TOPIC_DEFS[topic]
  const parts = [
    `signal_ids.ov.{${def.signals.join(',')}}`,
    ...def.keywords.flatMap(k => [`title.ilike."%${k}%"`, `excerpt.ilike."%${k}%"`]),
  ]
  return parts.join(',')
}
