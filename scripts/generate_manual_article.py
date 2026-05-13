import argparse
import datetime
import os
import re
from urllib.parse import urlparse

from generate_gists import (
    SEEN_FILE,
    SEEN_HISTORY_CAP,
    YOUR_AREA,
    build_tags,
    classify_article_type,
    generate_gist,
    generate_intelligence,
    generate_theory_intelligence,
    get_publisher_domain,
    infer_signal_tags,
    infer_title_from_text,
    make_excerpt,
    normalize_text,
    normalize_title,
    normalize_url,
    pick_author,
    SIGNAL_TITLES,
    yaml_escape,
)


def parse_article_date(value: str) -> datetime.datetime:
    """Parse a manual article date as UTC, accepting YYYY-MM-DD or ISO datetime."""
    cleaned = value.strip()
    if not cleaned:
        return datetime.datetime.now(datetime.timezone.utc)

    if cleaned.endswith("Z"):
        cleaned = cleaned[:-1] + "+00:00"

    try:
        parsed = datetime.datetime.fromisoformat(cleaned)
    except ValueError:
        parsed_date = datetime.datetime.strptime(cleaned, "%Y-%m-%d").date()
        parsed = datetime.datetime.combine(parsed_date, datetime.time(), tzinfo=datetime.timezone.utc)

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=datetime.timezone.utc)
    return parsed.astimezone(datetime.timezone.utc)


def slugify(title: str, fallback: str) -> str:
    slug_raw = re.sub(r"\s+", "-", title.lower().strip())
    slug = "".join(c for c in slug_raw if c.isalnum() or c == "-")[:60].strip("-")
    if slug:
        return slug

    parsed = urlparse(fallback)
    fallback_slug = parsed.netloc.replace("www.", "") or "manual-article"
    return re.sub(r"[^a-z0-9-]", "-", fallback_slug.lower()).strip("-") or "manual-article"


def write_post(
    title: str,
    url: str,
    pub_dt: datetime.datetime,
    text: str,
    gist: str,
    article_type: str,
    source_name: str = "",
    extra_urls: list[str] | None = None,
    content_type: str = "",
    override_signal_ids: list[str] | None = None,
    override_impact_score: int | None = None,
    override_time_horizon: str = "",
) -> str:
    now = datetime.datetime.now(datetime.timezone.utc)
    if pub_dt > now:
        pub_dt = now

    post_date_str = pub_dt.strftime("%Y-%m-%d")
    time_str = pub_dt.strftime("%H:%M:%S")
    slug = slugify(title, url)
    filename = f"_posts/{post_date_str}-{slug}.md"
    suffix = 1
    while os.path.exists(filename):
        filename = f"_posts/{post_date_str}-{slug}-{suffix}.md"
        suffix += 1

    publisher = get_publisher_domain(url)
    author = pick_author(slug, article_type)
    safe_title = yaml_escape(title)
    safe_excerpt = yaml_escape(make_excerpt(gist))
    source_label = source_name.strip() or publisher
    safe_publisher = yaml_escape(publisher)
    safe_source_label = yaml_escape(source_label)
    safe_source_url = yaml_escape(url)

    if article_type == "theory":
        theory_intel = generate_theory_intelligence(title, gist, text[:15000])
        implications_yaml = "\n".join(
            f'  - "{yaml_escape(impl)}"' for impl in theory_intel["research_implications"]
        )
        tags_yaml = ", ".join(build_tags("theory", []))
        md_content = f"""---
title: "{safe_title}"
date: {post_date_str}T{time_str}Z
layout: post
categories: [theory]
tags: [{tags_yaml}]
article_type: "theory"
author: "{author}"
excerpt: "{safe_excerpt}"
publisher: "{safe_publisher}"
source_url: "{safe_source_url}"
relevance_score: {theory_intel["relevance_score"]}
research_domain: "{theory_intel["research_domain"]}"
research_implications:
{implications_yaml}
---

{gist}

Source: [{safe_source_label}]({safe_source_url})"""
    else:
        intelligence = generate_intelligence(title, gist, text[:15000])
        ai_signal_ids, signal_stance, signal_confidence = infer_signal_tags(title, gist)
        signal_ids = override_signal_ids if override_signal_ids else ai_signal_ids
        final_impact = override_impact_score if override_impact_score is not None else intelligence["impact_score"]
        final_horizon = override_time_horizon if override_time_horizon else intelligence["time_horizon"]
        final_article_type = content_type if content_type in ("theory",) else "industry"

        signal_ref = ""
        if signal_confidence == "high" and signal_ids:
            signal_title = SIGNAL_TITLES.get(signal_ids[0], "")
            if signal_title:
                signal_ref = (
                    f"\n*LocReport tracks this as an industry signal: "
                    f"[{signal_title}](/intelligence/signals/#{signal_ids[0]})*\n"
                )

        # Additional source attribution lines
        extra_source_lines = ""
        for extra_url in (extra_urls or []):
            extra_url = extra_url.strip()
            if extra_url:
                extra_source_lines += f"\nAdditional source: <{extra_url}>"

        tags_yaml = ", ".join(build_tags("industry", signal_ids))
        implications_yaml = "\n".join(
            f'  - "{yaml_escape(impl)}"' for impl in intelligence["business_implications"]
        )
        md_content = f"""---
title: "{safe_title}"
date: {post_date_str}T{time_str}Z
layout: post
categories: [{YOUR_AREA.lower()}]
tags: [{tags_yaml}]
article_type: "{final_article_type}"
author: "{author}"
excerpt: "{safe_excerpt}"
publisher: "{safe_publisher}"
source_url: "{safe_source_url}"
signal_ids: [{", ".join(signal_ids)}]
signal_stance: {signal_stance}
signal_confidence: {signal_confidence}
impact_score: {final_impact}
time_horizon: "{final_horizon}"
affected_segments: [{", ".join(intelligence["affected_segments"])}]
business_implications:
{implications_yaml}
---

{gist}
{signal_ref}
Source: [{safe_source_label}]({safe_source_url}){extra_source_lines}
"""

    os.makedirs("_posts", exist_ok=True)
    with open(filename, "w", encoding="utf-8") as post_file:
        post_file.write(md_content)
    return filename


def update_seen(url: str, title: str) -> None:
    import json

    seen = []
    if os.path.exists(SEEN_FILE):
        with open(SEEN_FILE, "r", encoding="utf-8") as seen_file:
            try:
                seen = json.load(seen_file)
            except json.JSONDecodeError:
                seen = []

    normalized_url = normalize_url(url)
    if normalized_url and normalized_url not in {normalize_url(e) for e in seen if not e.startswith("title::")}:
        seen.append(normalized_url)

    normalized_title = normalize_title(title)
    title_entry = f"title::{normalized_title}"
    if normalized_title and title_entry not in seen:
        seen.append(title_entry)

    with open(SEEN_FILE, "w", encoding="utf-8") as seen_file:
        json.dump(seen[-SEEN_HISTORY_CAP:], seen_file, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a LocReport post from manually pasted article content.")
    parser.add_argument("--url", required=True, help="Canonical URL of the source article")
    parser.add_argument("--date", required=True, help="Article date as YYYY-MM-DD or ISO datetime")
    parser.add_argument("--content-file", required=True, help="Path to a UTF-8 text file containing the source article")
    parser.add_argument("--title", default="", help="Optional source article title; generated when omitted")
    parser.add_argument("--source-name", default="", help="Source link text to display in the generated post")
    parser.add_argument("--prompt-addition", default="", help="Optional editor instructions appended to the gist prompt")
    parser.add_argument("--extra-url", action="append", default=[], dest="extra_urls", help="Additional source URLs (repeatable)")
    parser.add_argument("--content-type", default="", choices=["", "gist", "analysis", "roundup", "opinion"], help="Article content type override")
    parser.add_argument("--signal-ids", default="", help="Comma-separated signal IDs to assign (overrides AI inference)")
    parser.add_argument("--impact-score", type=int, default=None, choices=[1, 2, 3, 4, 5], help="Impact score override (1-5)")
    parser.add_argument("--time-horizon", default="", choices=["", "now", "6months", "2years"], help="Time horizon override")
    args = parser.parse_args()

    with open(args.content_file, "r", encoding="utf-8") as content_file:
        text = normalize_text(content_file.read())

    if not text:
        raise SystemExit("Manual article content is empty.")

    title = args.title.strip() or infer_title_from_text(args.url, text)
    publisher = get_publisher_domain(args.url)
    article_type = classify_article_type(publisher, text)

    override_signal_ids = [s.strip() for s in args.signal_ids.split(",") if s.strip()] if args.signal_ids else None

    gist = generate_gist(title, text, article_type, args.prompt_addition)
    if gist == "UNUSABLE_CONTENT":
        raise SystemExit("Manual article content was classified as unusable.")

    filename = write_post(
        title,
        args.url,
        parse_article_date(args.date),
        text,
        gist,
        article_type,
        args.source_name,
        extra_urls=args.extra_urls,
        content_type=args.content_type,
        override_signal_ids=override_signal_ids,
        override_impact_score=args.impact_score,
        override_time_horizon=args.time_horizon,
    )
    update_seen(args.url, title)
    print(f"Created {filename}")


if __name__ == "__main__":
    main()
