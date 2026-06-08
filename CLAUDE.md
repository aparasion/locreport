# LocReport — AI Development Guide

> **For AI engines only.** This file is the authoritative structural reference for AI agents working on this codebase. It is blocked from web crawlers via `robots.txt`. Start here before reading any source file.

---

## What This Is

**LocReport** is a Next.js 15 (App Router) content intelligence platform for the language services industry. It ingests RSS feeds daily, uses OpenAI to generate draft articles, routes them through an admin approval workflow, and publishes them with impact scoring and signal tagging.

**Live domain:** `https://locreport.com`
**Repository:** `aparasion/locreport`
**Deployment:** Vercel (auto-deploy from main)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.3.3, App Router, TypeScript 5 strict |
| Styling | TailwindCSS 4 + PostCSS, custom CSS vars (`assets/css/style.css`) |
| Database | Supabase (PostgreSQL) — SSR + browser clients |
| AI | OpenAI GPT (content generation, classification) |
| Market data | Yahoo Finance 2 (LocStock tickers) |
| Email | Resend (contact form) |
| Analytics | Google Analytics 4 (G-1KQKEEP1PL) |
| Deployment | Vercel with cron jobs |

---

## Repository Layout

```
app/
  (auth)/login/          — Supabase email/password login
  (public)/              — All public-facing pages (see Route Map below)
  api/                   — API routes (REST + cron handlers)
  layout.tsx             — Root layout: global metadata, GA4 scripts
  globals.css            — Tailwind imports

components/
  ui/                    — Primitive UI components (Button, Card, Input, Badge, etc.)
  Nav.tsx                — Site header with dropdown nav + search + theme toggle
  AdminNav.tsx           — Admin section sidebar
  ArticleCard.tsx        — Article preview card used across listing pages
  ArticleEditor.tsx      — Markdown editor (admin only)
  DraftCard.tsx          — Draft management card
  ShareButton.tsx        — Social share button on article pages
  ReadingProgress.tsx    — Scroll progress indicator

lib/
  supabase/server.ts     — SSR Supabase client (use in Server Components/API routes)
  supabase/client.ts     — Browser Supabase client (use in Client Components)
  types.ts               — Core TypeScript types: Article, Draft, RssSource
  signals.ts             — 14 hardcoded industry signals + SIGNAL_MAP (id → signal)
  openai.ts              — OpenAI client singleton
  prompts.ts             — LLM system prompts (also editable in DB settings table)
  classify.ts            — Article type classification logic
  rss.ts                 — RSS parsing utilities
  slugify.ts             — URL-safe slug generation
  utils.ts               — articleHref(), extractTeaser(), cn() (Tailwind merge)
  data/
    events.ts            — 2026 industry calendar (hardcoded)
    directory.ts         — 100+ localization tech companies/tools (hardcoded)
    llm-pricing.ts       — LLM provider pricing data (hardcoded)

assets/
  css/style.css          — Design system: emerald/ink palette, Fraunces + Inter fonts
  data/market_quotes.json — Cached ticker prices for LocStock (updated by cron)

public/                  — Static assets (favicon, OG image, logos)
vercel.json              — Build config, cron schedules, 301 redirects
```

---

## Route Map

### Public Routes (`app/(public)/`)

| Path | File | Notes |
|---|---|---|
| `/` | `page.tsx` | Hero + featured articles + sidebar |
| `/articles` | `articles/page.tsx` | All articles, filterable by topic |
| `/articles/[slug]` | `articles/[...slug]/page.tsx` | Article detail, 24h ISR revalidation |
| `/intelligence` | `intelligence/page.tsx` | Signals dashboard + stats |
| `/intelligence/signals` | `intelligence/signals/page.tsx` | All 14 active signals |
| `/intelligence/signals/[id]` | `intelligence/signals/[id]/page.tsx` | Signal detail + linked articles |
| `/intelligence/high-impact` | `intelligence/high-impact/page.tsx` | Articles with impact score ≥ 4 |
| `/reports` | `reports/page.tsx` | Reports hub (annual + monthly) |
| `/reports/2026-annual-global-market-report` | `reports/2026-annual.../page.tsx` | Hardcoded static annual report |
| `/reports/monthly` | `reports/monthly/page.tsx` | Dynamic monthly reports from DB |
| `/compass` | `compass/page.tsx` | Tools hub overview |
| `/compass/locstock` | `compass/locstock/page.tsx` | 34-ticker market index + Recharts |
| `/compass/events` | `compass/events/page.tsx` | 2026 industry events calendar |
| `/compass/llm-pricing` | `compass/llm-pricing/page.tsx` | Interactive LLM pricing simulator |
| `/compass/directory` | `compass/directory/page.tsx` | 100+ tech companies directory |
| `/language-science` | `language-science/page.tsx` | Research papers + academic content |
| `/search` | `search/page.tsx` | Full-text search (`?q=...`) |
| `/about` | `about/page.tsx` | About page |
| `/contact` | `contact/page.tsx` | Contact form (uses Resend) |
| `/privacy` | `privacy/page.tsx` | Privacy policy |
| `/terms` | `terms/page.tsx` | Terms of service |

### Admin Routes (`app/(public)/admin/`) — Auth-gated

| Path | Purpose |
|---|---|
| `/admin` | Dashboard: stats, manual ingest trigger, monthly report |
| `/admin/articles` | Article list management |
| `/admin/articles/[id]` | Edit individual article |
| `/admin/drafts` | Draft review queue (pending/approved/rejected) |
| `/admin/drafts/[id]` | Edit/approve/reject individual draft |
| `/admin/compose` | Manually write a new article |
| `/admin/prompts` | Edit LLM system prompts stored in DB |
| `/admin/sources` | Manage RSS feed sources |

### API Routes (`app/api/`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/ingest` | GET/POST | RSS fetch → draft creation (daily cron at 10:30 UTC) |
| `/api/market-quotes` | POST | Fetch + cache ticker prices to market_quotes.json |
| `/api/monthly-report` | POST | Generate monthly synthesis via OpenAI |
| `/api/drafts` | GET/POST | List/create drafts |
| `/api/drafts/[id]` | GET/PUT/DELETE | Draft CRUD |
| `/api/drafts/[id]/rerun` | POST | Regenerate draft via LLM |
| `/api/articles` | POST | Create article from markdown |
| `/api/articles/[id]` | GET/PUT/DELETE | Article CRUD |
| `/api/compose` | POST | Publish manually-composed article |
| `/api/contact` | POST | Contact form → Resend email |
| `/api/me` | GET | Current user + admin status |
| `/api/settings` | GET/POST | App settings (prompts, admin prefs) |
| `/api/sources` | GET/POST | RSS source management |
| `/api/sources/[id]` | PUT/DELETE | Single RSS source |
| `/api/stats` | GET | Dashboard stats: article/draft/source counts |
| `/api/seen-urls` | GET | Legacy Jekyll URLs (deduplication) |

---

## Database Schema (Supabase)

### `articles`
```
id uuid PK
title text
slug text UNIQUE
excerpt text
content text (markdown)
article_type 'industry' | 'theory' | 'monthly-summary'
author text
publisher text
source_url text
signal_ids uuid[]
signal_stance text
signal_confidence text
impact_score int (1–5)
time_horizon 'now' | '6months' | 'long-term'
affected_segments text[]
business_implications text[]
tags text[]
published_at timestamptz
updated_at timestamptz
draft_id uuid FK → drafts.id
```

### `drafts`
```
id uuid PK
title text
slug text
content text
source_url text
source_feed_id uuid FK → rss_sources.id
source_published_at timestamptz
status 'pending' | 'approved' | 'rejected' | 'rerunning' | 'rerun'
created_at timestamptz
updated_at timestamptz
```

### `rss_sources`
```
id uuid PK
url text
name text
active boolean
created_at timestamptz
```

### `settings`
```
key text PK
value text
```
Stores: `DEFAULT_INDUSTRY_PROMPT`, `DEFAULT_EXTRACTOR_PROMPT`, admin preferences.

### `seen_urls`
```
url text PK
```
Populated from legacy Jekyll migration to prevent re-ingesting old content.

---

## Content Pipeline

```
1. INGEST (daily cron, 10:30 UTC)
   /api/ingest
   → Fetch active RSS sources from DB
   → Deduplicate against seen_urls
   → For each new item: fetch full text via DEFAULT_EXTRACTOR_PROMPT (OpenAI)
   → Extract metadata via DEFAULT_INDUSTRY_PROMPT (OpenAI):
       title, excerpt, signal_ids, impact_score, time_horizon,
       affected_segments, business_implications, tags
   → Insert draft with status='pending'

2. ADMIN REVIEW
   /admin/drafts
   → Admin reads draft, edits if needed
   → Approve → status='approved' → triggers article creation
   → Reject → status='rejected'
   → Rerun → calls /api/drafts/[id]/rerun → status='rerunning' → OpenAI regenerates

3. PUBLISH
   Approved draft → article record created with all signal/impact metadata
   Article appears on public site immediately (ISR revalidation handles caching)

4. MONTHLY REPORT (1st of month cron OR manual trigger)
   /api/monthly-report
   → Fetches all articles from previous month
   → Sends to OpenAI for synthesis
   → Creates article with article_type='monthly-summary'
```

---

## Signals System

Signals are the intelligence layer — 14 hardcoded trend signals in `lib/signals.ts`.

Each signal has:
- `id`, `name`, `category`, `status`, `momentum`
- Categories: `quality`, `operations`, `governance`, `market`, `strategy`
- Status: `supported`, `emerging`, `disputed`
- Momentum: `rising`, `stable`, `declining`

`SIGNAL_MAP` (Map<id, signal>) is used across the codebase to resolve signal IDs to signal objects. Articles can be tagged with multiple `signal_ids`.

To add a new signal: edit `lib/signals.ts`. No DB migration needed — signals are pure code.

---

## Design System

**Design tokens** are in `assets/css/style.css` as CSS variables:

```
--color-emerald-*    Primary brand (emerald green tones)
--color-ink-*        Text/dark tones
--color-pearl-*      Background/light tones
--color-gold-*       Accent tones
--font-display       Fraunces (serif, Google Fonts)
--font-body          Inter (sans-serif, Google Fonts)
--site-max-width     1200px
--page-gutter        Responsive padding (1rem mobile → 2rem desktop)
```

**Theme:** `data-theme="dark"` on `<html>` activates dark mode via CSS variable overrides.

**TailwindCSS 4:** Configured through PostCSS. Custom CSS vars integrate with Tailwind utility classes.

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL      — Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key (public)
SUPABASE_SERVICE_ROLE_KEY     — Supabase service role key (server-only, never expose)
OPENAI_API_KEY                — OpenAI API key
RESEND_API_KEY                — Resend email service key
CRON_SECRET                   — Secret to authenticate Vercel cron requests
```

---

## Key Patterns & Conventions

### Supabase client selection
- **Server Components / API routes:** `import { createClient } from '@/lib/supabase/server'` → `await createClient()`
- **Client Components:** `import { createBrowserClient } from '@/lib/supabase/client'`
- **Admin operations needing service role:** use `createServiceClient()` from `server.ts`

### Metadata
- Root defaults in `app/layout.tsx`
- Each page/section exports `generateMetadata()` or a static `metadata` object
- Articles: title = `${a.title} — LocReport`, description = `a.excerpt`
- `metadataBase` is set to `https://locreport.com` globally

### ISR Revalidation
- Article detail pages: `export const revalidate = 86400` (24h)
- Listing pages: `export const revalidate = 3600` (1h)

### Path alias
- `@/` maps to repo root (set in `tsconfig.json`)

### Slug handling
- Legacy Jekyll slugs may contain path segments (year/month/day/slug)
- `articles/[...slug]/page.tsx` handles both flat slugs and legacy multi-segment slugs
- `articleHref()` in `lib/utils.ts` always generates the canonical clean URL

### Admin auth
- Supabase email/password session
- `app/(public)/admin/layout.tsx` checks session and redirects to `/login` if unauthenticated
- Admin status determined by `api/me` checking Supabase user metadata

---

## Cron Jobs (vercel.json)

| Schedule | Endpoint | Purpose |
|---|---|---|
| `30 10 * * *` (10:30 UTC daily) | `/api/ingest` | Fetch RSS → create drafts |

Monthly report is triggered manually from admin dashboard OR can be added as a cron on the 1st.

---

## SEO Infrastructure

- **Metadata API:** Next.js 13+ metadata exports on every public page
- **OG image:** `/public/og-image.jpg` (1200×630)
- **Sitemap:** `app/sitemap.ts` → `/sitemap.xml` (dynamic, includes all published articles)
- **Robots:** `app/robots.ts` → `/robots.txt` (blocks crawlers from admin, api, CLAUDE.md)
- **301 Redirects:** `vercel.json` preserves SEO from legacy Jekyll URLs
- **GA4:** G-1KQKEEP1PL, loaded via `next/script` with `afterInteractive` strategy
- **Canonical URLs:** via `metadataBase: https://locreport.com`

---

## Common Tasks for AI Agents

### Add a new public page
1. Create `app/(public)/your-page/page.tsx`
2. Export `metadata` or `generateMetadata()` with title + description
3. Add link to `components/Nav.tsx` if it should appear in navigation

### Add a new API endpoint
1. Create `app/api/your-endpoint/route.ts`
2. Export named HTTP method handlers (`GET`, `POST`, etc.)
3. Use `createClient()` from `@/lib/supabase/server` for DB access

### Add a new signal
1. Edit `lib/signals.ts` — add to the `SIGNALS` array and update `SIGNAL_MAP`
2. No DB changes needed

### Modify LLM prompts
- Runtime editing: `/admin/prompts` UI → stored in `settings` table
- Code default: `lib/prompts.ts` → `DEFAULT_INDUSTRY_PROMPT` / `DEFAULT_EXTRACTOR_PROMPT`

### Change the design system
- Color/typography tokens: `assets/css/style.css`
- Component primitives: `components/ui/`
- Do NOT modify TailwindCSS config directly — use CSS variables

### Update static data (events, directory, LLM pricing)
- `lib/data/events.ts`, `lib/data/directory.ts`, `lib/data/llm-pricing.ts`
- These are hardcoded TypeScript arrays — edit the file directly

---

## What NOT To Do

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Do not add `use client` to pages that can be Server Components — prefer server-side data fetching
- Do not bypass the draft approval workflow by inserting directly to `articles` table from the ingest pipeline
- Do not hardcode the OpenAI model string — check `lib/openai.ts` for the current model reference
- Do not add new cron jobs without updating `vercel.json`
