---
layout: default
title: State of the Market
permalink: /market/
description: "Live equity overview of 30 publicly traded companies with exposure to language services, AI translation, and localization technology across global exchanges."
nav: true
nav_order: 4
---

<style>
/* ═══════════════════════════════════════════════════════════
   State of the Market — LocReport
   ═══════════════════════════════════════════════════════════ */

/* ── Hero ──────────────────────────────────────────────────── */
.market-hero { padding: var(--space-7) 0 var(--space-4); }
.market-hero h1 { margin: 0 0 var(--space-2); font-size: clamp(1.8rem, 4vw, 2.6rem); }

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
</style>

<!-- ── Hero ──────────────────────────────────────────────── -->
<div class="market-hero">
  <h1>State of the Market</h1>
</div>

<div class="market-header-row">
  <p class="market-subtitle">
    Live equity overview of <strong>30 publicly traded companies</strong> with exposure to language
    services, AI translation, and localization technology across 14 global exchanges.<br>
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
    <span class="market-stat-value" id="stat-total">30</span>
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
  <button class="market-filter-btn active" data-cat="all">All <span class="market-filter-count">30</span></button>
  <button class="market-filter-btn" data-cat="lsp">Language Services <span class="market-filter-count">13</span></button>
  <button class="market-filter-btn" data-cat="bigtech">Big Tech <span class="market-filter-count">5</span></button>
  <button class="market-filter-btn" data-cat="media">Media &amp; Content <span class="market-filter-count">2</span></button>
  <button class="market-filter-btn" data-cat="enterprise">Enterprise Software <span class="market-filter-count">3</span></button>
  <button class="market-filter-btn" data-cat="bpo">BPO &amp; Staffing <span class="market-filter-count">5</span></button>
  <button class="market-filter-btn" data-cat="learning">Language Learning <span class="market-filter-count">1</span></button>
  <button class="market-filter-btn" data-cat="aidata">AI &amp; Data <span class="market-filter-count">1</span></button>
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
  </div>
</div>

<!-- ── Notes ─────────────────────────────────────────────── -->
<div class="market-notes">
  <p><strong>Market data</strong> is fetched in real time from Yahoo Finance. Prices are displayed in each company's native trading currency — GBp (pence) for LSE stocks, JPY for the Tokyo Stock Exchange, KRW for Korean exchanges, and so on. Market cap is shown in local currency where reported.</p>
  <p><strong>Coverage scope</strong> includes pure-play language services companies, major technology platforms with significant translation and NLP exposure, media companies that are large buyers of localization, enterprise software providers with localization tooling, and AI data annotation companies.</p>
  <p>Data may be delayed. This page is for informational purposes only and does not constitute financial advice.</p>
</div>

<script>
/* ════════════════════════════════════════════════════════════
   State of the Market — LocReport
   Live quotes via Yahoo Finance v7 quote API
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
  { t:"SUL.WA",     s:"SUL",     n:"Summa Linguae S.A.",     ex:"WSE",            co:"PL", cat:"lsp"                },
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
function mkCard(co, q) {
  var dir = q ? dirOf(q.regularMarketChangePercent) : "flat";
  var d   = document.createElement("div");
  d.className = "market-card " + dir
    + (co.ft   ? " featured" : "")
    + (co.warn ? " warning"  : "");
  d.dataset.cat    = co.cat;
  d.dataset.ticker = co.t;

  var pct    = q ? fmtPct(q.regularMarketChangePercent) : null;
  var price  = q ? fmtPrice(q.regularMarketPrice, q.currency) : "—";
  var chgAbs = q ? fmtChangeAbs(q.regularMarketChange, q.currency) : null;
  var cap    = q ? fmtCap(q.marketCap, q.currency) : null;
  var flag   = FLAGS[co.co] || "";
  var isOpen = q && q.marketState === "REGULAR";

  d.innerHTML =
    '<div class="market-card-top">' +
      '<span class="market-card-exchange">' +
        '<span class="market-card-flag">' + flag + '</span>' +
        '<span class="market-card-state' + (isOpen ? ' open' : '') + '"' +
          ' title="' + (isOpen ? 'Market open' : 'Market closed or delayed') + '"></span>' +
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
      ? '<div class="market-card-nodata">Data unavailable</div>'
      : '');

  return d;
}

/* ── Quotes store ────────────────────────────────────────── */
var quotes = Object.create(null);

/* ── Stats bar update ────────────────────────────────────── */
function updateStats() {
  var up = 0, down = 0, flat = 0;
  COMPANIES.forEach(function (co) {
    var q = quotes[co.t];
    if (!q) return;
    var p = q.regularMarketChangePercent;
    if (p > 0) up++;
    else if (p < 0) down++;
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
    var now = new Date();
    eUpd.textContent = now.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
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
}

/* ── Fetch a batch of tickers ────────────────────────────── */
function fetchBatch(tickers, done) {
  var url = "https://query1.finance.yahoo.com/v7/finance/quote"
    + "?symbols=" + tickers.join(",")
    + "&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,"
    + "currency,marketCap,marketState";
  fetch(url, { mode: "cors" })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (data) {
      var results = (data && data.quoteResponse && data.quoteResponse.result) || [];
      results.forEach(function (q) { quotes[q.symbol] = q; });
      done(null, tickers);
    })
    .catch(function (err) {
      done(err, tickers);
    });
}

/* ── Find card element by ticker ─────────────────────────── */
function findCard(ticker) {
  var cards = document.querySelectorAll("#mkt-mosaic .market-card");
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].dataset.ticker === ticker) return cards[i];
  }
  return null;
}

/* ── Full load / refresh ─────────────────────────────────── */
var BATCH_SIZE = 10;

function loadAll() {
  var mosaic = document.getElementById("mkt-mosaic");
  if (!mosaic) return;

  // Reset
  quotes = Object.create(null);
  mosaic.innerHTML = "";

  // Render skeleton cards
  COMPANIES.forEach(function (co) {
    mosaic.appendChild(mkSkeleton(co));
  });

  // Reset stats
  ["stat-up","stat-down","stat-flat"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = "—";
  });

  // Split into batches
  var tickers = COMPANIES.map(function (c) { return c.t; });
  var batches = [];
  for (var i = 0; i < tickers.length; i += BATCH_SIZE) {
    batches.push(tickers.slice(i, i + BATCH_SIZE));
  }

  var done = 0;
  batches.forEach(function (batch) {
    fetchBatch(batch, function (err, batchTickers) {
      // Replace skeleton cards for this batch
      batchTickers.forEach(function (ticker) {
        var co  = coMap[ticker];
        var q   = quotes[ticker] || null;
        var old = findCard(ticker);
        if (co && old) {
          var neu = mkCard(co, q);
          old.parentNode.replaceChild(neu, old);
        }
      });

      done++;
      if (done === batches.length) {
        // All batches finished
        updateStats();
        var btn = document.getElementById("mkt-refresh-btn");
        if (btn) btn.classList.remove("spinning");
        applyFilter(activeCat);
      }
    });
  });
}

/* ── Bootstrap ───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", function () {
  // Filter buttons
  var filterBtns = document.querySelectorAll(".market-filter-btn");
  for (var i = 0; i < filterBtns.length; i++) {
    (function (btn) {
      btn.addEventListener("click", function () { applyFilter(btn.dataset.cat); });
    })(filterBtns[i]);
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
