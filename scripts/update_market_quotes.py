#!/usr/bin/env python3
"""
update_market_quotes.py
=======================
Fetches live quotes for every ticker tracked on the LocReport
State of the Market page and writes the result to
assets/data/market_quotes.json, which the page reads directly.

Run by GitHub Actions on a schedule (see .github/workflows/market-quotes.yml).
No API key required — uses yfinance (Yahoo Finance, server-side, no CORS).
"""

import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

try:
    import yfinance as yf
except ImportError:
    print("ERROR: yfinance not installed.  Run: pip install yfinance")
    sys.exit(1)

# ── Ticker registry ──────────────────────────────────────────────────
TICKERS = [
    # Big Tech
    "GOOGL", "MSFT", "BIDU", "035420.KS", "0700.HK",
    # Language Learning
    "DUOL",
    # Media & Content
    "NFLX", "SPOT",
    # Enterprise Software
    "ADBE", "ORCL", "SAP",
    # BPO & Staffing
    "TEP.PA", "AMN", "TASK", "INFY", "WIT",
    # Language Services (pure-play)
    "RWS.L", "ZOO.L", "APX.AX", "AIM.AX", "STG.AX",
    "2483.T", "6182.T", "7812.T",
    "300080.KQ", "VQS.V", "ONEI", "SUL.WA", "STAR7.MI",
    # AI & Data
    "301236.SZ",
]

# Constituents for the industry index chart.
# All US-listed → same trading hours → clean time series alignment.
INDEX_TICKERS = {
    "GOOGL", "MSFT", "NFLX", "DUOL",
    "ADBE", "ORCL", "SPOT", "TASK", "INFY", "WIT",
}

MAX_WORKERS = 8   # parallel fetches


def fetch_one(symbol: str) -> tuple:
    """
    Fetch quote + optional 5-day hourly series for one symbol.
    Returns (symbol, quote_dict | None, series_dict | None).
    """
    try:
        t = yf.Ticker(symbol)
        fi = t.fast_info

        price = fi.last_price
        prev  = fi.previous_close

        if price is None or prev is None:
            print(f"  [{symbol}] skipped — no price data")
            return symbol, None, None

        price = float(price)
        prev  = float(prev)
        chg   = price - prev
        chg_pct = (chg / prev * 100) if prev else 0.0

        # Currency
        currency = ""
        try:
            currency = fi.currency or ""
        except Exception:
            pass

        # Market cap (best-effort)
        market_cap = None
        try:
            mc = fi.market_cap
            if mc:
                market_cap = int(mc)
        except Exception:
            pass

        quote = {
            "price":      round(price,   4),
            "change":     round(chg,     4),
            "change_pct": round(chg_pct, 4),
            "prev_close": round(prev,    4),
            "currency":   currency,
            "market_cap": market_cap,
        }

        # 5-day hourly series (index constituents only)
        series = None
        if symbol in INDEX_TICKERS:
            hist = t.history(period="5d", interval="1h", auto_adjust=True)
            if not hist.empty:
                closes = hist["Close"].dropna()
                if not closes.empty:
                    series = {
                        "timestamps": [int(ts.timestamp()) for ts in closes.index],
                        "closes":     [round(float(c), 4) for c in closes.values],
                    }

        return symbol, quote, series

    except Exception as exc:
        print(f"  [{symbol}] error: {exc}")
        return symbol, None, None


def main():
    repo_root = os.path.join(os.path.dirname(__file__), "..")
    out_dir   = os.path.join(repo_root, "assets", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path  = os.path.join(out_dir, "market_quotes.json")

    quotes       = {}
    index_series = {}

    print(f"Fetching {len(TICKERS)} tickers with {MAX_WORKERS} workers …\n")
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(fetch_one, t): t for t in TICKERS}
        for fut in as_completed(futures):
            symbol, quote, series = fut.result()
            if quote:
                quotes[symbol] = quote
                print(f"  ✓ {symbol:<14} "
                      f"{quote['currency']:<4} "
                      f"{quote['price']:>12.4f}  "
                      f"{quote['change_pct']:>+7.2f}%")
            if series:
                index_series[symbol] = series

    payload = {
        "updated_at":   datetime.now(timezone.utc).isoformat(),
        "quotes":       quotes,
        "index_series": index_series,
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, separators=(",", ":"))

    print(f"\n✓ {len(quotes)} quotes, {len(index_series)} series → {out_path}")


if __name__ == "__main__":
    main()
