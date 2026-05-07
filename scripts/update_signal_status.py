"""
Derives current_status and momentum for each signal in _data/signals.yml
by tallying weighted stances from all linked posts.

Weighting:  high=3, medium=2, low=1
Status rules:
  - supported  : supports_score > 0 and supports_score >= 2 * contradicts_score
  - challenged : contradicts_score > supports_score
  - mixed      : both sides present but neither dominates
  - emerging   : no supporting/contradicting evidence yet

Momentum (compared over 30-day windows):
  - rising   : recent_score > 1.25 * older_score (or recent > 0, older == 0)
  - declining : older_score > 1.25 * recent_score
  - stable   : otherwise
"""

import re
import sys
from datetime import date, timedelta
from pathlib import Path

SIGNALS_FILE = Path("_data/signals.yml")
POSTS_DIR = Path("_posts")

CONFIDENCE_WEIGHT = {"high": 3, "medium": 2, "low": 1}
MOMENTUM_THRESHOLD = 1.25   # 25% change triggers rising/declining
RECENT_DAYS = 30
OLDER_DAYS = 60             # window ending 30 days ago


def parse_front_matter(text: str) -> dict:
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}
    fm = {}
    for line in text[4:end].splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        fm[key.strip()] = value.strip()
    return fm


def parse_inline_list(value: str) -> list[str]:
    cleaned = (value or "").strip()
    if not cleaned.startswith("[") or not cleaned.endswith("]"):
        return []
    return [item.strip().strip('"').strip("'") for item in cleaned[1:-1].split(",") if item.strip()]


def parse_post_date(fm: dict) -> date | None:
    raw = fm.get("date", "").strip().strip('"').strip("'")
    if not raw:
        return None
    try:
        return date.fromisoformat(raw[:10])
    except ValueError:
        return None


def load_signal_ids() -> list[str]:
    ids = []
    for line in SIGNALS_FILE.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped.startswith("- id:"):
            ids.append(stripped.split(":", 1)[1].strip().strip('"').strip("'"))
    return ids


def tally_stances(signal_ids: list[str]) -> dict[str, dict]:
    """Returns {signal_id: {supports, contradicts, mixed, mentions,
                            recent_score, older_score}} weighted scores."""
    today = date.today()
    recent_cutoff = today - timedelta(days=RECENT_DAYS)
    older_cutoff  = today - timedelta(days=OLDER_DAYS)

    tallies: dict[str, dict] = {
        sid: {
            "supports": 0, "contradicts": 0, "mixed": 0, "mentions": 0,
            "recent_score": 0.0, "older_score": 0.0,
        }
        for sid in signal_ids
    }

    for path in POSTS_DIR.glob("*.md"):
        fm = parse_front_matter(path.read_text(encoding="utf-8"))
        if fm.get("article_type", "").strip('"') == "theory":
            continue
        ids = parse_inline_list(fm.get("signal_ids", ""))
        if not ids:
            continue
        stance     = fm.get("signal_stance", "mentions").strip().strip('"').strip("'")
        confidence = fm.get("signal_confidence", "low").strip().strip('"').strip("'")
        weight     = CONFIDENCE_WEIGHT.get(confidence, 1)
        post_date  = parse_post_date(fm)

        for sid in ids:
            if sid not in tallies:
                continue
            t = tallies[sid]
            if stance in t:
                t[stance] += weight

            # Momentum scoring: only supporting/contradicting stances count
            if stance in ("supports", "contradicts") and post_date is not None:
                signed = weight if stance == "supports" else -weight
                if post_date >= recent_cutoff:
                    t["recent_score"] += signed
                elif post_date >= older_cutoff:
                    t["older_score"] += signed

    return tallies


def derive_status(tally: dict) -> str:
    s = tally["supports"]
    c = tally["contradicts"]

    if s == 0 and c == 0:
        return "emerging"
    if c > s:
        return "challenged"
    if s >= 2 * c:
        return "supported"
    return "mixed"


def derive_momentum(tally: dict) -> str:
    recent = tally["recent_score"]
    older  = tally["older_score"]

    # No activity at all → stable
    if recent == 0 and older == 0:
        return "stable"

    # Activity appearing in recent window where there was none → rising
    if older == 0 and recent > 0:
        return "rising"

    # Activity disappearing → declining
    if recent == 0 and older > 0:
        return "declining"

    # Compare absolute magnitudes
    abs_recent = abs(recent)
    abs_older  = abs(older)

    if abs_recent >= MOMENTUM_THRESHOLD * abs_older:
        return "rising"
    if abs_older >= MOMENTUM_THRESHOLD * abs_recent:
        return "declining"
    return "stable"


def update_signals_yml(
    new_statuses: dict[str, str],
    new_momentums: dict[str, str],
) -> bool:
    """Update current_status and momentum lines in signals.yml in-place.
    Returns True if any change was made."""
    text = SIGNALS_FILE.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)

    current_signal_id = None
    changed = False
    updated_lines = []
    seen_momentum: set[str] = set()
    pending_momentum_inject: str | None = None  # momentum line to inject after description

    for line in lines:
        id_match = re.match(r"^- id:\s*(\S+)", line)
        if id_match:
            current_signal_id = id_match.group(1).strip('"\'')
            pending_momentum_inject = None

        # Update current_status
        status_match = re.match(r"^(\s*current_status:\s*)(\S+)", line)
        if status_match and current_signal_id in new_statuses:
            new_status = new_statuses[current_signal_id]
            old_status = status_match.group(2)
            if old_status != new_status:
                line = f"{status_match.group(1)}{new_status}\n"
                changed = True
                print(f"  {current_signal_id}: status {old_status} → {new_status}")

        # Update existing momentum line
        momentum_match = re.match(r"^(\s*momentum:\s*)(\S+)", line)
        if momentum_match and current_signal_id in new_momentums:
            new_mom = new_momentums[current_signal_id]
            old_mom = momentum_match.group(2)
            if old_mom != new_mom:
                line = f"{momentum_match.group(1)}{new_mom}\n"
                changed = True
                print(f"  {current_signal_id}: momentum {old_mom} → {new_mom}")
            seen_momentum.add(current_signal_id)

        updated_lines.append(line)

        # After description line, inject momentum if not yet present for this signal
        desc_match = re.match(r"^\s*description:", line)
        if desc_match and current_signal_id and current_signal_id not in seen_momentum:
            if current_signal_id in new_momentums:
                mom = new_momentums[current_signal_id]
                updated_lines.append(f"  momentum: {mom}\n")
                seen_momentum.add(current_signal_id)
                changed = True
                print(f"  {current_signal_id}: momentum added → {mom}")

    if changed:
        SIGNALS_FILE.write_text("".join(updated_lines), encoding="utf-8")

    return changed


def main() -> int:
    signal_ids = load_signal_ids()
    tallies = tally_stances(signal_ids)

    new_statuses  = {}
    new_momentums = {}
    for sid in signal_ids:
        new_statuses[sid]  = derive_status(tallies[sid])
        new_momentums[sid] = derive_momentum(tallies[sid])

    print("Derived statuses + momentum:")
    for sid in signal_ids:
        t = tallies[sid]
        print(
            f"  {sid}: {new_statuses[sid]}  "
            f"(supports={t['supports']}, contradicts={t['contradicts']}, "
            f"mixed={t['mixed']}, mentions={t['mentions']})  "
            f"momentum={new_momentums[sid]}  "
            f"[recent={t['recent_score']:.1f}, older={t['older_score']:.1f}]"
        )

    changed = update_signals_yml(new_statuses, new_momentums)
    if changed:
        print("signals.yml updated.")
    else:
        print("No status/momentum changes needed.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
