import re
import sys
from pathlib import Path

POSTS_DIR = Path("_posts")
SIGNALS_FILE = Path("_data/signals.yml")
ALLOWED_STANCES = {"supports", "contradicts", "mixed", "mentions"}
ALLOWED_CONFIDENCE = {"low", "medium", "high"}


def parse_front_matter(content: str) -> dict:
    if not content.startswith("---\n"):
        return {}
    end = content.find("\n---\n", 4)
    if end == -1:
        return {}
    fm_text = content[4:end]
    fm = {}
    for line in fm_text.splitlines():
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


def load_signal_ids() -> set[str]:
    if not SIGNALS_FILE.exists():
        return set()
    ids = set()
    for raw in SIGNALS_FILE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line.startswith("- id:"):
            ids.add(line.split(":", 1)[1].strip().strip('"').strip("'"))
    return ids


def check_link_floor(path: Path, content: str) -> str | None:
    body = content[content.find("\n---\n", 4) + 5:] if "\n---\n" in content[4:] else content
    words = len(body.split())
    links = len(re.findall(r'\[.+?\]\(.+?\)', body))
    if words >= 1500 and links < 3:
        return f"[WARN] {path}: feature article ({words}w) has only {links} build-time link(s)"
    if words >= 800 and links < 1:
        return f"[WARN] {path}: standard article ({words}w) has no build-time links"
    return None


def main() -> int:
    known_ids = load_signal_ids()
    errors = []
    warnings = []

    for path in sorted(POSTS_DIR.glob("*.md")):
        raw = path.read_text(encoding="utf-8")
        fm = parse_front_matter(raw)
        signal_ids = parse_inline_list(fm.get("signal_ids", ""))

        warn = check_link_floor(path, raw)
        if warn:
            warnings.append(warn)
        if not signal_ids:
            continue

        unknown = [sid for sid in signal_ids if sid not in known_ids]
        if unknown:
            errors.append(f"{path}: unknown signal_ids {unknown}")

        stance = fm.get("signal_stance", "mentions").strip().strip('"').strip("'")
        if stance not in ALLOWED_STANCES:
            errors.append(f"{path}: invalid signal_stance '{stance}'")

        confidence = fm.get("signal_confidence", "").strip().strip('"').strip("'")
        if confidence and confidence not in ALLOWED_CONFIDENCE:
            errors.append(f"{path}: invalid signal_confidence '{confidence}'")

    if warnings:
        for w in warnings:
            print(w)

    if errors:
        print("Signal metadata validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Signal metadata validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
