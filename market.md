---
layout: default
title: LocStock
permalink: /market/
description: "LocStock — The Localization Market Index. Live equity overview of publicly traded companies with exposure to language services, AI translation, and localization technology."
nav: true
nav_order: 4
---

<style>
/* ═══════════════════════════════════════════════════════════
   LocStock — LocReport
   ═══════════════════════════════════════════════════════════ */

/* ── Hero ──────────────────────────────────────────────────── */
.market-hero { padding: var(--space-7) 0 var(--space-4); }
.market-hero h1 { margin: 0 0 var(--space-1); font-size: clamp(1.8rem, 4vw, 2.6rem); }
.market-hero-tagline { margin: 0 0 var(--space-2); color: var(--muted); font-size: 0.85rem; font-family: var(--font-display); letter-spacing: 0.04em; text-transform: uppercase; }

.market-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.market-subtitle {
  color: var(--muted);
  font-size: 0.91rem;
  margin: 0;
  line-height: 1.55;
}
.market-subtitle strong { color: var(--text); }

/* ── Refresh Button ────────────────────────────────────────── */
.market-refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  font-size: 0.8rem;
  font-family: var(--font-display);
  font-weight: 600;
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s, background 0.18s;
  white-space: nowrap;
  flex-shrink: 0;
}
.market-refresh-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-soft);
}
.market-refresh-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
.market-refresh-btn.spinning svg { animation: mkt-spin 0.7s linear infinite; }
@keyframes mkt-spin { to { transform: rotate(360deg); } }

/* ── Stats Bar ─────────────────────────────────────────────── */
.market-stats-bar {
  display: flex;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: var(--space-5);
}
.market-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: var(--space-4) var(--space-3);
  border-right: 1px solid var(--border);
  min-width: 0;
}
.market-stat:last-child { border-right: none; }
.market-stat-value {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.5rem;
  color: var(--text);
  line-height: 1;
  letter-spacing: -0.04em;
}
.market-stat-value.up   { color: #22c55e; }
.market-stat-value.down { color: #ef4444; }
[data-theme="dark"] .market-stat-value.up   { color: #4ade80; }
[data-theme="dark"] .market-stat-value.down { color: #f87171; }
.market-stat-label {
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--muted);
  white-space: nowrap;
}

/* ── Filter Pills ──────────────────────────────────────────── */
.market-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}
.market-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 100px;
  color: var(--muted);
  font-family: var(--font-display);
  font-size: 0.79rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s, background 0.18s;
}
.market-filter-btn:hover {
  color: var(--text);
  border-color: var(--accent-light);
  background: var(--accent-soft);
}
.market-filter-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.market-filter-count {
  font-size: 0.69rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.22);
  line-height: 1.5;
}
.market-filter-btn:not(.active) .market-filter-count {
  background: var(--bg-secondary);
  color: var(--muted);
}

/* ── Mosaic Grid ───────────────────────────────────────────── */
.market-mosaic {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}

/* ── Cards ─────────────────────────────────────────────────── */
.market-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  position: relative;
  overflow: hidden;
  min-height: 148px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.market-card:hover { transform: translateY(-2px); box-shadow: var(--card-shadow-hover); }
.market-card.featured { grid-column: span 2; min-height: 168px; }
.market-card.hidden   { display: none; }

/* Direction accent bar */
.market-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.3s;
}
.market-card.up::before   { background: linear-gradient(90deg, #22c55e, transparent 70%); opacity: 1; }
.market-card.down::before { background: linear-gradient(90deg, #ef4444, transparent 70%); opacity: 1; }

.market-card.up      { border-color: rgba(34, 197, 94, 0.22); }
.market-card.down    { border-color: rgba(239, 68, 68, 0.22); }
.market-card.warning { border-color: rgba(245, 158, 11, 0.30); }

/* Loading skeleton */
.market-card.loading { pointer-events: none; }
.market-skeleton { display: flex; flex-direction: column; gap: 9px; padding-top: 2px; }
.mkt-skel {
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--border) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: mkt-shimmer 1.6s ease-in-out infinite;
}
.mkt-skel.h16 { height: 16px; }
.mkt-skel.h28 { height: 28px; }
.mkt-skel.w30 { width: 30%; }
.mkt-skel.w45 { width: 45%; }
.mkt-skel.w65 { width: 65%; }
.mkt-skel.w80 { width: 80%; }
@keyframes mkt-shimmer {
  0%   { background-position:  200% 0; }
  100% { background-position: -200% 0; }
}

/* Card top row: exchange + change badge */
.market-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4px;
}
.market-card-exchange {
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 1.2;
  flex-wrap: wrap;
}
.market-card-flag  { font-size: 0.82rem; line-height: 1; }
.market-card-state {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--border);
  flex-shrink: 0;
  margin-top: 1px;
}
.market-card-state.open { background: #22c55e; }

.market-change-badge {
  font-size: 0.7rem;
  font-weight: 800;
  font-family: var(--font-display);
  padding: 3px 7px;
  border-radius: 6px;
  white-space: nowrap;
  letter-spacing: -0.01em;
  flex-shrink: 0;
}
.market-change-badge.up   { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
.market-change-badge.down { background: rgba(239, 68, 68, 0.12); color: #dc2626; }
.market-change-badge.flat { background: var(--bg-secondary);     color: var(--muted); }
[data-theme="dark"] .market-change-badge.up   { background: rgba(34, 197, 94, 0.16); color: #4ade80; }
[data-theme="dark"] .market-change-badge.down { background: rgba(239, 68, 68, 0.16); color: #f87171; }

/* Ticker + name */
.market-card-ticker {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.2rem;
  color: var(--accent);
  letter-spacing: -0.03em;
  line-height: 1;
  margin-top: 2px;
}
.market-card.featured .market-card-ticker { font-size: 1.55rem; }

.market-card-name {
  font-size: 0.73rem;
  color: var(--muted);
  line-height: 1.35;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Price block */
.market-card-price-block {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.market-card-price {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.45rem;
  color: var(--text);
  letter-spacing: -0.04em;
  line-height: 1;
}
.market-card.featured .market-card-price { font-size: 1.85rem; }

.market-card-change-abs {
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--font-display);
  letter-spacing: -0.01em;
}
.market-card-change-abs.up   { color: #16a34a; }
.market-card-change-abs.down { color: #dc2626; }
.market-card-change-abs.flat { color: var(--muted); }
[data-theme="dark"] .market-card-change-abs.up   { color: #4ade80; }
[data-theme="dark"] .market-card-change-abs.down { color: #f87171; }

.market-card-cap { font-size: 0.66rem; color: var(--muted); margin-top: 1px; }

/* Warning badge */
.market-card-warn-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(245, 158, 11, 0.10);
  color: #b45309;
  border: 1px solid rgba(245, 158, 11, 0.25);
  margin-top: auto;
  width: fit-content;
}
[data-theme="dark"] .market-card-warn-badge { color: #fbbf24; background: rgba(245, 158, 11, 0.15); }

.market-card-nodata {
  font-size: 0.71rem;
  color: var(--muted);
  font-style: italic;
  margin-top: auto;
}

/* ── Delisted Section ──────────────────────────────────────── */
.market-delisted-section {
  margin-top: var(--space-7);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border);
}
.market-delisted-section h2 {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin: 0 0 var(--space-4);
}
.market-delisted-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: var(--space-3);
}
.market-delisted-card {
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  opacity: 0.55;
  transition: opacity 0.2s;
}
.market-delisted-card:hover { opacity: 0.82; }
.market-delisted-ticker {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--muted);
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 5px;
}
.market-delisted-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 3px;
}
.market-delisted-meta   { font-size: 0.68rem; color: var(--muted); }
.market-delisted-reason {
  font-size: 0.67rem;
  color: var(--muted);
  font-style: italic;
  margin-top: 6px;
}

/* ── Notes ─────────────────────────────────────────────────── */
.market-notes {
  margin-top: var(--space-7);
  padding: var(--space-5);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: 0.79rem;
  color: var(--muted);
  line-height: 1.65;
}
.market-notes p { margin: 0 0 var(--space-2); }
.market-notes p:last-child { margin: 0; }
.market-notes strong { color: var(--text); font-weight: 600; }

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 960px) {
  .market-mosaic { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
}
@media (max-width: 700px) {
  .market-mosaic { grid-template-columns: repeat(3, 1fr); gap: var(--space-2); }
  .market-stats-bar { flex-wrap: wrap; }
  .market-stat {
    min-width: calc(50% - 1px);
    border-bottom: 1px solid var(--border);
  }
  .market-stat:nth-last-child(-n+2) { border-bottom: none; }
  .market-stat-value { font-size: 1.25rem; }
}
@media (max-width: 480px) {
  .market-mosaic { grid-template-columns: repeat(2, 1fr); }
  .market-card.featured { grid-column: span 2; }
  .market-card-price { font-size: 1.2rem; }
  .market-card.featured .market-card-price { font-size: 1.45rem; }
  .market-card.featured .market-card-ticker { font-size: 1.3rem; }
}
@media (max-width: 360px) {
  .market-mosaic { grid-template-columns: 1fr; }
  .market-card.featured { grid-column: span 1; }
}

/* ── Industry Index Chart ──────────────────────────────────── */
.market-index-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  margin-bottom: var(--space-5);
}
.market-index-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}
.market-index-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text);
}
.market-index-meta {
  font-size: 0.68rem;
  color: var(--muted);
  margin-bottom: var(--space-3);
  line-height: 1.4;
}
/* ── Period picker ─────────────────────────────────────────── */
.mkt-period-btns {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.mkt-period-btn {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  line-height: 1.4;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.mkt-period-btn:hover {
  color: var(--text);
  border-color: var(--accent-light);
  background: var(--accent-soft);
}
.mkt-period-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.market-index-chart-wrap {
  position: relative;
  height: 180px;
}
.market-index-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
  font-size: 0.78rem;
  color: var(--muted);
  font-style: italic;
}
</style>

<!-- ── Hero ──────────────────────────────────────────────── -->
<div class="market-hero">
  <h1>LocStock</h1>
  <p class="market-hero-tagline">The Localization Market Index</p>
</div>

<div class="market-header-row">
  <p class="market-subtitle">
    Live equity overview of <strong>29 publicly traded companies</strong> with exposure to language
    services, AI translation, and localization technology across 13 global exchanges.<br>
    Last updated: <span id="mkt-updated">Loading…</span>
  </p>
  <button class="market-refresh-btn" id="mkt-refresh-btn" type="button" aria-label="Refresh market quotes">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
    Refresh
  </button>
</div>

<!-- ── Stats Bar ─────────────────────────────────────────── -->
<div class="market-stats-bar">
  <div class="market-stat">
    <span class="market-stat-value" id="stat-total">29</span>
    <span class="market-stat-label">Tracked</span>
  </div>
  <div class="market-stat">
    <span class="market-stat-value up" id="stat-up">—</span>
    <span class="market-stat-label">Advancing</span>
  </div>
  <div class="market-stat">
    <span class="market-stat-value down" id="stat-down">—</span>
    <span class="market-stat-label">Declining</span>
  </div>
  <div class="market-stat">
    <span class="market-stat-value" id="stat-flat">—</span>
    <span class="market-stat-label">Unchanged</span>
  </div>
  <div class="market-stat">
    <span class="market-stat-value" id="stat-exchanges">14</span>
    <span class="market-stat-label">Exchanges</span>
  </div>
</div>

<!-- ── Category Filters ──────────────────────────────────── -->
<div class="market-filters" id="mkt-filters" role="group" aria-label="Filter by category">
  <button class="market-filter-btn active" data-cat="all">All <span class="market-filter-count">29</span></button>
  <button class="market-filter-btn" data-cat="lsp">Language Services <span class="market-filter-count">12</span></button>
  <button class="market-filter-btn" data-cat="bigtech">Big Tech <span class="market-filter-count">5</span></button>
  <button class="market-filter-btn" data-cat="media">Media &amp; Content <span class="market-filter-count">2</span></button>
  <button class="market-filter-btn" data-cat="enterprise">Enterprise Software <span class="market-filter-count">3</span></button>
  <button class="market-filter-btn" data-cat="bpo">BPO &amp; Staffing <span class="market-filter-count">5</span></button>
  <button class="market-filter-btn" data-cat="learning">Language Learning <span class="market-filter-count">1</span></button>
  <button class="market-filter-btn" data-cat="aidata">AI &amp; Data <span class="market-filter-count">1</span></button>
</div>

<!-- ── Industry Index Chart ──────────────────────────────── -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
<div class="market-index-panel" id="mkt-index-panel">
  <div class="market-index-header">
    <span class="market-index-title" id="mkt-index-title">LocStock Index</span>
    <div class="mkt-period-btns" id="mkt-period-btns">
      <button class="mkt-period-btn active" data-period="30d" type="button">30D</button>
      <button class="mkt-period-btn" data-period="ytd" type="button">YTD</button>
      <!-- year buttons injected by JS after data loads -->
    </div>
  </div>
  <div class="market-index-meta" id="mkt-index-meta">Equal-weighted &middot; base&nbsp;100 at period start</div>
  <div class="market-index-chart-wrap">
    <canvas id="mkt-index-chart" aria-label="Language services industry index chart" role="img"></canvas>
    <div class="market-index-empty" id="mkt-index-empty" style="display:none">Chart data loads after the first scheduled update.</div>
  </div>
</div>

<!-- ── Mosaic Grid ────────────────────────────────────────── -->
<div class="market-mosaic" id="mkt-mosaic" aria-live="polite" aria-label="Market overview tiles">
  <!-- Populated by JavaScript -->
</div>

<!-- ── Delisted / Historical ─────────────────────────────── -->
<div class="market-delisted-section">
  <h2>Historical &amp; Delisted</h2>
  <div class="market-delisted-grid">
    <div class="market-delisted-card">
      <div class="market-delisted-ticker">KWS</div>
      <div class="market-delisted-name">Keywords Studios plc</div>
      <div class="market-delisted-meta">LSE AIM · Ireland / UK</div>
      <div class="market-delisted-reason">Delisted Oct 2024 · Acquired</div>
    </div>
    <div class="market-delisted-card">
      <div class="market-delisted-ticker">TIXT</div>
      <div class="market-delisted-name">TELUS International</div>
      <div class="market-delisted-meta">NYSE / TSX · Canada</div>
      <div class="market-delisted-reason">Delisted Oct 2024</div>
    </div>
    <div class="market-delisted-card">
      <div class="market-delisted-ticker">STIX</div>
      <div class="market-delisted-name">Semantix Inc.</div>
      <div class="market-delisted-meta">NASDAQ · Brazil</div>
      <div class="market-delisted-reason">Delisted Apr 2024</div>
    </div>
    <div class="market-delisted-card">
      <div class="market-delisted-ticker">SDL</div>
      <div class="market-delisted-name">SDL plc</div>
      <div class="market-delisted-meta">LSE · United Kingdom</div>
      <div class="market-delisted-reason">Acquired by RWS 2021</div>
    </div>
    <div class="market-delisted-card">
      <div class="market-delisted-ticker">—</div>
      <div class="market-delisted-name">Lionbridge Technologies</div>
      <div class="market-delisted-meta">NASDAQ · United States</div>
      <div class="market-delisted-reason">Taken private 2016</div>
    </div>
    <div class="market-delisted-card">
      <div class="market-delisted-ticker">SUL</div>
      <div class="market-delisted-name">Summa Linguae S.A.</div>
      <div class="market-delisted-meta">WSE · Poland</div>
      <div class="market-delisted-reason">Delisted Aug 2023 · Taken private</div>
    </div>
  </div>
</div>

<!-- ── Notes ─────────────────────────────────────────────── -->
<div class="market-notes">
  <p><strong>Market data</strong> is refreshed automatically every 30 minutes on trading days (Mon–Fri). Prices are displayed in each company's native trading currency — GBp (pence) for LSE stocks, JPY for the Tokyo Stock Exchange, KRW for Korean exchanges, and so on. Market cap is shown in local currency where reported.</p>
  <p><strong>Coverage scope</strong> includes pure-play language services companies, major technology platforms with significant translation and NLP exposure, media companies that are large buyers of localization, enterprise software providers with localization tooling, and AI data annotation companies.</p>
  <p>Data may be delayed. This page is for informational purposes only and does not constitute financial advice.</p>
</div>

<script>
/* ════════════════════════════════════════════════════════════
   LocStock — LocReport
   Data fetched server-side by GitHub Actions → market_quotes.json
   ════════════════════════════════════════════════════════════ */
(function () {
"use strict";

/* ── Company registry ────────────────────────────────────── */
// t = Yahoo Finance ticker, s = display ticker, n = full name,
// ex = exchange label, co = country code, cat = category,
// ft = featured (span 2 cols), warn = warning text
var COMPANIES = [
  /* ─ Featured — Big Tech ─ */
  { t:"GOOGL",      s:"GOOGL",   n:"Alphabet (Google)",      ex:"NASDAQ",         co:"US", cat:"bigtech",    ft:true  },
  { t:"MSFT",       s:"MSFT",    n:"Microsoft Corporation",  ex:"NASDAQ",         co:"US", cat:"bigtech",    ft:true  },
  /* ─ Featured — Media ─ */
  { t:"NFLX",       s:"NFLX",    n:"Netflix Inc.",           ex:"NASDAQ",         co:"US", cat:"media",      ft:true  },
  /* ─ Featured — Language Learning ─ */
  { t:"DUOL",       s:"DUOL",    n:"Duolingo Inc.",          ex:"NASDAQ",         co:"US", cat:"learning",   ft:true  },
  /* ─ Featured — LSP anchor ─ */
  { t:"RWS.L",      s:"RWS",     n:"RWS Holdings plc",       ex:"LSE",            co:"UK", cat:"lsp",        ft:true  },
  /* ─ Big Tech (continued) ─ */
  { t:"BIDU",       s:"BIDU",    n:"Baidu Inc.",             ex:"NASDAQ",         co:"CN", cat:"bigtech"            },
  { t:"035420.KS",  s:"NAVER",   n:"Naver Corporation",      ex:"KRX",            co:"KR", cat:"bigtech"            },
  { t:"0700.HK",    s:"0700",    n:"Tencent Holdings",       ex:"HKEX",           co:"HK", cat:"bigtech"            },
  /* ─ Media ─ */
  { t:"SPOT",       s:"SPOT",    n:"Spotify Technology S.A.",ex:"NYSE",           co:"SE", cat:"media"              },
  /* ─ Enterprise Software ─ */
  { t:"ADBE",       s:"ADBE",    n:"Adobe Inc.",             ex:"NASDAQ",         co:"US", cat:"enterprise"         },
  { t:"ORCL",       s:"ORCL",    n:"Oracle Corporation",     ex:"NYSE",           co:"US", cat:"enterprise"         },
  { t:"SAP",        s:"SAP",     n:"SAP SE",                 ex:"NYSE",           co:"DE", cat:"enterprise"         },
  /* ─ BPO & Staffing ─ */
  { t:"TEP.PA",     s:"TEP",     n:"Teleperformance SE",     ex:"Euronext Paris", co:"FR", cat:"bpo"                },
  { t:"AMN",        s:"AMN",     n:"AMN Healthcare Services",ex:"NYSE",           co:"US", cat:"bpo"                },
  { t:"TASK",       s:"TASK",    n:"TaskUs Inc.",            ex:"NASDAQ",         co:"US", cat:"bpo"                },
  { t:"INFY",       s:"INFY",    n:"Infosys Ltd",            ex:"NYSE",           co:"IN", cat:"bpo"                },
  { t:"WIT",        s:"WIT",     n:"Wipro Ltd",              ex:"NYSE",           co:"IN", cat:"bpo"                },
  /* ─ Language Services ─ */
  { t:"ZOO.L",      s:"ZOO",     n:"ZOO Digital Group plc",  ex:"LSE AIM",        co:"UK", cat:"lsp"                },
  { t:"APX.AX",     s:"APX",     n:"Appen Limited",          ex:"ASX",            co:"AU", cat:"lsp"                },
  { t:"AIM.AX",     s:"AIM",     n:"Ai-Media Technologies",  ex:"ASX",            co:"AU", cat:"lsp"                },
  { t:"STG.AX",     s:"STG",     n:"Straker Limited",        ex:"ASX",            co:"NZ", cat:"lsp"                },
  { t:"2483.T",     s:"2483",    n:"Honyaku Center Inc.",    ex:"TSE",            co:"JP", cat:"lsp"                },
  { t:"6182.T",     s:"6182",    n:"Metareal Corp.",         ex:"TSE",            co:"JP", cat:"lsp"                },
  { t:"7812.T",     s:"7812",    n:"CRESTEC Inc.",           ex:"TSE",            co:"JP", cat:"lsp"                },
  { t:"300080.KQ",  s:"300080",  n:"Flitto Inc.",            ex:"KOSDAQ",         co:"KR", cat:"lsp"                },
  { t:"VQS.V",      s:"VQS",     n:"VIQ Solutions Inc.",     ex:"TSX-V",          co:"CA", cat:"lsp"                },
  { t:"ONEI",       s:"ONEI",    n:"OneMeta Inc.",           ex:"OTCQB",          co:"US", cat:"lsp"                },
  { t:"STAR7.MI",   s:"STAR7",   n:"STAR7 S.p.A.",           ex:"Euronext Milan", co:"IT", cat:"lsp", warn:"⚠ Delisting planned" },
  /* ─ AI & Data ─ */
  { t:"301236.SZ",  s:"301236",  n:"iSoftStone Technology",  ex:"SZSE",           co:"CN", cat:"aidata"             }
];

/* ── Country flags ───────────────────────────────────────── */
var FLAGS = {
  US:"🇺🇸", UK:"🇬🇧", AU:"🇦🇺", NZ:"🇳🇿",
  JP:"🇯🇵", KR:"🇰🇷", FR:"🇫🇷", DE:"🇩🇪",
  IN:"🇮🇳", CA:"🇨🇦", CN:"🇨🇳", HK:"🇭🇰",
  IT:"🇮🇹", PL:"🇵🇱", SE:"🇸🇪"
};

/* ── Currency symbols ────────────────────────────────────── */
var CUR = {
  USD:"$", GBp:"p",  GBP:"£", JPY:"¥",
  EUR:"€", KRW:"₩",  AUD:"A$",NZD:"NZ$",
  CAD:"C$",HKD:"HK$",PLN:"zł",CNY:"¥", CNH:"¥"
};

function symFor(currency) {
  return CUR[currency] || (currency ? currency + "\u00A0" : "$");
}

function fmtPrice(price, currency) {
  if (price == null) return "—";
  var sym = symFor(currency);
  if (currency === "JPY" || currency === "KRW") {
    return sym + Math.round(price).toLocaleString("en-US");
  }
  if (currency === "GBp") {
    return price.toFixed(2) + sym;       // e.g. "245.60p"
  }
  return sym + price.toFixed(2);
}

function fmtPct(v) {
  if (v == null) return null;
  return (v > 0 ? "+" : "") + v.toFixed(2) + "%";
}

function fmtChangeAbs(change, currency) {
  if (change == null) return null;
  var sign = change > 0 ? "+" : "";
  if (currency === "JPY" || currency === "KRW") {
    return sign + Math.round(change).toLocaleString("en-US");
  }
  var abs = Math.abs(change);
  if (currency === "GBp") {
    return sign + abs.toFixed(2) + (CUR[currency] || "");
  }
  var sym = symFor(currency);
  return (change < 0 ? "−" : sign) + sym + abs.toFixed(2);
}

function fmtCap(cap, currency) {
  if (!cap || cap <= 0) return null;
  // For GBp, marketCap is reported in pence — convert to millions of £
  var display = cap;
  var sym = currency === "GBp" ? "£" : symFor(currency);
  if (currency === "GBp") display = cap / 100;
  if (display >= 1e12) return "Cap " + sym + (display / 1e12).toFixed(2) + "T";
  if (display >= 1e9)  return "Cap " + sym + (display / 1e9).toFixed(1)  + "B";
  if (display >= 1e6)  return "Cap " + sym + (display / 1e6).toFixed(0)  + "M";
  return null;
}

function dirOf(v) {
  if (v == null) return "flat";
  return v > 0 ? "up" : v < 0 ? "down" : "flat";
}

/* ── Build a lookup map ──────────────────────────────────── */
var coMap = Object.create(null);
COMPANIES.forEach(function (c) { coMap[c.t] = c; });

/* ── Skeleton card ───────────────────────────────────────── */
function mkSkeleton(co) {
  var d = document.createElement("div");
  d.className = "market-card loading" + (co.ft ? " featured" : "");
  d.dataset.cat    = co.cat;
  d.dataset.ticker = co.t;
  d.innerHTML =
    '<div class="market-skeleton">' +
      '<div class="mkt-skel w45"></div>' +
      '<div class="mkt-skel h16 w65"></div>' +
      '<div class="mkt-skel w80"></div>' +
      '<div class="mkt-skel h28 w45" style="margin-top:6px;"></div>' +
      '<div class="mkt-skel w30"></div>' +
    '</div>';
  return d;
}

/* ── Live card ───────────────────────────────────────────── */
// q = { price, change, change_pct, prev_close, currency, market_cap } | null
function mkCard(co, q) {
  var dir = q ? dirOf(q.change_pct) : "flat";
  var d   = document.createElement("div");
  d.className = "market-card " + dir
    + (co.ft   ? " featured" : "")
    + (co.warn ? " warning"  : "");
  d.dataset.cat    = co.cat;
  d.dataset.ticker = co.t;

  var pct    = q ? fmtPct(q.change_pct) : null;
  var price  = q ? fmtPrice(q.price, q.currency) : "—";
  var chgAbs = q ? fmtChangeAbs(q.change, q.currency) : null;
  var cap    = q ? fmtCap(q.market_cap, q.currency) : null;
  var flag   = FLAGS[co.co] || "";

  d.innerHTML =
    '<div class="market-card-top">' +
      '<span class="market-card-exchange">' +
        '<span class="market-card-flag">' + flag + '</span>' +
        co.ex +
      '</span>' +
      (pct
        ? '<span class="market-change-badge ' + dir + '">' + pct + '</span>'
        : '') +
    '</div>' +
    '<div class="market-card-ticker">' + co.s + '</div>' +
    '<div class="market-card-name">' + co.n + '</div>' +
    '<div class="market-card-price-block">' +
      '<span class="market-card-price">' + price + '</span>' +
      (chgAbs
        ? '<span class="market-card-change-abs ' + dir + '">' + chgAbs + '</span>'
        : '') +
      (cap
        ? '<div class="market-card-cap">' + cap + '</div>'
        : '') +
    '</div>' +
    (co.warn
      ? '<span class="market-card-warn-badge">' + co.warn + '</span>'
      : '') +
    (!q
      ? '<div class="market-card-nodata">No data yet</div>'
      : '');

  return d;
}

/* ── Quotes store ────────────────────────────────────────── */
var quotes = Object.create(null);

/* ── Stats bar update ────────────────────────────────────── */
function updateStats(updatedAt) {
  var up = 0, down = 0, flat = 0;
  COMPANIES.forEach(function (co) {
    var q = quotes[co.t];
    if (!q) return;
    if (q.change_pct > 0) up++;
    else if (q.change_pct < 0) down++;
    else flat++;
  });
  var eUp  = document.getElementById("stat-up");
  var eDn  = document.getElementById("stat-down");
  var eFl  = document.getElementById("stat-flat");
  var eUpd = document.getElementById("mkt-updated");
  if (eUp)  eUp.textContent  = up;
  if (eDn)  eDn.textContent  = down;
  if (eFl)  eFl.textContent  = flat;
  if (eUpd) {
    if (updatedAt) {
      try {
        var d = new Date(updatedAt);
        eUpd.textContent = d.toLocaleString([], {
          month: "short", day: "numeric",
          hour: "2-digit", minute: "2-digit",
          timeZoneName: "short"
        });
      } catch (e) { eUpd.textContent = updatedAt; }
    } else {
      eUpd.textContent = "Scheduled update pending";
    }
  }
}

/* ── Category filter ─────────────────────────────────────── */
var activeCat = "all";

function applyFilter(cat) {
  activeCat = cat;
  var cards = document.querySelectorAll("#mkt-mosaic .market-card");
  for (var i = 0; i < cards.length; i++) {
    if (cat === "all" || cards[i].dataset.cat === cat) {
      cards[i].classList.remove("hidden");
    } else {
      cards[i].classList.add("hidden");
    }
  }
  var btns = document.querySelectorAll(".market-filter-btn");
  for (var j = 0; j < btns.length; j++) {
    btns[j].classList.toggle("active", btns[j].dataset.cat === cat);
  }
  if (indexSeriesData) {
    renderIndexChart(indexSeriesData, activePeriod, tickersForCat(cat));
  }
}

/* ── Industry Index Chart ────────────────────────────────── */
var chartInstance   = null;
var indexSeriesData = null;   // cached for period switching
var activePeriod    = "30d";

/* ── Category display labels ─────────────────────────────── */
var CAT_LABELS = {
  all:        "All Categories",
  lsp:        "Language Services",
  bigtech:    "Big Tech",
  media:      "Media & Content",
  enterprise: "Enterprise Software",
  bpo:        "BPO & Staffing",
  learning:   "Language Learning",
  aidata:     "AI & Data"
};

function tickersForCat(cat) {
  if (cat === "all") return null; // null = use all tickers present in series
  return COMPANIES.filter(function (c) { return c.cat === cat; }).map(function (c) { return c.t; });
}

/* Return { start, end } unix-second bounds for a period key */
function periodBounds(period) {
  var now = Math.floor(Date.now() / 1000);
  if (period === "30d") return { start: now - 30 * 86400, end: now };
  if (period === "ytd") return {
    start: Math.floor(new Date(new Date().getFullYear(), 0, 1).getTime() / 1000),
    end:   now
  };
  if (/^\d{4}$/.test(period)) {
    var yr = parseInt(period, 10);
    return {
      start: Math.floor(new Date(yr, 0, 1).getTime() / 1000),
      end:   Math.floor(new Date(yr + 1, 0, 1).getTime() / 1000)
    };
  }
  return { start: 0, end: now };
}

/* Inject year buttons based on years present in the data */
function buildYearBtns(allTs) {
  var container = document.getElementById("mkt-period-btns");
  if (!container) return;
  var prev = container.querySelectorAll(".mkt-year-btn");
  for (var i = 0; i < prev.length; i++) prev[i].parentNode.removeChild(prev[i]);
  var yearSet = Object.create(null);
  allTs.forEach(function (ts) { yearSet[new Date(ts * 1000).getFullYear()] = true; });
  var years = Object.keys(yearSet).map(Number).sort(function (a, b) { return b - a; });
  years.forEach(function (yr) {
    var btn = document.createElement("button");
    btn.className = "mkt-period-btn mkt-year-btn" + (activePeriod === String(yr) ? " active" : "");
    btn.dataset.period = yr;
    btn.type = "button";
    btn.textContent = yr;
    container.appendChild(btn);
    btn.addEventListener("click", function () { setActivePeriod(String(yr)); });
  });
}

function setActivePeriod(period) {
  activePeriod = period;
  var btns = document.querySelectorAll("#mkt-period-btns .mkt-period-btn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.toggle("active", btns[i].dataset.period === period);
  }
  if (indexSeriesData) renderIndexChart(indexSeriesData, period, tickersForCat(activeCat));
}

function renderIndexChart(indexSeries, period, tickerFilter) {
  period = period || activePeriod;

  var canvas = document.getElementById("mkt-index-chart");
  var empty  = document.getElementById("mkt-index-empty");
  if (!canvas) return;

  var allSyms = Object.keys(indexSeries);
  var syms = tickerFilter
    ? allSyms.filter(function (s) { return tickerFilter.indexOf(s) !== -1; })
    : allSyms;

  // Update panel title
  var titleEl = document.getElementById("mkt-index-title");
  if (titleEl) {
    titleEl.textContent = activeCat === "all"
      ? "LocStock Index"
      : "LocStock Index \u00B7 " + (CAT_LABELS[activeCat] || activeCat);
  }

  // Update meta text
  var metaEl = document.getElementById("mkt-index-meta");
  if (metaEl) {
    if (syms.length > 0) {
      var displayNames = syms.map(function (s) {
        var co = coMap[s]; return co ? co.s : s;
      }).join(", ");
      metaEl.textContent = "Equal-weighted \u00B7 base\u00A0100 at period start \u00B7 "
        + syms.length + " constituent" + (syms.length !== 1 ? "s" : "") + ": " + displayNames;
    } else {
      metaEl.textContent = "No time-series data available for this category yet.";
    }
  }

  if (syms.length === 0 || typeof Chart === "undefined") {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    canvas.style.display = "none";
    if (empty) {
      empty.style.display = "flex";
      empty.textContent = syms.length === 0
        ? "No series data for this category yet — will appear after the next scheduled update."
        : "Chart data loads after the first scheduled update.";
    }
    return;
  }

  // Collect + sort all unique timestamps
  var tsSet = Object.create(null);
  syms.forEach(function (sym) {
    indexSeries[sym].timestamps.forEach(function (ts) { tsSet[ts] = true; });
  });
  var allTs = Object.keys(tsSet).map(Number).sort(function (a, b) { return a - b; });

  // Build year buttons on first call
  if (!document.querySelector("#mkt-period-btns .mkt-year-btn")) buildYearBtns(allTs);

  // Slice to selected period
  var bounds   = periodBounds(period);
  var slicedTs = allTs.filter(function (ts) { return ts >= bounds.start && ts < bounds.end; });

  if (slicedTs.length < 2) {
    canvas.style.display = "none";
    if (empty) { empty.style.display = "flex"; empty.textContent = "No data available for this period."; }
    return;
  }
  canvas.style.display = "";
  if (empty) empty.style.display = "none";

  // Build full close maps for every ticker
  var maps = Object.create(null);
  syms.forEach(function (sym) {
    var s = indexSeries[sym], m = Object.create(null);
    for (var i = 0; i < s.timestamps.length; i++) m[s.timestamps[i]] = s.closes[i];
    maps[sym] = m;
  });

  // Normalise: base 100 = each ticker's first available close within the period
  var bases = Object.create(null);
  syms.forEach(function (sym) {
    for (var i = 0; i < slicedTs.length; i++) {
      var v = maps[sym][slicedTs[i]];
      if (v != null) { bases[sym] = v; break; }
    }
  });

  // Forward-fill within period: carry last known close into non-trading days
  // (stocks on different exchanges have gaps; without this, missing days cause wild swings)
  var filled = Object.create(null);
  syms.forEach(function (sym) {
    filled[sym] = Object.create(null);
    var last = null;
    slicedTs.forEach(function (ts) {
      var v = maps[sym][ts];
      if (v != null) last = v;
      if (last != null) filled[sym][ts] = last;
    });
  });

  // Equal-weighted normalised index — weekly resampling for multi-month views
  var isLong = (period !== "30d");
  var labels = [], values = [];

  if (isLong) {
    // Resample to weekly: group timestamps by ISO week, use last trading day per week
    var weekMap = Object.create(null), weekOrder = [];
    slicedTs.forEach(function (ts) {
      var d   = new Date(ts * 1000);
      var jan = new Date(d.getFullYear(), 0, 1);
      var wk  = d.getFullYear() + "-" + String(Math.ceil(((d - jan) / 86400000 + jan.getDay() + 1) / 7)).padStart(2, "0");
      if (!weekMap[wk]) { weekMap[wk] = []; weekOrder.push(wk); }
      weekMap[wk].push(ts);
    });
    weekOrder.forEach(function (wk) {
      var lastTs = weekMap[wk][weekMap[wk].length - 1];
      var sum = 0, count = 0;
      syms.forEach(function (sym) {
        var val = filled[sym][lastTs], base = bases[sym];
        if (val != null && base) { sum += (val / base) * 100; count++; }
      });
      if (count > 0) {
        var dt = new Date(lastTs * 1000);
        labels.push(dt.toLocaleString([], { month: "short", year: "2-digit" }));
        values.push(parseFloat((sum / count).toFixed(3)));
      }
    });
  } else {
    slicedTs.forEach(function (ts) {
      var sum = 0, count = 0;
      syms.forEach(function (sym) {
        var val = filled[sym][ts], base = bases[sym];
        if (val != null && base) { sum += (val / base) * 100; count++; }
      });
      if (count > 0) {
        var dt = new Date(ts * 1000);
        labels.push(dt.toLocaleString([], { month: "short", day: "numeric" }));
        values.push(parseFloat((sum / count).toFixed(3)));
      }
    });
  }

  var lineColor = values[values.length - 1] >= values[0] ? "#22c55e" : "#ef4444";

  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

  var isDark    = document.documentElement.getAttribute("data-theme") === "dark";
  var gridColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  var tickColor = isDark ? "#8a8fa8" : "#9ca3af";

  chartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "LocStock Index",
        data: values,
        borderColor: lineColor,
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) { return "Index: " + ctx.parsed.y.toFixed(2); }
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: tickColor, maxTicksLimit: isLong ? 10 : 7, font: { size: 10 } }
        },
        y: {
          grid: { color: gridColor },
          title: {
            display: true,
            text: "Index (base = 100)",
            color: tickColor,
            font: { size: 10 }
          },
          ticks: {
            color: tickColor,
            callback: function (v) { return v.toFixed(1); },
            font: { size: 10 }
          }
        }
      }
    }
  });
}

/* ── Fetch quotes from static JSON ───────────────────────── */
function loadAll() {
  var mosaic = document.getElementById("mkt-mosaic");
  if (!mosaic) return;

  // Show loading skeletons, reset stats
  quotes = Object.create(null);
  mosaic.innerHTML = "";
  COMPANIES.forEach(function (co) { mosaic.appendChild(mkSkeleton(co)); });
  ["stat-up", "stat-down", "stat-flat"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = "—";
  });

  fetch("/assets/data/market_quotes.json")
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (data) {
      // Populate quote store
      var qs = data.quotes || {};
      Object.keys(qs).forEach(function (sym) { quotes[sym] = qs[sym]; });

      // Render all cards
      mosaic.innerHTML = "";
      COMPANIES.forEach(function (co) {
        mosaic.appendChild(mkCard(co, quotes[co.t] || null));
      });

      updateStats(data.updated_at || null);
      applyFilter(activeCat);

      // Render the industry index chart if series data exists
      var series = data.index_series || {};
      if (Object.keys(series).length > 0) {
        indexSeriesData = series;
        renderIndexChart(series, activePeriod, tickersForCat(activeCat));
      } else {
        indexSeriesData = null;
        var canvas = document.getElementById("mkt-index-chart");
        var empty  = document.getElementById("mkt-index-empty");
        if (canvas) canvas.style.display = "none";
        if (empty)  { empty.style.display = "flex"; empty.textContent = "Chart data loads after the first scheduled update."; }
      }

      var btn = document.getElementById("mkt-refresh-btn");
      if (btn) btn.classList.remove("spinning");
    })
    .catch(function () {
      // JSON not yet populated — show empty cards
      mosaic.innerHTML = "";
      COMPANIES.forEach(function (co) { mosaic.appendChild(mkCard(co, null)); });
      updateStats(null);
      applyFilter(activeCat);

      var canvas = document.getElementById("mkt-index-chart");
      var empty  = document.getElementById("mkt-index-empty");
      if (canvas) canvas.style.display = "none";
      if (empty)  empty.style.display  = "flex";

      var btn = document.getElementById("mkt-refresh-btn");
      if (btn) btn.classList.remove("spinning");
    });
}

/* ── Bootstrap ───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", function () {
  // Category filter buttons
  var filterBtns = document.querySelectorAll(".market-filter-btn");
  for (var i = 0; i < filterBtns.length; i++) {
    (function (btn) {
      btn.addEventListener("click", function () { applyFilter(btn.dataset.cat); });
    })(filterBtns[i]);
  }

  // Static period buttons (30D, YTD) — year buttons are added dynamically
  var periodBtns = document.querySelectorAll("#mkt-period-btns .mkt-period-btn");
  for (var j = 0; j < periodBtns.length; j++) {
    (function (btn) {
      btn.addEventListener("click", function () { setActivePeriod(btn.dataset.period); });
    })(periodBtns[j]);
  }

  // Refresh button
  var refreshBtn = document.getElementById("mkt-refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      refreshBtn.classList.add("spinning");
      loadAll();
    });
  }

  // Initial load
  loadAll();
});
})();
</script>
