alter table drafts
  add column if not exists excerpt text,
  add column if not exists ai_impact_score int,
  add column if not exists ai_time_horizon text,
  add column if not exists ai_signal_ids text[];
