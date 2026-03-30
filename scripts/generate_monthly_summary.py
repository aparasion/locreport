import argparse
import datetime
import os
import re
from pathlib import Path

from openai import OpenAI

POSTS_DIR = Path("_posts")
SIGNALS_DATA_FILE = Path("_data/signals.yml")
MONTHLY_CATEGORY = "monthly-summary"
BASE_CATEGORY = "translation"

SYSTEM_PROMPT = """You are a senior editor writing the monthly industry intelligence report for a localization and translation industry publication. Your readers are decision-makers, technology leaders, and practitioners in enterprise localization, language AI, and language services.

This report is a full editorial article of approximately 2000 words — not a list of events, but a deeply synthesized, narrative-driven analysis of what moved the industry forward this month, what created uncertainty, and what every professional in this space should understand and act on.

FORMAT AND STRUCTURE:

**Opening (200–250 words)**
Begin with a compelling, essay-style introduction that captures the defining theme or tension of the month. State a clear editorial argument — one idea a reader will remember and share. Set the stakes. Do not summarize what follows; instead, frame why this month matters.

## Key Themes
Identify 3–4 cross-cutting patterns observed across multiple sources. For each theme, describe what the pattern is, what evidence supports it (cite specific articles or findings using inline markdown links: [anchor text](source_url)), and what it signals about where the industry is heading. Each theme should be a short paragraph, not a bullet point.

## Notable Developments
Cover 4–6 specific, significant events or announcements. For each, write 3–5 sentences: what happened, who was involved, why it matters, and what was surprising or consequential. Where a source article is available, hyperlink the relevant company name, product, or finding directly: e.g., [DeepL expanded its API](source_url). Surface breaking or unexpected findings prominently — flag them with **Breaking:** if they represent a significant shift from prior expectations.

## Major Implications & Breaking Findings
This is the analytical core of the report. Dedicate 350–450 words to examining the second- and third-order consequences of this month's developments. What are the structural shifts — in competitive dynamics, technology adoption curves, workforce impacts, or regulatory environment — that practitioners may be underestimating? Highlight any findings that contradict prevailing assumptions or signal an inflection point. Use inline links to anchor specific claims to source material.

## Globalization Strategy: What Companies Should Know
Write 300–400 words of practical, actionable guidance for enterprise and mid-market companies navigating globalization in the current environment. Draw directly from this month's evidence: what recent findings, new tools, or emerging approaches should companies be evaluating? Cover at least two of: localization technology adoption, language coverage decisions, vendor or build-vs-buy dynamics, market entry or expansion considerations, or AI-assisted translation quality and governance. Make tips specific and grounded — not generic best practices.

## Business and Market Signals
In 200–250 words, analyze what this month's activity reveals about investment flows, competitive positioning, and adoption dynamics in language technology and services. Where is money moving? What partnerships, acquisitions, or product launches signal a strategic bet? What is conspicuously absent?

## What to Watch Next Month
Offer 3–4 specific, forward-looking observations grounded in trends visible this month. Each should name a concrete development to track, not a vague category. Explain briefly why it matters and what outcome would confirm or challenge the trend.

EDITORIAL STANDARDS:
• Target approximately 2000 words total across all sections.
• Synthesize — connect dots across sources; surface patterns and tensions rather than summarizing articles one by one.
• Use inline markdown hyperlinks [anchor text](url) to link specific findings, company names, product names, or claims to their source articles whenever a source_url is available. Do not list sources separately — weave them into the prose.
• Only draw on information present in the provided source summaries. No invented facts or external knowledge.
• Write in a confident, expert editorial voice: clear, direct, and specific. Not dry, not listy.
• Avoid generic industry clichés ("AI is transforming...", "companies are increasingly...").
• Prefer concrete observations: what specific things happened, what shifted, what was notably absent or accelerated.
• No hype and no speculation beyond what the sources support.
"""

USER_PROMPT_TEMPLATE = """Create the monthly industry report for {period}.

{article_summaries}
"""


def yaml_escape(text: str) -> str:
    return (text or "").replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").strip()


def slugify(text: str) -> str:
    slug_raw = re.sub(r"\s+", "-", text.lower().strip())
    return "".join(c for c in slug_raw if c.isalnum() or c == "-").strip("-")


def parse_front_matter(content: str) -> tuple[dict, str]:
    if not content.startswith("---\n"):
        return {}, content

    end = content.find("\n---\n", 4)
    if end == -1:
        return {}, content

    fm_text = content[4:end]
    body = content[end + 5 :]
    fm = {}
    for line in fm_text.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        fm[key.strip()] = value.strip()
    return fm, body.strip()


def post_month_from_filename(path: Path) -> str | None:
    match = re.match(r"^(\d{4})-(\d{2})-(\d{2})-", path.name)
    if not match:
        return None
    return f"{match.group(1)}-{match.group(2)}"


def is_monthly_post(front_matter: dict) -> bool:
    categories = front_matter.get("categories", "")
    return MONTHLY_CATEGORY in categories


def collect_month_articles(period: str) -> list[dict]:
    rows = []
    for path in sorted(POSTS_DIR.glob("*.md")):
        if post_month_from_filename(path) != period:
            continue

        content = path.read_text(encoding="utf-8")
        front_matter, body = parse_front_matter(content)

        if is_monthly_post(front_matter):
            continue

        title = front_matter.get("title", "").strip().strip('"')
        source_url = front_matter.get("source_url", "").strip().strip('"')
        publisher = front_matter.get("publisher", "").strip().strip('"')
        excerpt = front_matter.get("excerpt", "").strip().strip('"')

        summary_text = excerpt if excerpt else body[:500]
        if not title:
            continue

        rows.append(
            {
                "title": title,
                "publisher": publisher,
                "source_url": source_url,
                "summary": summary_text,
            }
        )
    return rows


def build_article_prompt_rows(articles: list[dict]) -> str:
    chunks = []
    for idx, article in enumerate(articles, start=1):
        chunks.append(
            f"{idx}. Title: {article['title']}\n"
            f"Publisher: {article['publisher'] or 'Unknown'}\n"
            f"Source: {article['source_url'] or 'N/A'}\n"
            f"Summary: {article['summary']}\n"
        )
    return "\n".join(chunks)


def parse_inline_list(value: str) -> list[str]:
    cleaned = (value or "").strip()
    if not cleaned.startswith("[") or not cleaned.endswith("]"):
        return []
    inner = cleaned[1:-1].strip()
    if not inner:
        return []
    return [item.strip().strip('"').strip("'") for item in inner.split(",") if item.strip()]


def load_signal_titles() -> dict[str, str]:
    if not SIGNALS_DATA_FILE.exists():
        return {}

    current_id = None
    title_by_id: dict[str, str] = {}
    for raw in SIGNALS_DATA_FILE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line.startswith("- id:"):
            current_id = line.split(":", 1)[1].strip().strip('"').strip("'")
            continue
        if current_id and line.startswith("title:"):
            title_by_id[current_id] = line.split(":", 1)[1].strip().strip('"').strip("'")
            current_id = None
    return title_by_id


def collect_signal_updates(period: str) -> dict[str, dict[str, int]]:
    updates: dict[str, dict[str, int]] = {}
    for path in sorted(POSTS_DIR.glob("*.md")):
        if post_month_from_filename(path) != period:
            continue

        content = path.read_text(encoding="utf-8")
        front_matter, _ = parse_front_matter(content)
        if is_monthly_post(front_matter):
            continue

        signal_ids = parse_inline_list(front_matter.get("signal_ids", ""))
        if not signal_ids:
            continue

        stance = front_matter.get("signal_stance", "mentions").strip().strip('"').strip("'")
        if stance not in {"supports", "contradicts", "mixed", "mentions"}:
            stance = "mentions"

        for signal_id in signal_ids:
            updates.setdefault(signal_id, {"supports": 0, "contradicts": 0, "mixed": 0, "mentions": 0})
            updates[signal_id][stance] += 1
    return updates


def build_signal_updates_section(period: str) -> str:
    updates = collect_signal_updates(period)
    if not updates:
        return ""

    titles = load_signal_titles()
    lines = ["## Signal Tracker Updates", ""]
    for signal_id in sorted(updates.keys()):
        counts = updates[signal_id]
        label = titles.get(signal_id, signal_id)
        total = sum(counts.values())
        lines.append(
            f"- **{label}** (`{signal_id}`): {total} linked post(s) "
            f"(supports: {counts['supports']}, contradicts: {counts['contradicts']}, "
            f"mixed: {counts['mixed']}, mentions: {counts['mentions']})."
        )
    return "\n".join(lines)


def monthly_post_exists(period: str) -> bool:
    for path in POSTS_DIR.glob(f"{period}-*.md"):
        content = path.read_text(encoding="utf-8")
        front_matter, _ = parse_front_matter(content)
        if is_monthly_post(front_matter) and front_matter.get("period", "").strip('"') == period:
            return True
    return False


def write_monthly_post(period: str, article_count: int, content: str) -> Path:
    year, month = period.split("-")
    month_name = datetime.date(int(year), int(month), 1).strftime("%B")
    title = f"Monthly Report: {month_name} {year}"
    slug = slugify(f"monthly-report-{month_name}-{year}")
    post_date = datetime.date(int(year), int(month), 1) + datetime.timedelta(days=27)
    while post_date.month != int(month):
        post_date -= datetime.timedelta(days=1)

    date_prefix = post_date.isoformat()
    filename = POSTS_DIR / f"{date_prefix}-{slug}.md"
    suffix = 1
    while filename.exists():
        filename = POSTS_DIR / f"{date_prefix}-{slug}-{suffix}.md"
        suffix += 1

    safe_title = yaml_escape(title)
    safe_excerpt = yaml_escape(f"A monthly roundup for {month_name} {year} based on {article_count} articles")

    md = f"""---
title: \"{safe_title}\"
date: {post_date.isoformat()}T09:00:00Z
layout: post
categories: [{MONTHLY_CATEGORY}]
tags: [monthly, roundup, translation, localization]
excerpt: \"{safe_excerpt}.\"
period: \"{period}\"
source_count: {article_count}
---

{content}
"""
    filename.write_text(md, encoding="utf-8")
    return filename


def get_default_period() -> str:
    today = datetime.date.today().replace(day=1)
    last_month_end = today - datetime.timedelta(days=1)
    return last_month_end.strftime("%Y-%m")


def generate_monthly_summary(period: str, force: bool = False) -> Path | None:
    if not POSTS_DIR.exists():
        raise FileNotFoundError("_posts directory does not exist")

    if monthly_post_exists(period) and not force:
        print(f"Monthly report already exists for {period}. Use --force to generate another.")
        return None

    articles = collect_month_articles(period)
    if not articles:
        print(f"No articles found for {period}.")
        return None

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    article_summaries = build_article_prompt_rows(articles)
    user_prompt = USER_PROMPT_TEMPLATE.format(period=period, article_summaries=article_summaries)

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=3200,
        temperature=0.5,
    )
    monthly_content = response.choices[0].message.content.strip()
    signal_updates_section = build_signal_updates_section(period)
    if signal_updates_section:
        monthly_content = f"{monthly_content}\n\n{signal_updates_section}"
    out_file = write_monthly_post(period, len(articles), monthly_content)
    print(f"Created monthly report: {out_file}")
    return out_file


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate monthly summary posts from existing daily posts.")
    parser.add_argument("--month", default=get_default_period(), help="Month to summarize in YYYY-MM format")
    parser.add_argument("--force", action="store_true", help="Generate even if a monthly post already exists")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    if not re.match(r"^\d{4}-\d{2}$", args.month):
        raise ValueError("--month must be in YYYY-MM format")
    generate_monthly_summary(args.month, force=args.force)
