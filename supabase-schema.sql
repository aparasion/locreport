-- LocReport Supabase Schema
-- Run this in your Supabase SQL Editor before first deploy.

-- ─────────────────────────────────────────────
-- rss_sources
-- ─────────────────────────────────────────────
create table if not exists public.rss_sources (
  id         uuid primary key default gen_random_uuid(),
  url        text not null unique,
  name       text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- drafts
-- ─────────────────────────────────────────────
create table if not exists public.drafts (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text not null unique,
  content        text not null,
  source_url     text,
  source_feed_id uuid references public.rss_sources(id) on delete set null,
  status         text not null default 'pending'
                   check (status in ('pending','approved','rejected')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- articles
-- ─────────────────────────────────────────────
create table if not exists public.articles (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  slug                  text not null unique,
  excerpt               text,
  content               text not null,
  article_type          text not null default 'industry'
                          check (article_type in ('industry','theory','monthly-summary')),
  author                text,
  publisher             text,
  source_url            text,
  signal_ids            text[]    not null default '{}',
  signal_stance         text,
  signal_confidence     text,
  impact_score          integer,
  time_horizon          text,
  relevance_score       integer,
  research_domain       text,
  affected_segments     text[]    not null default '{}',
  business_implications jsonb     not null default '[]',
  tags                  text[]    not null default '{}',
  published_at          timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  draft_id              uuid references public.drafts(id) on delete set null
);

-- ─────────────────────────────────────────────
-- updated_at triggers
-- ─────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger drafts_set_updated_at
  before update on public.drafts
  for each row execute function public.set_updated_at();

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────
alter table public.articles    enable row level security;
alter table public.drafts      enable row level security;
alter table public.rss_sources enable row level security;

-- Articles: public read
create policy "public read articles"
  on public.articles for select
  to anon, authenticated
  using (true);

-- Drafts and sources: no public policy — API routes use service role key
