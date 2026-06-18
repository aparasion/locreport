-- ============================================================
-- LocReport Events Migration
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Step 1: Add slug column (skip if already done)
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Step 2: Fix the existing event that got a UUID slug
UPDATE events
SET slug = 'atc-gold-conference'
WHERE id = 'f44b2fe9-dd06-46ea-875d-d2bd9e6bfe14';

-- Step 3: Migrate all static events into the database
-- ON CONFLICT (slug) DO NOTHING makes this safe to re-run
INSERT INTO events (name, organizer, start_date, end_date, location, format, category, url, description, tags, slug)
VALUES
  (
    'SlatorCon London',
    'Slator',
    '2026-05-22',
    '2026-05-22',
    'London',
    'in-person',
    'conference',
    'https://slator.com/event/slatorcon-london-2026/',
    'SlatorCon London 2026 brings together industry executives, founders, investors, and buyers to share actionable insights on the future of language AI. Focused one-day event covering language industry trends, Voice AI, media localization, key buy-side perspectives, emerging startups, and latest research.',
    ARRAY['Slator', 'SlatorCon', 'London'],
    'slatorcon-london'
  ),
  (
    'International Search Summit New York',
    'TransPerfect Digital',
    '2026-06-09',
    '2026-06-09',
    'New York City, USA',
    'in-person',
    'summit',
    'https://www.transperfectdigital.com/events/international-search-summit-new-york/',
    'Single-track summit dedicated to scaling websites and campaigns across multiple markets. Covers AI impact across channels, international SEO and SEM strategies, and tactics for driving revenue from global campaigns.',
    ARRAY['ISS', 'international SEO', 'SEM', 'global marketing'],
    'international-search-summit-new-york'
  ),
  (
    'LocWorld55',
    'LocWorld',
    '2026-06-09',
    '2026-06-11',
    'Dublin, Ireland',
    'in-person',
    'conference',
    'https://locworld.com/events/locworld55-dublin-2026/',
    'LocWorld55 Dublin centers on transforming AI capabilities into culturally relevant, trusted human experiences. Explores agentic orchestration, data design, and global business growth, equipping professionals with strategic tools to balance rapid automation with human judgment.',
    ARRAY['LocWorld55'],
    'locworld55'
  ),
  (
    'EAMT 2026',
    'European Association for Machine Translation',
    '2026-06-15',
    '2026-06-18',
    'Tilburg, Netherlands',
    'in-person',
    'conference',
    'https://eamt2026.org/',
    'The 26th Annual EAMT Conference brings together researchers, developers, practitioners, and language industry professionals to share cutting-edge advancements in machine translation, translation memories, and language technology.',
    ARRAY['EAMT2026'],
    'eamt-2026'
  ),
  (
    'ACL 2026',
    'Association for Computational Linguistics',
    '2026-07-02',
    '2026-07-07',
    'Vienna, Austria',
    'in-person',
    'conference',
    'https://2026.aclweb.org/',
    'The 64th Annual Meeting of the ACL — the world''s premier NLP conference. Key venue for MT research, multilingual models, and language generation advances directly relevant to localization.',
    ARRAY['ACL2026', 'computational linguistics', 'NLP'],
    'acl-2026'
  ),
  (
    'SlatorCon San Francisco',
    'Slator',
    '2026-09-03',
    '2026-09-03',
    'San Francisco, USA',
    'in-person',
    'conference',
    'https://slator.com/event/slatorcon-san-francisco-2026/',
    'SlatorCon San Francisco 2026 at the St. Regis Hotel. High-impact presentations on language AI, voice AI, data-for-AI, media localization, and the evolving landscape of language AI investment.',
    ARRAY['SlatorCon', 'Slator'],
    'slatorcon'
  ),
  (
    'World Summit AI Amsterdam',
    'Gavagai',
    '2026-10-07',
    '2026-10-08',
    'Amsterdam, Netherlands',
    'in-person',
    'summit',
    'https://worldsummit.ai/',
    'One of Europe''s largest AI executive summits. Relevant to language services as AI lab executives, enterprise AI buyers, and policymakers converge to debate multilingual model capabilities and AI governance.',
    ARRAY['World Summit AI', 'AI industry'],
    'world-summit-ai-amsterdam'
  ),
  (
    'LocWorld56',
    'LocWorld',
    '2026-10-19',
    '2026-10-21',
    'Vancouver, Canada',
    'in-person',
    'conference',
    'https://locworld.com/events/locworld56-vancouver-2026/',
    'LocWorld56 Vancouver under the theme "From Chaos to Order." Conference sessions, focused tracks, networking events, and Solutions Square exhibition for localization professionals.',
    ARRAY['LocWorld56', 'LW56'],
    'locworld56'
  ),
  (
    'EMNLP 2026',
    'ACL Special Interest Group on Linguistic Data',
    '2026-10-24',
    '2026-10-29',
    'TBA',
    'in-person',
    'conference',
    'https://2026.emnlp.org/',
    'EMNLP is one of the most influential NLP venues, with strong focus on data-driven MT quality, multilingual models, and low-resource language processing directly relevant to production MT systems.',
    ARRAY['EMNLP2026', 'NLP', 'machine translation research'],
    'emnlp-2026'
  ),
  (
    'ATA67',
    'American Translators Association',
    '2026-10-28',
    '2026-10-31',
    'San Francisco, California, USA',
    'in-person',
    'conference',
    'https://www.atanet.org/ata67/',
    'ATA''s 67th Annual Conference at the Hyatt Regency San Francisco. North America''s premier professional development event for language service providers, drawing ~1,000 translation and interpreting professionals.',
    ARRAY['ATA67', 'ATA'],
    'ata67'
  ),
  (
    'NeurIPS 2026',
    'Neural Information Processing Systems Foundation',
    '2026-12-06',
    '2026-12-12',
    'Vancouver, Canada',
    'in-person',
    'conference',
    'https://neurips.cc/',
    'The world''s leading ML research conference. NeurIPS advances in LLMs, multilingual representation, and AI scaling directly determine the future of AI-powered translation.',
    ARRAY['NeurIPS2026', 'AI research', 'language models'],
    'neurips-2026'
  )
ON CONFLICT (slug) DO NOTHING;
