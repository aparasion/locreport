-- ---------------------------------------------------------------------------
-- Tech Directory — add Ollang (https://ollang.com) to public.directory
--
-- Paste into the Supabase SQL Editor and Run. Safe to run more than once.
--
-- Purely additive. Every statement either creates something that is missing or
-- inserts the one Ollang row. Nothing is dropped, replaced or overwritten:
--   * the table, its RLS flag, its policies and its updated_at trigger are each
--     created only when absent, so an existing setup is left exactly as it is;
--   * set_updated_at() is created only if no function of that name exists — it
--     is a shared, generically named helper, so this never replaces a version
--     another table may depend on;
--   * the insert is ON CONFLICT DO NOTHING, so re-running cannot revert edits
--     you have since made to Ollang in /admin/directory.
--
-- To overwrite the row from lib/data/directory.ts instead of preserving edits,
-- remove the existing Ollang row first, then run this again.
--
-- ORDER MATTERS. Run this only once the merge-directory fix is deployed. Before
-- that fix, the site returns the directory table whenever it holds any rows at
-- all, so this one row would hide the other 105 companies and the listing would
-- render Ollang alone. After it, static entries and table rows merge by slug and
-- a single row is safe.
-- ---------------------------------------------------------------------------

-- 1. Table — created only when missing --------------------------------------
create table if not exists public.directory (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  category         text not null,
  website          text not null default '',
  description      text not null default '',
  long_description text not null default '',
  founded          int not null default 0,
  hq               text not null default '',
  address          text not null default '',
  type             text not null default '',
  tags             text[] not null default '{}',
  logo_url         text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 2. RLS, policies, trigger — each created only when absent ------------------
do $guard$
begin
  -- Row level security: skip if already enabled.
  if not exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'directory' and c.relrowsecurity
  ) then
    execute 'alter table public.directory enable row level security';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'directory'
      and policyname = 'admin can manage directory'
  ) then
    create policy "admin can manage directory"
      on public.directory for all
      using (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'directory'
      and policyname = 'public can read directory'
  ) then
    create policy "public can read directory"
      on public.directory for select
      using (true);
  end if;

  -- Shared helper: create only if nothing of this name exists, never replace.
  if to_regprocedure('public.set_updated_at()') is null then
    create function public.set_updated_at()
    returns trigger language plpgsql as $fn$
    begin
      new.updated_at = now();
      return new;
    end;
    $fn$;
  end if;

  if not exists (
    select 1 from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'directory'
      and t.tgname = 'directory_updated_at' and not t.tgisinternal
  ) then
    create trigger directory_updated_at
      before update on public.directory
      for each row execute function public.set_updated_at();
  end if;
end
$guard$;

-- 3. The Ollang row — inserted only if the slug is not already present -------
insert into public.directory (
  name, slug, category, website, description, long_description,
  founded, hq, address, type, tags, logo_url
)
values (
  $t$Ollang$t$,
  $t$ollang$t$,
  $t$av-localization$t$,
  $t$https://ollang.com$t$,
  $t$Hybrid AI-and-human media localization platform for dubbing, subtitling, and captioning at streaming scale.$t$,
  $t$Ollang is a media localization company built around hybrid dubbing — pairing AI voice synthesis and automated workflow steps with professional studio dubbing artists and human reviewers rather than choosing between them. Founded in 2019 by Ebru Yıldırım and Muhammed Aziz Ulak, Delaware-incorporated with deep Turkish roots, it serves TV channels, production houses, streaming platforms, e-learning providers, and content creators localizing video and audio at volume. Its OLabs platform combines multi-agent AI pipelines and APIs with a distributed network of more than 2,000 translators across 75 countries, covering AI and studio dubbing, subtitling, closed captioning, and document localization in 60+ languages. Backed by a USD 1.5m seed round in 2023, it runs offices across France, South Korea, Turkey, Dubai, and Jakarta, the last from acquiring Southeast Asian subtitling and dubbing provider TUJJU Media. The company has since repositioned around Ollang DX, an AI language execution layer that exposes localization to engineering teams through an SDK, API, MCP server, and reusable agent skills.$t$,
  2019,
  $t$Wilmington, USA$t$,
  $t$1401 Pennsylvania Ave, Unit 105, Wilmington, DE 19806, USA$t$,
  $t$SaaS / Studio$t$,
  array['av-localization', 'ai', 'api']::text[],
  null
)
on conflict (slug) do nothing;

-- 4. Verify ------------------------------------------------------------------
select id, slug, name, category, type, founded, hq, tags
from public.directory
where slug = $t$ollang$t$;
