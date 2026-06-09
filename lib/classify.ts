import { OpenAI } from 'openai'
import { SIGNALS } from './signals'

const SIGNAL_LIST = SIGNALS.map(s => `- ${s.id}: ${s.title}`).join('\n')

const VALID_SEGMENTS = ['Enterprise Buyers', 'LSPs', 'Freelancers', 'LangTech Vendors', 'Researchers']

const CLASSIFIER_SYSTEM_PROMPT = `You are an editorial classifier for LocReport, a localization industry intelligence platform.

Given an article, output a JSON object with exactly these five fields:

{
  "impact_score": <integer 1–5>,
  "time_horizon": <"now" | "6months" | "long-term">,
  "signal_ids": <array of 0–3 signal IDs from the list below>,
  "business_implications": <array of 2–4 strings, each under 15 words, stating the practical significance>,
  "affected_segments": <array of 0–3 values from: "Enterprise Buyers", "LSPs", "Freelancers", "LangTech Vendors", "Researchers">
}

IMPACT SCORE GUIDE:
1 = Routine: Minor operational update, niche interest only
2 = Notable: Meaningful development for practitioners
3 = Significant: Clear shift in practice or market position
4 = Major: Industry-wide impact or significant strategic move
5 = Disruptive: Paradigm shift affecting the whole industry

TIME HORIZON GUIDE:
"now" = Immediate relevance — decisions or actions affected today
"6months" = Medium-term — signals a trend maturing in 3–9 months
"long-term" = Structural shift playing out over 1–3 years

BUSINESS IMPLICATIONS: Write 2–4 concise bullet points explaining why this matters to language professionals. Each under 15 words. Be specific, not generic.

AFFECTED SEGMENTS: Choose only from: "Enterprise Buyers", "LSPs", "Freelancers", "LangTech Vendors", "Researchers"

AVAILABLE SIGNALS (pick 0–3 that best match the article):
${SIGNAL_LIST}

Output ONLY valid JSON. No explanation, no markdown fences.`

export async function classifyArticle(openai: OpenAI, content: string): Promise<{
  impact_score: number | null
  time_horizon: string | null
  signal_ids: string[]
  business_implications: string[]
  affected_segments: string[]
}> {
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CLASSIFIER_SYSTEM_PROMPT },
        { role: 'user', content: content.slice(0, 4000) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    })
    const raw = res.choices[0].message.content ?? '{}'
    const parsed = JSON.parse(raw)
    const validSignalIds = new Set(SIGNALS.map(s => s.id))
    return {
      impact_score: typeof parsed.impact_score === 'number'
        ? Math.max(1, Math.min(5, Math.round(parsed.impact_score)))
        : null,
      time_horizon: ['now', '6months', 'long-term'].includes(parsed.time_horizon)
        ? parsed.time_horizon
        : null,
      signal_ids: Array.isArray(parsed.signal_ids)
        ? parsed.signal_ids.filter((id: unknown) => typeof id === 'string' && validSignalIds.has(id))
        : [],
      business_implications: Array.isArray(parsed.business_implications)
        ? parsed.business_implications.filter((s: unknown) => typeof s === 'string').slice(0, 4)
        : [],
      affected_segments: Array.isArray(parsed.affected_segments)
        ? parsed.affected_segments.filter((s: unknown) => typeof s === 'string' && VALID_SEGMENTS.includes(s))
        : [],
    }
  } catch {
    return { impact_score: null, time_horizon: null, signal_ids: [], business_implications: [], affected_segments: [] }
  }
}
