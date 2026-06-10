create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  organizer   text not null default '',
  start_date  text not null,
  end_date    text not null default '',
  location    text not null default '',
  format      text not null default 'in-person' check (format in ('in-person', 'online', 'hybrid')),
  category    text not null default 'conference' check (category in ('conference', 'summit')),
  url         text not null default '',
  description text not null default '',
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now()
);

alter table public.events enable row level security;

-- Allow authenticated users (admin) to manage events
create policy "admin can manage events"
  on public.events for all
  using (auth.role() = 'authenticated');

-- Allow public read
create policy "public can read events"
  on public.events for select
  using (true);
