import { OpenAI } from 'openai'
import { SIGNALS } from './signals'

const SIGNAL_LIST = SIGNALS.map(s => `- ${s.id}: ${s.title}`).join('\n')

const CLASSIFIER_SYSTEM_PROMPT = `You are an editorial classifier for LocReport, a localization industry intelligence platform.

Given an article, output a JSON object with exactly these three fields:

{
  "impact_score": <integer 1–5>,
  "time_horizon": <"now" | "6months" | "2years">,
  "signal_ids": <array of 0–3 signal IDs from the list below>
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
"2years" = Long-term — structural shift playing out over 1–3 years

AVAILABLE SIGNALS (pick 0–3 that best match the article):
${SIGNAL_LIST}

Output ONLY valid JSON. No explanation, no markdown fences.`

export async function classifyArticle(openai: OpenAI, content: string): Promise<{
  impact_score: number | null
  time_horizon: string | null
  signal_ids: string[]
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
      time_horizon: ['now', '6months', '2years'].includes(parsed.time_horizon)
        ? parsed.time_horizon
        : null,
      signal_ids: Array.isArray(parsed.signal_ids)
        ? parsed.signal_ids.filter((id: unknown) => typeof id === 'string' && validSignalIds.has(id))
        : [],
    }
  } catch {
    return { impact_score: null, time_horizon: null, signal_ids: [] }
  }
}
