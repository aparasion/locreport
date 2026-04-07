# CLAUDE.md — LocReport

## Project Overview

LocReport is an AI-assisted news aggregation and analysis platform for the language services industry. It is a Jekyll static site deployed to GitHub Pages, with Python automation scripts that run on schedule via GitHub Actions.

**Live site:** https://locreport.com  
**Primary branch:** `main`

---

## Architecture

| Layer | Technology |
|---|---|
| Static site | Jekyll 4.3 (Ruby 3.3) |
| Templating | Liquid |
| Automation | Python 3.12 |
| Deployment | GitHub Actions → GitHub Pages |
| AI generation | OpenAI API |
| Newsletter | Buttondown API |

### Key Directories

- `_posts/` — 500+ auto-generated daily/weekly posts in Markdown with YAML front matter
- `_data/` — YAML config files: `signals.yml`, `internal_links.yml`, `glossary.yml`
- `_includes/` — Reusable HTML components (header, footer, related articles, etc.)
- `_layouts/` — Jekyll page templates: `default`, `page`, `post`
- `assets/` — CSS and images
- `scripts/` — Python automation scripts (content generation, newsletters, signal tracking)
- `.github/workflows/` — CI/CD workflows (aggregate, monthly reports, newsletter, pages deploy)
- `research/` — Landing page for linguistic/theory research content

---

## Local Development

### Jekyll site

```bash
bundle install
bundle exec jekyll serve          # http://localhost:4000
bundle exec jekyll build --destination _site
```

### Python scripts

```bash
pip install -r requirements.txt
python scripts/generate_gists.py
python scripts/generate_monthly_summary.py
python scripts/send_newsletter.py
python scripts/update_signal_status.py
python scripts/validate_signal_metadata.py
```

Required environment variables for scripts:
- `OPENAI_API_KEY` — AI content generation
- `BUTTONDOWN_API_KEY` — Newsletter delivery

---

## CI/CD Workflows

| Workflow | Trigger | Script |
|---|---|---|
| `aggregate.yml` | Hourly (`:33`) | `generate_gists.py` + `update_signal_status.py` |
| `monthly-reports.yml` | 1st of month 02:15 UTC | `generate_monthly_summary.py` |
| `newsletter.yml` | Fridays 13:00 UTC | `send_newsletter.py` |
| `pages.yml` | Push to `main` | Jekyll build → GH Pages |

All automation workflows auto-commit results back to `main` using a bot identity. They are no-op safe (skip commit if no changes detected).

---

## Post Front Matter Schema

All posts in `_posts/` must include this front matter:

```yaml
---
title: "Article Title"
date: 2026-03-17T09:15:27Z
layout: post
categories: [translation]
tags: [translation, localization, news, gist]
excerpt: "One-line summary."
publisher: "source-domain.com"
source_url: "https://..."
signal_ids: [quality-gap-closure]          # References _data/signals.yml keys
signal_stance: mentions|supports|disputes
signal_confidence: low|medium|high
---
```

Optional extended fields (for research/intelligence posts):

```yaml
article_type: theory|industry
impact_score: 1-5
time_horizon: "now|6months|2years"
business_implications: [list]
affected_segments: [list]
relevance_score: 1-5
research_domain: "Computational Linguistics"
```

---

## Signals System

Industry trends are tracked in `_data/signals.yml`. Each signal has:

- A unique key (e.g., `quality-gap-closure`)
- A status: `supported`, `emerging`, or `disputed`
- Associated posts that reference it via `signal_ids` front matter

The `update_signal_status.py` script recalculates signal statuses from post stance/confidence data automatically.

---

## Content Types

- **Daily gists** — Auto-generated summaries of RSS feed articles (via `generate_gists.py`)
- **Weekly newsletters** — Curated AI-written newsletters (via `send_newsletter.py`)
- **Monthly reports** — Synthesis reports covering the past month (via `generate_monthly_summary.py`)
- **Research posts** — Manually or semi-manually authored theory/linguistics content

---

## No Test Suite

There is no formal test suite. Validation is done implicitly:
- Jekyll build success confirms site renders correctly
- `validate_signal_metadata.py` validates signal YAML structure
- GitHub Actions fail on Python errors

---

## Important Notes

- **Do not manually edit `seen.json`** — it is managed by `generate_gists.py` to deduplicate RSS entries.
- **Do not push directly to `main`** unless deploying a hotfix. All automation commits directly to `main`.
- **Secrets are never committed** — API keys are stored as GitHub Actions secrets only.
- **Post filenames** follow the pattern `YYYY-MM-DD-slug.md` and must match the `date` front matter field.
