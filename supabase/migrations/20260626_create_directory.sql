create table if not exists public.directory (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  category      text not null,
  website       text not null default '',
  description   text not null default '',
  long_description text not null default '',
  founded       int not null default 0,
  hq            text not null default '',
  address       text not null default '',
  type          text not null default '',
  tags          text[] not null default '{}',
  logo_url      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.directory enable row level security;

-- Allow authenticated users (admin) to manage directory entries
create policy "admin can manage directory"
  on public.directory for all
  using (auth.role() = 'authenticated');

-- Allow public read
create policy "public can read directory"
  on public.directory for select
  using (true);

-- Trigger to keep updated_at current
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger directory_updated_at
  before update on public.directory
  for each row execute function public.set_updated_at();
