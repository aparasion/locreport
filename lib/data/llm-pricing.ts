export interface LLMModel {
  id: string
  name: string
  provider: string
  input: number
  output: number
  context: number
  notes: string
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

// Historical pricing snapshots. Add a new snapshot entry whenever a model's price changes.
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
    modelId: 'claude-3-7-sonnet',
    snapshots: [
      { date: '2025-02-24', input: 3.0,  output: 15.0 },
    ],
  },
  {
    modelId: 'claude-3-5-haiku',
    snapshots: [
      { date: '2024-10-22', input: 1.0,  output: 5.0  },
      { date: '2024-11-05', input: 0.8,  output: 4.0  },
    ],
  },
  {
    modelId: 'claude-3-opus',
    snapshots: [
      { date: '2024-03-04', input: 15.0, output: 75.0 },
    ],
  },
  {
    modelId: 'gemini-2-flash',
    snapshots: [
      { date: '2025-02-05', input: 0.1,  output: 0.4  },
    ],
  },
  {
    modelId: 'gemini-1-5-pro',
    snapshots: [
      { date: '2024-04-09', input: 3.5,  output: 10.5 },
      { date: '2024-05-24', input: 1.25, output: 5.0  },
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

export const LLM_MODELS: LLMModel[] = [
  { id: 'gpt-4o',            name: 'GPT-4o',            provider: 'OpenAI',        input: 2.5,  output: 10.0,  context: 128000,  notes: 'Strong multilingual coverage, best for complex language pairs' },
  { id: 'gpt-4o-mini',       name: 'GPT-4o mini',       provider: 'OpenAI',        input: 0.15, output: 0.6,   context: 128000,  notes: 'Cost-effective for high-volume, simpler language pairs' },
  { id: 'gpt-4-1',           name: 'GPT-4.1',           provider: 'OpenAI',        input: 2.0,  output: 8.0,   context: 1000000, notes: '1M context window, suited for long-document translation' },
  { id: 'gpt-4-1-mini',      name: 'GPT-4.1 mini',      provider: 'OpenAI',        input: 0.4,  output: 1.6,   context: 1000000, notes: 'Budget option with large context; good for batch workloads' },
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic',     input: 3.0,  output: 15.0,  context: 200000,  notes: 'High-quality nuanced translation with extended thinking support' },
  { id: 'claude-3-5-haiku',  name: 'Claude 3.5 Haiku',  provider: 'Anthropic',     input: 0.8,  output: 4.0,   context: 200000,  notes: 'Fast and efficient for bulk translation workloads' },
  { id: 'claude-3-opus',     name: 'Claude 3 Opus',     provider: 'Anthropic',     input: 15.0, output: 75.0,  context: 200000,  notes: 'Premium quality; best for specialised or literary translation' },
  { id: 'gemini-2-flash',    name: 'Gemini 2.0 Flash',  provider: 'Google',        input: 0.1,  output: 0.4,   context: 1000000, notes: 'Lowest cost option with broad language support' },
  { id: 'gemini-1-5-pro',    name: 'Gemini 1.5 Pro',    provider: 'Google',        input: 1.25, output: 5.0,   context: 2000000, notes: 'Largest context window for very long documents' },
  { id: 'llama-3-3-70b',     name: 'Llama 3.3 70B',     provider: 'Meta (via API)', input: 0.1, output: 0.32,  context: 128000,  notes: 'Open-weight model, competitive on European languages' },
  { id: 'deepseek-v3',       name: 'DeepSeek V3',       provider: 'DeepSeek',      input: 0.27, output: 1.1,   context: 128000,  notes: 'Strong on CJK and technical content at low cost' },
  { id: 'deepseek-r1',       name: 'DeepSeek R1',       provider: 'DeepSeek',      input: 0.7,  output: 2.5,   context: 128000,  notes: 'Reasoning model; useful for complex or ambiguous text' },
]
