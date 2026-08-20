-- Adds the Ollang tech directory entry (mirrors lib/data/directory.ts).
-- Idempotent: re-running refreshes the row instead of erroring on the unique slug.

insert into public.directory
  (name, slug, category, website, description, long_description, founded, hq, address, type, tags)
values (
  'Ollang',
  'ollang',
  'av-localization',
  'https://ollang.com',
  'Hybrid AI-and-human media localization platform for dubbing, subtitling, and captioning at streaming scale.',
  'Ollang is a media localization company built around hybrid dubbing — pairing AI voice synthesis and automated workflow steps with professional studio dubbing artists and human reviewers rather than choosing between them. Founded in 2019 by Ebru Yıldırım and Muhammed Aziz Ulak, Delaware-incorporated with deep Turkish roots, it serves TV channels, production houses, streaming platforms, e-learning providers, and content creators localizing video and audio at volume. Its OLabs platform combines multi-agent AI pipelines and APIs with a distributed network of more than 2,000 translators across 75 countries, covering AI and studio dubbing, subtitling, closed captioning, and document localization in 60+ languages. Backed by a USD 1.5m seed round in 2023, it runs offices across France, South Korea, Turkey, Dubai, and Jakarta, the last from acquiring Southeast Asian subtitling and dubbing provider TUJJU Media. The company has since repositioned around Ollang DX, an AI language execution layer that exposes localization to engineering teams through an SDK, API, MCP server, and reusable agent skills.',
  2019,
  'Wilmington, USA',
  '1401 Pennsylvania Ave, Unit 105, Wilmington, DE 19806, USA',
  'SaaS / Studio',
  array['av-localization', 'ai', 'api']::text[]
)
on conflict (slug) do update set
  name             = excluded.name,
  category         = excluded.category,
  website          = excluded.website,
  description      = excluded.description,
  long_description = excluded.long_description,
  founded          = excluded.founded,
  hq               = excluded.hq,
  address          = excluded.address,
  type             = excluded.type,
  tags             = excluded.tags;
