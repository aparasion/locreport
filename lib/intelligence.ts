import type { SupabaseClient } from '@supabase/supabase-js'
import { SIGNALS } from '@/lib/signals'

export interface SignalWeekPoint {
  week: string // ISO Monday, YYYY-MM-DD
  count: number
}

export interface SignalSeries {
  signalId: string
  weekly: SignalWeekPoint[]
  total: number
  // "Coverage momentum": trailing 8 weeks vs the prior 8, derived purely from
  // article volume — distinct from the curated editorial momentum in lib/signals.ts.
  observedMomentum: 'rising' | 'stable' | 'declining'
  recentCount: number
  priorCount: number
}

export interface MonthlyRow {
  month: string // YYYY-MM
  [signalId: string]: string | number
}

export interface ImpactBucket {
  impact: number
  label: string
  recent: number // trailing 90 days
  prior: number // the 90 days before that
}

const IMPACT_LABEL: Record<number, string> = { 1: 'Routine', 2: 'Notable', 3: 'Significant', 4: 'Major', 5: 'Disruptive' }

// Compact display names for chart panels/strips where the full signal titles
// (from lib/signals.ts) don't fit.
export const SIGNAL_SHORT_LABEL: Record<string, string> = {
  'quality-gap-closure': 'Quality gap closure',
  'governance-in-ai-workflows': 'AI workflow governance',
  'localization-operating-system': 'Localization OS',
  'measurable-quality-evaluation': 'Quality evaluation',
  'translation-memory-obsolescence': 'TM obsolescence',
  'human-post-editing-contraction': 'MTPE contraction',
  'agentic-localization-workflows': 'Agentic workflows',
  'multimodal-content-localization': 'Multimodal localization',
  'regulatory-fragmentation': 'Regulatory fragmentation',
  'localization-first-content-design': 'Localization-first design',
  'multilingual-llm-gap': 'Multilingual LLM gap',
  'ai-company-language-strategy': 'AI language strategy',
  'lsp-relevance-erosion': 'LSP relevance erosion',
}

export function signalShortLabel(id: string): string {
  return SIGNAL_SHORT_LABEL[id] ?? id.replace(/-/g, ' ')
}

function isoWeekMonday(d: Date): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() - day + 1)
  return date.toISOString().slice(0, 10)
}

function weekMondays(weeks: number, end = new Date()): string[] {
  const mondays: string[] = []
  const cursor = new Date(isoWeekMonday(end) + 'T00:00:00Z')
  for (let i = 0; i < weeks; i++) {
    mondays.unshift(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() - 7)
  }
  return mondays
}

/** Bucket a list of publish dates into the trailing N ISO weeks. */
export function weeklySeries(dates: string[], weeks = 16): SignalWeekPoint[] {
  const mondays = weekMondays(weeks)
  const counts = new Map<string, number>()
  for (const iso of dates) {
    const week = isoWeekMonday(new Date(iso))
    counts.set(week, (counts.get(week) ?? 0) + 1)
  }
  return mondays.map(week => ({ week, count: counts.get(week) ?? 0 }))
}

export function computeMomentum(recentCount: number, priorCount: number): 'rising' | 'stable' | 'declining' {
  // Too little data to call a direction
  if (recentCount + priorCount < 4) return 'stable'
  if (recentCount >= priorCount * 1.25) return 'rising'
  if (recentCount <= priorCount * 0.75) return 'declining'
  return 'stable'
}

export interface IntelligenceData {
  signalSeries: SignalSeries[]
  monthlyRows: MonthlyRow[]
  topSignalIds: string[]
  impactBuckets: ImpactBucket[]
}

/**
 * One light query over articles (signal_ids, impact_score, published_at for the
 * trailing 12 months), bucketed into everything the dashboard needs.
 */
export async function getIntelligenceData(supabase: SupabaseClient): Promise<IntelligenceData> {
  const now = new Date()
  const cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

  const { data: articles } = await supabase
    .from('articles')
    .select('signal_ids, impact_score, published_at')
    .eq('article_type', 'industry')
    .gte('published_at', cutoff.toISOString())

  const rows = articles ?? []

  // Weekly buckets per signal (16 weeks for sparklines + momentum)
  const mondays = weekMondays(16, now)
  const mondaySet = new Set(mondays)
  const weeklyBySignal = new Map<string, Map<string, number>>()
  for (const s of SIGNALS) weeklyBySignal.set(s.id, new Map())

  // Monthly buckets per signal (12 months for the momentum chart)
  const months: string[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    months.push(d.toISOString().slice(0, 7))
  }
  const monthSet = new Set(months)
  const monthlyBySignal = new Map<string, Map<string, number>>()
  for (const s of SIGNALS) monthlyBySignal.set(s.id, new Map())

  const totals = new Map<string, number>()

  // Impact distribution: trailing 90 days vs the 90 before
  const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const d180 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
  const impactRecent = new Map<number, number>()
  const impactPrior = new Map<number, number>()

  for (const a of rows) {
    const published = new Date(a.published_at)
    const week = isoWeekMonday(published)
    const month = a.published_at.slice(0, 7)

    for (const sid of a.signal_ids ?? []) {
      if (!weeklyBySignal.has(sid)) continue
      totals.set(sid, (totals.get(sid) ?? 0) + 1)
      if (mondaySet.has(week)) {
        const m = weeklyBySignal.get(sid)!
        m.set(week, (m.get(week) ?? 0) + 1)
      }
      if (monthSet.has(month)) {
        const m = monthlyBySignal.get(sid)!
        m.set(month, (m.get(month) ?? 0) + 1)
      }
    }

    const impact = a.impact_score
    if (impact != null && impact >= 1 && impact <= 5) {
      if (published >= d90) impactRecent.set(impact, (impactRecent.get(impact) ?? 0) + 1)
      else if (published >= d180) impactPrior.set(impact, (impactPrior.get(impact) ?? 0) + 1)
    }
  }

  const recentWeeks = new Set(mondays.slice(8))
  const priorWeeks = new Set(mondays.slice(0, 8))

  const signalSeries: SignalSeries[] = SIGNALS.map(s => {
    const weeklyMap = weeklyBySignal.get(s.id)!
    const weekly = mondays.map(week => ({ week, count: weeklyMap.get(week) ?? 0 }))
    let recentCount = 0
    let priorCount = 0
    for (const [week, count] of weeklyMap) {
      if (recentWeeks.has(week)) recentCount += count
      else if (priorWeeks.has(week)) priorCount += count
    }
    return {
      signalId: s.id,
      weekly,
      total: totals.get(s.id) ?? 0,
      observedMomentum: computeMomentum(recentCount, priorCount),
      recentCount,
      priorCount,
    }
  })

  const topSignalIds = [...signalSeries]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map(s => s.signalId)

  const monthlyRows: MonthlyRow[] = months.map(month => {
    const row: MonthlyRow = { month }
    for (const sid of topSignalIds) {
      row[sid] = monthlyBySignal.get(sid)!.get(month) ?? 0
    }
    return row
  })

  const impactBuckets: ImpactBucket[] = [1, 2, 3, 4, 5].map(impact => ({
    impact,
    label: IMPACT_LABEL[impact],
    recent: impactRecent.get(impact) ?? 0,
    prior: impactPrior.get(impact) ?? 0,
  }))

  return { signalSeries, monthlyRows, topSignalIds, impactBuckets }
}
