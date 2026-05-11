#!/usr/bin/env python3
"""
Backfill existing posts with improved gist content.

Re-generates the gist body with the updated 4-paragraph prompts and adds
author + better tags to all posts that predate the new generation rules.

Run from the repository root:
  python scripts/backfill_gists.py [--limit N] [--dry-run] [--force]

Options:
  --limit N    Process at most N posts per run (suggested: 50–100 per batch)
  --dry-run    Print what would change without writing any files
  --force      Re-process posts that already have an author field
"""

import argparse
import os
import re
import sys
import time

# Always resolve paths relative to the repo root, regardless of CWD
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(REPO_ROOT)
sys.path.insert(0, os.path.join(REPO_ROOT, "scripts"))

from generate_gists import (
    SIGNAL_TITLES,
    THEORY_GIST_SYSTEM_PROMPT,
    build_tags,
    client,
    extract_article_text,
    has_title_overlap,
    is_usable_article_text,
    make_excerpt,
    normalize_text,
    pick_author,
    yaml_escape,
)

POSTS_DIR = os.path.join(REPO_ROOT, "_posts")
DELAY_SECONDS = 2

INDUSTRY_GIST_SYSTEM_PROMPT = """You are a senior editorial writer for LocReport, a professional news platform covering the language services and localization industry. Your readers are localization managers, language technology leaders, translators, and enterprise language buyers who need to understand what's happening and why it matters.

Write a substantive editorial analysis in 4 paragraphs (380–520 words total).

Narrative stance: Write from the position and line of reasoning of the original author, not as a meta-summary about an article. Avoid phrases such as "the article says," "the source notes," "the piece argues," or similar distancing language. Preserve the author's thesis, evidence, and emphasis in direct editorial prose while making clear factual attributions where needed.

Opening paragraph: Lead with the core development in a sharp, direct sentence. Establish what happened, who is involved, and why it warrants attention, using the author's framing rather than describing the article from the outside.

Second paragraph: Provide the context developed by the author — what broader trend, challenge, or market shift does this connect to? A reader who hasn't been following this area closely should understand why this is happening now.

Third paragraph: Explain the specific impact on localization workflows, business models, or competitive dynamics only when the author supports that connection. Use concrete language — which roles, teams, or vendors are affected and how.

Closing paragraph: Offer a sharp LocReport observation — one evidence-based insight grounded in the author's position and the source material. Do not broaden beyond what the source supports or frame the conclusion around "what this single article says."

Tone and style:
• Write like a knowledgeable colleague sharing analysis, not like a press release.
• Use active voice, varied sentence length, and concrete language.
• Avoid corporate jargon, filler phrases ("in a world where...", "it's worth noting that..."), and vague superlatives.
• Neutral and factual — no speculation beyond what the source supports.
• The analysis should make a localization professional think, not just inform them.

If the provided text is mostly cookie/privacy/legal notices rather than article content, respond exactly with: UNUSABLE_CONTENT"""


# ── Front matter helpers ────────────────────────────────────────────────────

def parse_post(filepath):
    """
    Parse a Jekyll post file.
    Returns (raw_fm_text, fm_dict, body_text) or (None, {}, raw) on failure.
    raw_fm_text is the text between the two --- delimiters (no leading/trailing ---).
    """
    with open(filepath, "r", encoding="utf-8") as f:
        raw = f.read()

    if not raw.startswith("---"):
        return None, {}, raw

    close = raw.find("\n---", 3)
    if close == -1:
        return None, {}, raw

    raw_fm = raw[3:close]
    body = raw[close + 4:].lstrip("\n")

    def get(name):
        m = re.search(rf'^{re.escape(name)}:\s*(.+)$', raw_fm, re.MULTILINE)
        return m.group(1).strip().strip('"').strip("'") if m else ""

    def get_list(name):
        m = re.search(rf'^{re.escape(name)}:\s*\[([^\]]*)\]', raw_fm, re.MULTILINE)
        if not m:
            return []
        return [x.strip().strip('"').strip("'") for x in m.group(1).split(",") if x.strip()]

    fm = {
        "title":             get("title"),
        "article_type":      get("article_type") or "industry",
        "source_url":        get("source_url"),
        "publisher":         get("publisher"),
        "signal_ids":        get_list("signal_ids"),
        "signal_confidence": get("signal_confidence"),
        "has_author":        bool(re.search(r'^author:', raw_fm, re.MULTILINE)),
        "is_monthly":        "monthly-summary" in get("categories"),
    }

    return raw_fm, fm, body


def split_body(body):
    """
    Split body text into (gist_text, source_line).
    Handles both 'Source: [pub](url)' and '[→ Read full article...]' endings.
    """
    lines = body.rstrip().split("\n")
    for i in range(len(lines) - 1, -1, -1):
        stripped = lines[i].strip()
        if stripped.startswith("Source:") or stripped.startswith("[→ Read"):
            gist = "\n".join(lines[:i]).rstrip()
            return gist, lines[i].strip()
    return body.strip(), ""


def update_fm_field(raw_fm, field, new_value):
    """Replace a field value in-place, or insert after article_type if absent."""
    pattern = rf'^{re.escape(field)}:.*$'
    new_line = f"{field}: {new_value}"
    if re.search(pattern, raw_fm, re.MULTILINE):
        return re.sub(pattern, new_line, raw_fm, flags=re.MULTILINE)
    # Insert after article_type line if possible, else append
    m = re.search(r'^article_type:.*$', raw_fm, re.MULTILINE)
    if m:
        pos = m.end()
        return raw_fm[:pos] + "\n" + new_line + raw_fm[pos:]
    return raw_fm + "\n" + new_line


def build_signal_ref(signal_ids, signal_confidence):
    """Reproduce the LocReport signal tracking footnote if applicable."""
    if signal_confidence == "high" and signal_ids:
        signal_title = SIGNAL_TITLES.get(signal_ids[0], "")
        if signal_title:
            return (
                f"\n*LocReport tracks this as an industry signal: "
                f"[{signal_title}](/signals/#{signal_ids[0]})*\n"
            )
    return ""


# ── Gist generation ─────────────────────────────────────────────────────────

def generate_gist(title, text, article_type):
    """Call gpt-4o-mini to produce a new gist from article text."""
    if article_type == "theory":
        system_prompt = THEORY_GIST_SYSTEM_PROMPT
        user_prompt = (
            "Write a substantive research summary (350–480 words).\n"
            "Frame it for linguists, NLP practitioners, and language science researchers.\n\n"
            f"Article text:\n{text[:15000]}"
        )
    else:
        system_prompt = INDUSTRY_GIST_SYSTEM_PROMPT
        user_prompt = (
            "Write a substantive editorial analysis (380–520 words).\n"
            "Frame it for localization managers, language technology leaders, and enterprise language buyers.\n\n"
            f"Article text:\n{text[:15000]}"
        )

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=800,
        temperature=0.4,
    )
    return resp.choices[0].message.content.strip()


# ── Per-post processing ─────────────────────────────────────────────────────

def process_post(filepath, dry_run=False):
    """
    Process one post file.
    Returns True if updated/would-update, False if skipped.
    """
    raw_fm, fm, body = parse_post(filepath)
    if raw_fm is None:
        print("  SKIP — parse error")
        return False

    if fm["is_monthly"]:
        print("  SKIP — monthly report (use generate_monthly_summary.py)")
        return False

    title = fm["title"]
    article_type = fm["article_type"]
    source_url = fm["source_url"]
    publisher = fm["publisher"]
    signal_ids = fm["signal_ids"]
    signal_confidence = fm["signal_confidence"]

    # 1. Try to fetch article text from source_url
    text = ""
    if source_url:
        try:
            fetched = extract_article_text(source_url)
            if is_usable_article_text(fetched, title):
                text = fetched
                print(f"  Fetched {len(text):,} chars from source URL")
            elif fetched and has_title_overlap(fetched, title):
                text = fetched
                print(f"  Fetched {len(text):,} chars (partial, using anyway)")
        except Exception as exc:
            print(f"  Fetch error ({exc.__class__.__name__}) — falling back to existing gist")

    # 2. Fall back to existing gist body
    if not text:
        existing_gist, _ = split_body(body)
        text = normalize_text(existing_gist)
        if not text:
            print("  SKIP — no content available")
            return False
        print(f"  Using existing gist as context ({len(text):,} chars)")

    # 3. Generate new gist
    try:
        gist = generate_gist(title, text, article_type)
    except Exception as exc:
        print(f"  SKIP — API error: {exc}")
        return False

    if gist == "UNUSABLE_CONTENT":
        print("  SKIP — marked unusable by model")
        return False

    # 4. Build updated metadata
    slug = os.path.splitext(os.path.basename(filepath))[0]
    author = pick_author(slug, article_type)
    excerpt = yaml_escape(make_excerpt(gist))
    tags = build_tags(article_type, signal_ids)
    tags_yaml = ", ".join(tags)
    signal_ref = build_signal_ref(signal_ids, signal_confidence)

    # Preserve existing source line; synthesise one if missing
    _, source_line = split_body(body)
    if not source_line and source_url:
        source_line = f"Source: [{publisher or source_url}]({source_url})"

    # 5. Apply front matter updates (surgical replacements only)
    new_fm = raw_fm
    new_fm = update_fm_field(new_fm, "author", f'"{author}"')
    new_fm = re.sub(r'^tags:.*$', f'tags: [{tags_yaml}]', new_fm, flags=re.MULTILINE)
    new_fm = re.sub(r'^excerpt:.*$', f'excerpt: "{excerpt}"', new_fm, flags=re.MULTILINE)

    # 6. Rebuild file
    new_body = f"{gist}\n{signal_ref}\n{source_line}"
    new_content = f"---{new_fm}\n---\n\n{new_body}\n"

    if dry_run:
        word_count = len(gist.split())
        print(f"  DRY RUN — gist {word_count} words | author: {author} | tags: [{tags_yaml}]")
        print(f"  excerpt: {excerpt[:90]}...")
        return True

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)

    word_count = len(gist.split())
    print(f"  Updated — {word_count} words | author: {author}")
    return True


# ── Entry point ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Backfill existing posts with improved gist content"
    )
    parser.add_argument("--limit", type=int, default=None,
                        help="Process at most N posts (run in batches to stay within API limits)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show what would change without writing files")
    parser.add_argument("--force", action="store_true",
                        help="Re-process posts that already have an author field")
    args = parser.parse_args()

    all_posts = sorted(
        os.path.join(POSTS_DIR, f)
        for f in os.listdir(POSTS_DIR)
        if f.endswith(".md")
    )

    # Filter already-processed posts unless --force
    if args.force:
        to_process = all_posts
    else:
        to_process = []
        already_done = 0
        for p in all_posts:
            with open(p, "r", encoding="utf-8") as f:
                if "\nauthor:" in f.read():
                    already_done += 1
                else:
                    to_process.append(p)
        if already_done:
            print(f"Skipping {already_done} posts already backfilled (use --force to redo)")

    if args.limit:
        to_process = to_process[:args.limit]

    total = len(to_process)
    if total == 0:
        print("Nothing to process.")
        return

    mode = "DRY RUN — " if args.dry_run else ""
    print(f"{mode}Processing {total} posts\n")

    updated = skipped = 0
    for i, filepath in enumerate(to_process, 1):
        name = os.path.basename(filepath)
        print(f"[{i}/{total}] {name}")
        try:
            if process_post(filepath, dry_run=args.dry_run):
                updated += 1
            else:
                skipped += 1
        except Exception as exc:
            print(f"  ERROR — {exc}")
            skipped += 1

        if i < total:
            time.sleep(DELAY_SECONDS)

    print(f"\nDone. Updated: {updated} | Skipped: {skipped}")
    if not args.dry_run and updated:
        print(f"\nNext step: git add _posts/ && git commit -m 'Backfill {updated} posts with improved gists'")


if __name__ == "__main__":
    main()
