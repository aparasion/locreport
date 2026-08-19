-- ---------------------------------------------------------------------------
-- Tech Directory — add Iyuno (https://iyuno.com)
--
-- Run in the Supabase SQL Editor (or `psql`) against the project that holds the
-- `public.directory` table created by
-- supabase/migrations/20260626_create_directory.sql.
--
-- Idempotent: re-running updates the existing row instead of erroring on the
-- unique `slug` constraint. Text is dollar-quoted ($t$…$t$) so apostrophes in
-- the copy need no escaping.
-- ---------------------------------------------------------------------------

insert into public.directory (
  name,
  slug,
  category,
  website,
  description,
  long_description,
  founded,
  hq,
  address,
  type,
  tags,
  logo_url
)
values (
  $t$Iyuno$t$,
  $t$iyuno$t$,
  $t$av-localization$t$,
  $t$https://iyuno.com$t$,
  $t$World's largest dedicated media localization group — dubbing, subtitling, access services, and post-production in 100+ languages.$t$,
  $t$Iyuno is the largest dedicated media localization company in the world, delivering dubbing, subtitling, access services, and creative post-production for the major Hollywood studios, global streaming platforms, and broadcasters. The group was founded in Seoul in 2002 by David Lee as a subtitling business and scaled through consolidation: a 2019 merger with BTI Studios, then the 2021 acquisition of SDI Media from Japan's Imagica Group, which created Iyuno-SDI Group before the combined business rebranded simply as Iyuno in October 2022. That roll-up assembled one of the industry's largest owned studio networks — roughly 45 offices and recording facilities across some 30 countries, servicing more than 100 languages — alongside media engineering capabilities spanning mastering, audio, encoding, quality control, and digital packaging and distribution. Iyuno reported USD 394.8 million in 2024 revenue, placing it seventh in the Nimdzi 100 and making it the highest-ranked pure media localization specialist on that list. The company is backed by SoftBank Vision Fund 2, which invested USD 160 million in 2021, alongside Altor, Shamrock Capital, and SoftBank Ventures Asia, and was valued at roughly USD 1.2 billion in a subsequent IMM Investment round. Its global headquarters moved in 2024 to a purpose-built 52,000 square foot facility on West Alameda Avenue in Burbank, with Dolby Atmos mixing stages and recording suites serving the Western Hemisphere. In March 2026 Iyuno announced CLOE, a contextual intelligence platform that captures story context into a persistent memory graph reusable across subtitling, dubbing, script adaptation, and marketing assets; the company detailed CLOE's multi-agent architecture in August 2026, positioning it as an AI-enabled layer over workflows that keep human linguists and voice talent central.$t$,
  2002,
  $t$Burbank, USA$t$,
  $t$2901 W Alameda Ave, Suite 100, Burbank, CA 91505, USA$t$,
  $t$LSP / Studio$t$,
  array['av-localization', 'lsp']::text[],
  null
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
  tags             = excluded.tags,
  logo_url         = excluded.logo_url;

-- Verify
select slug, name, category, type, founded, hq, tags
from public.directory
where slug = 'iyuno';
