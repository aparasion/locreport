-- Email-only digest subscriptions (no reader accounts).
-- All access goes through the service-role client; RLS stays locked down.

create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'unsubscribed')),
  -- Signal ids from lib/signals.ts (signals are code, no FK possible);
  -- empty array means "all signals".
  signal_prefs text[] not null default '{}',
  min_impact int not null default 1 check (min_impact between 1 and 5),
  frequency text not null default 'weekly' check (frequency in ('weekly', 'daily')),
  confirm_token uuid not null default gen_random_uuid(),
  manage_token uuid not null default gen_random_uuid(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  last_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index subscribers_status_idx on subscribers (status);

-- Audit trail + idempotency record for digest sends.
create table digest_sends (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  article_ids uuid[] not null,
  resend_id text,
  sent_at timestamptz not null default now()
);

create index digest_sends_subscriber_idx on digest_sends (subscriber_id, sent_at desc);

-- Enable RLS with no policies: only the service role can touch these tables.
alter table subscribers enable row level security;
alter table digest_sends enable row level security;
