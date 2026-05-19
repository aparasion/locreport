#!/usr/bin/env python3
"""
Fetch current LLM pricing from the OpenRouter public API and update
_data/llm_pricing.yml. No API key required.

OpenRouter returns costs in USD per token; we convert to USD per 1M tokens
to match the format stored in the YAML.

Run:
    python scripts/update_llm_pricing.py

Models with `manual: true` are skipped entirely and kept as-is.
"""

import json
import sys
from datetime import date
from pathlib import Path

import requests
import yaml

OPENROUTER_API = "https://openrouter.ai/api/v1/models"
DATA_FILE = Path(__file__).parent.parent / "_data" / "llm_pricing.yml"
TODAY = date.today().isoformat()


def fetch_openrouter_prices() -> dict[str, dict]:
    """Return a dict keyed by openrouter model id with pricing data."""
    resp = requests.get(OPENROUTER_API, timeout=15)
    resp.raise_for_status()
    models = resp.json().get("data", [])
    result = {}
    for m in models:
        mid = m.get("id", "")
        pricing = m.get("pricing", {})
        try:
            # OpenRouter pricing is per-token; multiply by 1M for our format
            prompt_cost  = float(pricing.get("prompt", 0)) * 1_000_000
            compl_cost   = float(pricing.get("completion", 0)) * 1_000_000
        except (TypeError, ValueError):
            continue
        if prompt_cost > 0 or compl_cost > 0:
            result[mid] = {
                "input_cost_per_1m":  round(prompt_cost, 4),
                "output_cost_per_1m": round(compl_cost, 4),
            }
    return result


def main():
    if not DATA_FILE.exists():
        print(f"ERROR: {DATA_FILE} not found", file=sys.stderr)
        sys.exit(1)

    with DATA_FILE.open("r", encoding="utf-8") as f:
        models = yaml.safe_load(f)

    print(f"Fetching prices from {OPENROUTER_API} …")
    try:
        prices = fetch_openrouter_prices()
    except requests.RequestException as exc:
        print(f"ERROR: could not fetch OpenRouter data: {exc}", file=sys.stderr)
        sys.exit(1)

    print(f"  Retrieved prices for {len(prices)} models from OpenRouter")

    changed = 0
    for model in models:
        if model.get("manual"):
            print(f"  SKIP  {model['id']} (manual=true)")
            continue

        or_id = model.get("openrouter_id")
        if not or_id:
            print(f"  SKIP  {model['id']} (no openrouter_id)")
            continue

        if or_id not in prices:
            print(f"  MISS  {model['id']} — '{or_id}' not found in OpenRouter response")
            continue

        new_in  = prices[or_id]["input_cost_per_1m"]
        new_out = prices[or_id]["output_cost_per_1m"]

        prev_in  = float(model.get("input_cost_per_1m", 0))
        prev_out = float(model.get("output_cost_per_1m", 0))

        if new_in != prev_in or new_out != prev_out:
            print(
                f"  UPDATE {model['id']}: "
                f"in ${prev_in} → ${new_in}, "
                f"out ${prev_out} → ${new_out}"
            )
            model["input_cost_per_1m"]  = new_in
            model["output_cost_per_1m"] = new_out
            model["last_updated"] = TODAY
            changed += 1
        else:
            print(f"  OK    {model['id']} (unchanged)")

    if changed == 0:
        print("No pricing changes detected — YAML unchanged.")
        sys.exit(0)

    print(f"\nWriting {changed} update(s) to {DATA_FILE} …")
    with DATA_FILE.open("w", encoding="utf-8") as f:
        yaml.dump(
            models,
            f,
            default_flow_style=False,
            allow_unicode=True,
            sort_keys=False,
        )
    print("Done.")


if __name__ == "__main__":
    main()
