export interface LLMModel {
  id: string
  name: string
  provider: string
  input: number
  output: number
  context: number
  notes: string
  // Model id on openrouter.ai/api/v1/models — used to auto-refresh pricing.
  openrouterId: string
}

export interface PriceSnapshot {
  date: string  // ISO date string YYYY-MM-DD
  input: number // $ per 1M tokens
  output: number
}

export interface ModelPriceHistory {
  modelId: string
  snapshots: PriceSnapshot[]
}

// Seed/fallback historical pricing snapshots, used when the llm_pricing_history
// table (auto-refreshed by /api/llm-pricing) is empty or unreachable.
export const LLM_PRICE_HISTORY: ModelPriceHistory[] = [
  {
    modelId: 'gpt-4o',
    snapshots: [
      { date: '2024-05-13', input: 5.0,  output: 15.0 },
      { date: '2024-10-01', input: 2.5,  output: 10.0 },
    ],
  },
  {
    modelId: 'gpt-4o-mini',
    snapshots: [
      { date: '2024-07-18', input: 0.15, output: 0.60 },
    ],
  },
  {
    modelId: 'gpt-4-1',
    snapshots: [
      { date: '2025-04-14', input: 2.0,  output: 8.0  },
    ],
  },
  {
    modelId: 'gpt-4-1-mini',
    snapshots: [
      { date: '2025-04-14', input: 0.4,  output: 1.6  },
    ],
  },
  {
    modelId: 'claude-sonnet-5',
    snapshots: [
      { date: '2026-06-30', input: 2.0,  output: 10.0 },
    ],
  },
  {
    modelId: 'claude-haiku-4-5',
    snapshots: [
      { date: '2025-10-15', input: 1.0,  output: 5.0  },
    ],
  },
  {
    modelId: 'claude-opus-4-8',
    snapshots: [
      { date: '2026-05-28', input: 5.0,  output: 25.0 },
    ],
  },
  {
    modelId: 'gemini-3-5-flash',
    snapshots: [
      { date: '2026-05-19', input: 1.5,  output: 9.0  },
    ],
  },
  {
    modelId: 'gemini-2-5-pro',
    snapshots: [
      { date: '2025-06-17', input: 1.25, output: 10.0 },
    ],
  },
  {
    modelId: 'llama-3-3-70b',
    snapshots: [
      { date: '2024-12-06', input: 0.1,  output: 0.32 },
    ],
  },
  {
    modelId: 'deepseek-v3',
    snapshots: [
      { date: '2024-12-26', input: 0.27, output: 1.1  },
    ],
  },
  {
    modelId: 'deepseek-r1',
    snapshots: [
      { date: '2025-01-20', input: 0.7,  output: 2.5  },
    ],
  },
]

// Fallback current pricing, used when llm_pricing_quotes has no row for a model yet.
export const LLM_MODELS: LLMModel[] = [
  { id: 'gpt-4o',            name: 'GPT-4o',            provider: 'OpenAI',        input: 2.5,  output: 10.0,  context: 128000,  notes: 'Strong multilingual coverage, best for complex language pairs', openrouterId: 'openai/gpt-4o' },
  { id: 'gpt-4o-mini',       name: 'GPT-4o mini',       provider: 'OpenAI',        input: 0.15, output: 0.6,   context: 128000,  notes: 'Cost-effective for high-volume, simpler language pairs', openrouterId: 'openai/gpt-4o-mini' },
  { id: 'gpt-4-1',           name: 'GPT-4.1',           provider: 'OpenAI',        input: 2.0,  output: 8.0,   context: 1000000, notes: '1M context window, suited for long-document translation', openrouterId: 'openai/gpt-4.1' },
  { id: 'gpt-4-1-mini',      name: 'GPT-4.1 mini',      provider: 'OpenAI',        input: 0.4,  output: 1.6,   context: 1000000, notes: 'Budget option with large context; good for batch workloads', openrouterId: 'openai/gpt-4.1-mini' },
  { id: 'claude-sonnet-5',   name: 'Claude Sonnet 5',   provider: 'Anthropic',     input: 2.0,  output: 10.0,  context: 1000000, notes: 'Agentic, near-Opus quality at lower cost; strong nuanced translation', openrouterId: 'anthropic/claude-sonnet-5' },
  { id: 'claude-haiku-4-5',  name: 'Claude Haiku 4.5',  provider: 'Anthropic',     input: 1.0,  output: 5.0,   context: 200000,  notes: 'Fast and efficient for bulk translation workloads', openrouterId: 'anthropic/claude-haiku-4.5' },
  { id: 'claude-opus-4-8',   name: 'Claude Opus 4.8',   provider: 'Anthropic',     input: 5.0,  output: 25.0,  context: 1000000, notes: 'Premium quality; best for specialised or literary translation', openrouterId: 'anthropic/claude-opus-4.8' },
  { id: 'gemini-3-5-flash',  name: 'Gemini 3.5 Flash',  provider: 'Google',        input: 1.5,  output: 9.0,   context: 1048576, notes: 'Google’s fastest current agentic model with broad language support', openrouterId: 'google/gemini-3.5-flash' },
  { id: 'gemini-2-5-pro',    name: 'Gemini 2.5 Pro',    provider: 'Google',        input: 1.25, output: 10.0,  context: 1048576, notes: 'Largest context window for very long documents', openrouterId: 'google/gemini-2.5-pro' },
  { id: 'llama-3-3-70b',     name: 'Llama 3.3 70B',     provider: 'Meta (via API)', input: 0.1, output: 0.32,  context: 128000,  notes: 'Open-weight model, competitive on European languages', openrouterId: 'meta-llama/llama-3.3-70b-instruct' },
  { id: 'deepseek-v3',       name: 'DeepSeek V3',       provider: 'DeepSeek',      input: 0.27, output: 1.1,   context: 128000,  notes: 'Strong on CJK and technical content at low cost', openrouterId: 'deepseek/deepseek-chat' },
  { id: 'deepseek-r1',       name: 'DeepSeek R1',       provider: 'DeepSeek',      input: 0.7,  output: 2.5,   context: 128000,  notes: 'Reasoning model; useful for complex or ambiguous text', openrouterId: 'deepseek/deepseek-r1' },
]
