# locnews

## Signal Tracker

This repository now includes the files needed to ship the Signal Tracker feature:

- `signals.md` – website page that displays tracked signals and linked evidence posts.
- `_data/signals.yml` – canonical signal registry.
- `scripts/validate_signal_metadata.py` – validation for signal front matter in posts.
- `scripts/generate_monthly_summary.py` – now appends a "Signal Tracker Updates" section when monthly posts include tagged signal evidence.

### Validate signal metadata

```bash
python scripts/validate_signal_metadata.py
```

## Planning documents

- `docs/signal-tracker-implementation.md` – implementation proposal for Signal Tracker.
