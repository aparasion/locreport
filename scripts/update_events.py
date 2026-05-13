#!/usr/bin/env python3
"""
update_events.py — Fetch events from industry RSS feeds and merge into _data/events.yml.

Sources:
  - https://locworld.com/events/feed/
  - https://www.nimdzi.com/events/rss

Existing manually-curated entries are preserved; duplicates are detected by URL.
Events whose end_date is more than 30 days in the past are pruned.
"""

import os
import re
import sys
import datetime
import unicodedata
from pathlib import Path

import feedparser
import requests
import yaml

FEEDS = [
    "https://locworld.com/events/feed/",
    "https://www.nimdzi.com/events/rss",
]

EVENTS_FILE = Path(__file__).parent.parent / "_data" / "events.yml"
CUTOFF_DAYS = 30  # prune events that ended this many days ago

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; LocReport-EventBot/1.0; "
        "+https://locreport.com)"
    )
}


# ── helpers ──────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_-]+", "-", text)[:80]


def fetch_feed(url: str) -> feedparser.FeedParserDict:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        return feedparser.parse(resp.content)
    except Exception as exc:
        print(f"  Warning: could not fetch {url}: {exc}", file=sys.stderr)
        return feedparser.parse("")


def parse_date(entry, field: str) -> str | None:
    """Return YYYY-MM-DD string from a struct_time field, or None."""
    val = getattr(entry, field, None)
    if val is None:
        return None
    try:
        t = datetime.datetime(*val[:6])
        return t.strftime("%Y-%m-%d")
    except Exception:
        return None


def strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


def infer_category(title: str, summary: str) -> str:
    combined = (title + " " + summary).lower()
    if any(w in combined for w in ("summit", "leader", "ceo", "strategy")):
        return "summit"
    if any(w in combined for w in ("forum", "roundtable", "panel")):
        return "forum"
    return "conference"


def infer_format(title: str, summary: str) -> str:
    combined = (title + " " + summary).lower()
    if any(w in combined for w in ("virtual", "online", "webinar", "remote")):
        return "virtual"
    if any(w in combined for w in ("hybrid")):
        return "hybrid"
    return "in-person"


def extract_location(summary: str) -> str:
    """Best-effort location extraction from description text."""
    # Look for "City, Country" or "City, ST" patterns
    m = re.search(
        r"\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2,}|[A-Z][a-z]+)\b",
        summary or "",
    )
    if m:
        return m.group(0)
    return "TBC"


def build_entry_from_feed(entry: feedparser.util.FeedParserDict) -> dict | None:
    """Convert a feedparser entry to a LocReport events.yml dict, or None to skip."""
    title = strip_html(getattr(entry, "title", "") or "")
    url = getattr(entry, "link", "") or ""
    summary = strip_html(getattr(entry, "summary", "") or getattr(entry, "description", "") or "")

    if not title or not url:
        return None

    # Dates — try multiple feedparser fields
    start_date = (
        parse_date(entry, "published_parsed")
        or parse_date(entry, "updated_parsed")
        or parse_date(entry, "created_parsed")
    )
    # Some event feeds expose start/end via tags or alternate fields
    end_date = start_date  # default: single-day

    # Try to read custom event start/end tags (locworld uses these)
    for tag in getattr(entry, "tags", []):
        term = (tag.get("term") or "").lower()
        label = (tag.get("label") or "").lower()
        combined = term + " " + label
        if "start" in combined:
            d = re.search(r"\d{4}-\d{2}-\d{2}", combined)
            if d:
                start_date = d.group(0)
        if "end" in combined:
            d = re.search(r"\d{4}-\d{2}-\d{2}", combined)
            if d:
                end_date = d.group(0)

    # Look for ISO dates embedded in summary
    date_hits = re.findall(r"\b(\d{4}-\d{2}-\d{2})\b", summary)
    if date_hits and not start_date:
        start_date = date_hits[0]
    if len(date_hits) >= 2 and end_date == start_date:
        end_date = date_hits[-1]

    if not start_date:
        return None  # cannot place event in timeline without a date

    uid = slugify(title)

    return {
        "id": uid,
        "name": title,
        "organizer": "LocWorld" if "locworld" in url.lower() else "Nimdzi Insights",
        "start_date": start_date,
        "end_date": end_date,
        "location": extract_location(summary),
        "format": infer_format(title, summary),
        "category": infer_category(title, summary),
        "url": url,
        "description": (summary[:300] + "…" if len(summary) > 300 else summary) or title,
        "tags": ["localization", "events"],
    }


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    today = datetime.date.today()
    cutoff = today - datetime.timedelta(days=CUTOFF_DAYS)

    # Load existing events
    existing: list[dict] = []
    if EVENTS_FILE.exists():
        with open(EVENTS_FILE, encoding="utf-8") as f:
            loaded = yaml.safe_load(f)
            if isinstance(loaded, list):
                existing = loaded

    # Build lookup by URL for deduplication
    existing_by_url = {e.get("url", ""): e for e in existing if e.get("url")}
    merged = dict(existing_by_url)  # url → entry

    # Fetch and parse each feed
    new_count = 0
    for feed_url in FEEDS:
        print(f"Fetching: {feed_url}")
        feed = fetch_feed(feed_url)
        print(f"  → {len(feed.entries)} entries")
        for entry in feed.entries:
            built = build_entry_from_feed(entry)
            if built is None:
                continue
            url = built["url"]
            if url in merged:
                continue  # already known
            merged[url] = built
            new_count += 1
            print(f"  + {built['name']} ({built['start_date']})")

    # Prune old events (end_date more than CUTOFF_DAYS ago)
    events = list(merged.values())
    before_prune = len(events)
    events = [
        e for e in events
        if _date_after_cutoff(e.get("end_date") or e.get("start_date"), cutoff)
    ]
    pruned = before_prune - len(events)

    # Sort by start_date
    events.sort(key=lambda e: e.get("start_date", "9999-99-99"))

    # Write back
    with open(EVENTS_FILE, "w", encoding="utf-8") as f:
        yaml.dump(
            events,
            f,
            allow_unicode=True,
            default_flow_style=False,
            sort_keys=False,
        )

    print(
        f"\nDone. {new_count} new event(s) added, {pruned} old event(s) pruned. "
        f"{len(events)} total in {EVENTS_FILE.name}."
    )


def _date_after_cutoff(date_str: str | None, cutoff: datetime.date) -> bool:
    if not date_str:
        return True  # keep if no date known
    try:
        return datetime.date.fromisoformat(str(date_str)) >= cutoff
    except ValueError:
        return True


if __name__ == "__main__":
    main()
