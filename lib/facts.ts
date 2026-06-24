export type FactCategory = 'entity' | 'datapoint' | 'milestone' | 'quote'

export interface ParsedFact {
  content: string
  category: FactCategory
}

export interface Fact {
  id: string
  content: string
  category: FactCategory
  source_url: string | null
  source_name: string | null
  draft_id: string | null
  article_id: string | null
  created_at: string
}

const SECTION_MAP: { pattern: RegExp; category: FactCategory }[] = [
  { pattern: /HARD ENTITIES|ENTITIES/i, category: 'entity' },
  { pattern: /DATAPOINTS|STATS/i, category: 'datapoint' },
  { pattern: /CHRONOLOGICAL|MILESTONES/i, category: 'milestone' },
  { pattern: /QUOTES|CLAIMS/i, category: 'quote' },
]

export function parseFacts(raw: string): ParsedFact[] {
  const facts: ParsedFact[] = []
  let currentCategory: FactCategory = 'entity'

  for (const line of raw.split('\n')) {
    const trimmed = line.trim()

    const sectionMatch = SECTION_MAP.find(s => s.pattern.test(trimmed))
    if (sectionMatch) {
      currentCategory = sectionMatch.category
      continue
    }

    if (trimmed.startsWith('- ')) {
      const content = trimmed.slice(2).trim()
      if (content.length > 10) {
        facts.push({ content, category: currentCategory })
      }
    }
  }

  return facts
}

export const CATEGORY_LABELS: Record<FactCategory, string> = {
  entity: 'Entity',
  datapoint: 'Data',
  milestone: 'Milestone',
  quote: 'Quote',
}

export function parseDistilledFacts(raw: string): string[] {
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => /^\d+\./.test(l))
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(l => l.length > 10)
    .slice(0, 3)
}
