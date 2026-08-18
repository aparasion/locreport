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
    modelId: 'gpt-5-5',
    snapshots: [
      { date: '2026-07-01', input: 5.0,  output: 30.0 },
    ],
  },
  {
    modelId: 'gpt-5-mini',
    snapshots: [
      { date: '2025-08-07', input: 0.25, output: 2.0  },
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
    modelId: 'claude-opus-5',
    snapshots: [
      { date: '2026-07-24', input: 5.0,  output: 25.0 },
    ],
  },
  {
    modelId: 'claude-fable-5',
    snapshots: [
      { date: '2026-06-15', input: 10.0, output: 50.0 },
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
    modelId: 'gemini-3-pro',
    snapshots: [
      { date: '2026-02-15', input: 2.0,  output: 12.0 },
    ],
  },
  {
    modelId: 'llama-3-3-70b',
    snapshots: [
      { date: '2024-12-06', input: 0.1,  output: 0.32 },
    ],
  },
  {
    modelId: 'llama-4-maverick',
    snapshots: [
      { date: '2025-04-05', input: 0.15, output: 0.60 },
    ],
  },
  {
    modelId: 'deepseek-v3-2',
    snapshots: [
      { date: '2024-12-26', input: 0.27, output: 1.1  },
      { date: '2025-12-01', input: 0.21, output: 0.31 },
    ],
  },
  {
    modelId: 'deepseek-r1',
    snapshots: [
      { date: '2025-01-20', input: 0.7,  output: 2.5  },
    ],
  },
  {
    modelId: 'kimi-k2-6',
    snapshots: [
      { date: '2026-05-01', input: 0.57, output: 3.33 },
    ],
  },
  {
    modelId: 'kimi-k3',
    snapshots: [
      { date: '2026-07-16', input: 2.6,  output: 13.0 },
    ],
  },
  {
    modelId: 'grok-4-5',
    snapshots: [
      { date: '2026-07-08', input: 2.0,  output: 6.0  },
    ],
  },
  {
    modelId: 'qwen3-8-max',
    snapshots: [
      { date: '2026-08-03', input: 2.0,  output: 6.0  },
    ],
  },
  {
    modelId: 'mistral-large-3',
    snapshots: [
      { date: '2025-12-02', input: 0.5,  output: 1.5  },
    ],
  },
]

// Fallback current pricing, used when llm_pricing_quotes has no row for a model yet.
export const LLM_MODELS: LLMModel[] = [
  // OpenAI
  { id: 'gpt-4o',            name: 'GPT-4o',            provider: 'OpenAI',        input: 2.5,  output: 10.0,  context: 128000,  notes: 'Strong multilingual coverage; now a lower-cost alternative to the GPT-5 line', openrouterId: 'openai/gpt-4o' },
  { id: 'gpt-4o-mini',       name: 'GPT-4o mini',       provider: 'OpenAI',        input: 0.15, output: 0.6,   context: 128000,  notes: 'Cost-effective for high-volume, simpler language pairs', openrouterId: 'openai/gpt-4o-mini' },
  { id: 'gpt-4-1',           name: 'GPT-4.1',           provider: 'OpenAI',        input: 2.0,  output: 8.0,   context: 1000000, notes: '1M context window at a lower price than GPT-5.5; suited for long documents', openrouterId: 'openai/gpt-4.1' },
  { id: 'gpt-4-1-mini',      name: 'GPT-4.1 mini',      provider: 'OpenAI',        input: 0.4,  output: 1.6,   context: 1000000, notes: 'Budget option with large context; good for batch workloads', openrouterId: 'openai/gpt-4.1-mini' },
  { id: 'gpt-5-5',           name: 'GPT-5.5',           provider: 'OpenAI',        input: 5.0,  output: 30.0,  context: 1050000, notes: 'Current flagship; frontier reasoning for complex, high-stakes language pairs', openrouterId: 'openai/gpt-5.5' },
  { id: 'gpt-5-mini',        name: 'GPT-5 mini',        provider: 'OpenAI',        input: 0.25, output: 2.0,   context: 400000,  notes: 'Current-gen budget tier; strong quality-to-cost ratio for high-volume batches', openrouterId: 'openai/gpt-5-mini' },

  // Anthropic
  { id: 'claude-sonnet-5',   name: 'Claude Sonnet 5',   provider: 'Anthropic',     input: 2.0,  output: 10.0,  context: 1000000, notes: 'Agentic, near-Opus quality at lower cost; strong nuanced translation', openrouterId: 'anthropic/claude-sonnet-5' },
  { id: 'claude-haiku-4-5',  name: 'Claude Haiku 4.5',  provider: 'Anthropic',     input: 1.0,  output: 5.0,   context: 200000,  notes: 'Fast and efficient for bulk translation workloads', openrouterId: 'anthropic/claude-haiku-4.5' },
  { id: 'claude-opus-5',     name: 'Claude Opus 5',     provider: 'Anthropic',     input: 5.0,  output: 25.0,  context: 1000000, notes: 'Premium quality; best for specialised or literary translation', openrouterId: 'anthropic/claude-opus-5' },
  { id: 'claude-fable-5',    name: 'Claude Fable 5',    provider: 'Anthropic',     input: 10.0, output: 50.0,  context: 1000000, notes: "Anthropic's top-tier model; reserved for the most demanding review and QA work", openrouterId: 'anthropic/claude-fable-5' },

  // Google
  { id: 'gemini-3-5-flash',  name: 'Gemini 3.5 Flash',  provider: 'Google',        input: 1.5,  output: 9.0,   context: 1048576, notes: 'Google’s fastest current agentic model with broad language support', openrouterId: 'google/gemini-3.5-flash' },
  { id: 'gemini-2-5-pro',    name: 'Gemini 2.5 Pro',    provider: 'Google',        input: 1.25, output: 10.0,  context: 1048576, notes: 'Previous-generation Pro model; still capable, priced below the Gemini 3 line', openrouterId: 'google/gemini-2.5-pro' },
  { id: 'gemini-3-pro',      name: 'Gemini 3 Pro',      provider: 'Google',        input: 2.0,  output: 12.0,  context: 1048576, notes: 'Flagship reasoning model; pricing rises for prompts beyond 200K tokens', openrouterId: 'google/gemini-3-pro' },

  // Meta
  { id: 'llama-3-3-70b',     name: 'Llama 3.3 70B',     provider: 'Meta (via API)', input: 0.1, output: 0.32,  context: 128000,  notes: 'Open-weight model, competitive on European languages', openrouterId: 'meta-llama/llama-3.3-70b-instruct' },
  { id: 'llama-4-maverick',  name: 'Llama 4 Maverick',  provider: 'Meta (via API)', input: 0.15, output: 0.6,  context: 1048576, notes: 'Open-weight multimodal MoE; strong throughput for large-scale batch localization', openrouterId: 'meta-llama/llama-4-maverick' },

  // DeepSeek
  { id: 'deepseek-v3-2',     name: 'DeepSeek V3.2',     provider: 'DeepSeek',      input: 0.21, output: 0.31,  context: 163840,  notes: 'Strong on CJK and technical content at very low cost', openrouterId: 'deepseek/deepseek-v3.2' },
  { id: 'deepseek-r1',       name: 'DeepSeek R1',       provider: 'DeepSeek',      input: 0.7,  output: 2.5,   context: 128000,  notes: 'Reasoning model; useful for complex or ambiguous text', openrouterId: 'deepseek/deepseek-r1' },

  // Moonshot AI (China)
  { id: 'kimi-k2-6',         name: 'Kimi K2.6',         provider: 'Moonshot AI',   input: 0.57, output: 3.33,  context: 262144,  notes: 'Cost-efficient Chinese model; strong CJK fluency and technical-content handling', openrouterId: 'moonshotai/kimi-k2.6' },
  { id: 'kimi-k3',           name: 'Kimi K3',           provider: 'Moonshot AI',   input: 2.6,  output: 13.0,  context: 1048576, notes: "Moonshot AI's flagship reasoning model; frontier-class quality with deep CJK fluency", openrouterId: 'moonshotai/kimi-k3' },

  // xAI
  { id: 'grok-4-5',          name: 'Grok 4.5',          provider: 'xAI',           input: 2.0,  output: 6.0,   context: 500000,  notes: 'Frontier reasoning model with real-time, web-grounded knowledge', openrouterId: 'x-ai/grok-4.5' },

  // Alibaba (China)
  { id: 'qwen3-8-max',       name: 'Qwen3.8 Max',       provider: 'Alibaba',       input: 2.0,  output: 6.0,   context: 1000000, notes: "Alibaba's flagship model; excellent coverage of Chinese and Southeast Asian pairs", openrouterId: 'qwen/qwen3.8-max' },

  // Mistral AI
  { id: 'mistral-large-3',   name: 'Mistral Large 3',   provider: 'Mistral AI',    input: 0.5,  output: 1.5,   context: 262144,  notes: 'European open-weight flagship; competitively priced for EU-language pairs', openrouterId: 'mistralai/mistral-large-2512' },
]
