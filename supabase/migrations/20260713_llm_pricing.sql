-- Live LLM pricing cache, refreshed from the OpenRouter public models API
-- (mirrors market_quotes: current snapshot + history, service-role only).

create table llm_pricing_quotes (
  model_id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table llm_pricing_history (
  id uuid primary key default gen_random_uuid(),
  model_id text not null,
  date date not null,
  input numeric not null,
  output numeric not null,
  created_at timestamptz not null default now(),
  unique (model_id, date)
);

create index llm_pricing_history_model_idx on llm_pricing_history (model_id, date);

-- Enable RLS with no policies: only the service role can touch these tables.
alter table llm_pricing_quotes enable row level security;
alter table llm_pricing_history enable row level security;
