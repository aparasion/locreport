#!/usr/bin/env python3
"""One-time migration script: re-fetch Language Science articles from
annualreviews.org and sciencedirect.com using the theory pipeline
(scholarly gist prompt, research intelligence, theory front matter).

Processes ALL available RSS entries (no MAX_ARTICLES cap) and writes them as
theory posts to _posts/.  Updates seen.json so the daily pipeline skips them.
"""

import os
import sys
import json
import datetime
import time
import re

# Import shared utilities from the main pipeline
from generate_gists import (
    fetch_feed,
    extract_article_text,
    is_usable_article_text,
    normalize_url,
    normalize_title,
    normalize_text,
    strip_html,
    yaml_escape,
    get_publisher_domain,
    THEORY_GIST_SYSTEM_PROMPT,
    generate_theory_intelligence,
    client,
    SEEN_FILE,
    SEEN_HISTORY_CAP,
    load_existing_post_dedup_index,
)

THEORY_FEEDS = [
    "https://www.annualreviews.org/rss/content/journals/linguistics/latestarticles?fmt=rss",
    "https://rss.sciencedirect.com/publication/science/29497191",
]


def main() -> None:
    # ── Load dedup state ──
    if os.path.exists(SEEN_FILE):
        with open(SEEN_FILE, "r", encoding="utf-8") as f:
            seen = json.load(f)
    else:
        seen = []

    normalized_seen = {normalize_url(e) for e in seen if not e.startswith("title::")}
    seen_titles = {e[len("title::"):] for e in seen if e.startswith("title::")}
    existing_post_urls, existing_post_titles = load_existing_post_dedup_index("_posts")
    normalized_seen.update(existing_post_urls)
    seen_titles.update(existing_post_titles)

    posts_created = 0

    for feed_url in THEORY_FEEDS:
        print(f"\n{'='*60}")
        print(f"Fetching: {feed_url}")
        feed = fetch_feed(feed_url)
        print(f"  Found {len(feed.entries)} entries")

        for entry in feed.entries:  # No [:10] cap — process ALL entries
            url = normalize_url(getattr(entry, "link", ""))
            if not url:
                continue

            # Dedup check
            if url in normalized_seen:
                print(f"  [skip-seen] {getattr(entry, 'title', '')[:60]}")
                continue

            title = getattr(entry, "title", "")
            title_norm = normalize_title(title)
            if title_norm and title_norm in seen_titles:
                print(f"  [skip-title] {title[:60]}")
                continue

            if not title:
                print(f"  [skip-no-title] {url[:60]}")
                continue

            # ── Extract article text ──
            text = extract_article_text(url)

            # Fallback to RSS description/summary
            fallback_raw = getattr(entry, "summary", "") or getattr(entry, "description", "")
            fallback = normalize_text(strip_html(fallback_raw))

            if is_usable_article_text(text, title):
                pass  # use extracted text
            elif is_usable_article_text(fallback, title):
                text = fallback
            elif text and len(text) > 200:
                pass  # use whatever we got
            elif fallback and len(fallback) > 200:
                text = fallback
            else:
                print(f"  [skip-no-content] {title[:60]} (text={len(text)}c, fallback={len(fallback)}c)")
                continue

            # ── Generate theory gist ──
            prompt = (
                "Write a gist for this research article (120–160 words).\n"
                "Frame it for linguists and language science researchers.\n\n"
                f"Article text:\n{text[:15000]}"
            )

            try:
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": THEORY_GIST_SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=300,
                    temperature=0.4,
                )
                gist = response.choices[0].message.content.strip()
                if gist == "UNUSABLE_CONTENT":
                    print(f"  [skip-unusable] {title[:60]}")
                    continue
            except Exception as e:
                print(f"  [error-gist] {title[:60]}: {e}")
                continue

            # ── Generate theory intelligence ──
            theory_intel = generate_theory_intelligence(title, gist, text[:15000])

            # ── Determine publication date ──
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                pub_dt = datetime.datetime(*entry.published_parsed[:6], tzinfo=datetime.timezone.utc)
            elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                pub_dt = datetime.datetime(*entry.updated_parsed[:6], tzinfo=datetime.timezone.utc)
            else:
                pub_dt = datetime.datetime.now(datetime.timezone.utc)

            post_date_str = pub_dt.strftime("%Y-%m-%d")
            time_str = pub_dt.strftime("%H:%M:%S")

            # ── Generate slug and filename ──
            slug_raw = re.sub(r"\s+", "-", title.lower().strip())
            slug = "".join(c for c in slug_raw if c.isalnum() or c == "-")[:60].strip("-")
            if not slug:
                slug = f"theory-{int(pub_dt.timestamp())}"

            filename = f"_posts/{post_date_str}-{slug}.md"
            suffix = 1
            while os.path.exists(filename):
                filename = f"_posts/{post_date_str}-{slug}-{suffix}.md"
                suffix += 1

            # ── Build front matter ──
            publisher = get_publisher_domain(url)
            safe_title = yaml_escape(title)
            safe_excerpt = yaml_escape(gist[:160])
            safe_publisher = yaml_escape(publisher)
            safe_source_url = yaml_escape(url)
            relevance_score = theory_intel["relevance_score"]
            research_domain = theory_intel["research_domain"]
            implications_yaml = "\n".join(
                f'  - "{yaml_escape(impl)}"' for impl in theory_intel["research_implications"]
            )

            md_content = f"""---
title: "{safe_title}"
date: {post_date_str}T{time_str}Z
layout: post
categories: [theory]
tags: [linguistics, research, theory, gist]
article_type: "theory"
excerpt: "{safe_excerpt}..."
publisher: "{safe_publisher}"
source_url: "{safe_source_url}"
relevance_score: {relevance_score}
research_domain: "{research_domain}"
research_implications:
{implications_yaml}
---

{gist}

Source: [{safe_publisher}]({safe_source_url})
"""

            os.makedirs("_posts", exist_ok=True)
            with open(filename, "w", encoding="utf-8") as f:
                f.write(md_content)

            # ── Update dedup tracking ──
            if url not in normalized_seen:
                seen.append(url)
                normalized_seen.add(url)
            if title_norm and title_norm not in seen_titles:
                seen.append(f"title::{title_norm}")
                seen_titles.add(title_norm)

            posts_created += 1
            print(f"  [created] {title[:60]} -> {filename}")
            time.sleep(2)  # rate limit

    # ── Save updated seen.json ──
    with open(SEEN_FILE, "w", encoding="utf-8") as f:
        json.dump(seen[-SEEN_HISTORY_CAP:], f, indent=2)

    print(f"\n{'='*60}")
    print(f"Migration complete: {posts_created} theory articles created")


if __name__ == "__main__":
    main()
