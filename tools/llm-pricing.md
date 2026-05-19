---
layout: default
title: "LLM Translation Cost Simulator"
permalink: /tools/llm-pricing/
nav: false
nav_parent: "Tools"
nav_order: 2.31
description: "Estimate and compare API costs for using major LLMs in your translation program. Simulate monthly spend across GPT-4o, Claude, Gemini, and more."
---

<section class="all-articles-hero" style="padding-bottom: var(--space-3);">
  <h1>LLM Translation Cost Simulator</h1>
  <p class="all-articles-subtitle">Pick your language programme, set word volumes, and compare monthly API costs across all major models.</p>
</section>

<p class="intel-disclaimer" style="margin-bottom: var(--space-5);">
  <strong>Note:</strong> Prices are fetched weekly from the OpenRouter public API and reflect standard API list prices as of the date shown per model. This tool estimates API token costs only — it excludes infrastructure, human post-editing (MTPE), TMS integration, or volume discount pricing. Always verify rates directly with providers before budgeting.
</p>

<!-- ── Configuration panel ── -->
<div class="pcfg-panel">

  <div class="pcfg-main-row">

    <!-- Source language -->
    <div class="pcfg-source-col">
      <div class="pcfg-col-label">Translate FROM</div>
      <select class="pcfg-source-select" id="source-lang" aria-label="Source language"></select>
    </div>

    <div class="pcfg-arrow" aria-hidden="true">→</div>

    <!-- Target languages -->
    <div class="pcfg-targets-col">
      <div class="pcfg-targets-header">
        <div class="pcfg-col-label">Translate TO</div>
        <div class="pcfg-add-wrap">
          <button class="pcfg-add-btn" id="add-lang-btn" type="button">+ Add language</button>
          <div class="pcfg-lang-picker" id="lang-picker" role="dialog" aria-label="Pick a language" style="display:none;">
            <input type="text" class="pcfg-lang-search" id="lang-search" placeholder="Search languages…" autocomplete="off" spellcheck="false">
            <div class="pcfg-lang-list" id="lang-list"></div>
          </div>
        </div>
      </div>

      <div class="pcfg-targets-list" id="targets-list">
        <!-- rows rendered by JS -->
      </div>

      <p class="pcfg-empty-hint" id="pcfg-empty-hint" style="display:none;">Click <strong>+ Add language</strong> to start building your programme.</p>
      <p class="pcfg-total" id="pcfg-total"></p>
    </div>

  </div>

  <!-- Presets row -->
  <div class="pcfg-presets-row">
    <span class="pcfg-presets-label">Quick start:</span>
    <button class="pricing-preset-btn" data-preset="small">Small agency</button>
    <button class="pricing-preset-btn" data-preset="mid">Mid-size LSP</button>
    <button class="pricing-preset-btn" data-preset="enterprise">Enterprise</button>
  </div>

  <!-- Advanced settings -->
  <details class="pcfg-advanced">
    <summary class="pcfg-advanced-toggle">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:middle;margin-right:5px;" aria-hidden="true"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Advanced settings
    </summary>
    <div class="pcfg-advanced-body">
      <div class="pcfg-adv-grid">
        <div class="pricing-param">
          <div class="pricing-param-header">
            <label class="filter-label" for="words-per-call">Words per API call</label>
            <span class="pricing-param-value" id="words-per-call-display">500</span>
          </div>
          <input type="range" id="words-per-call-range" min="50" max="5000" step="50" value="500" class="pricing-range">
          <input type="number" id="words-per-call" min="50" max="5000" step="50" value="500" class="pricing-number-input">
        </div>
        <div class="pricing-param">
          <div class="pricing-param-header">
            <label class="filter-label" for="system-prompt-tokens">System prompt (tokens)</label>
            <span class="pricing-param-value" id="system-prompt-tokens-display">300</span>
          </div>
          <input type="range" id="system-prompt-tokens-range" min="50" max="2000" step="50" value="300" class="pricing-range">
          <input type="number" id="system-prompt-tokens" min="50" max="2000" step="50" value="300" class="pricing-number-input">
        </div>
      </div>
      <div class="pcfg-adv-providers">
        <div class="filter-label" style="margin-bottom: var(--space-2);">Providers</div>
        <div class="filter-chips" id="provider-filters"></div>
      </div>
    </div>
  </details>

</div>

<!-- ── Results ── -->
<div class="pricing-results-section" id="pricing-results" style="margin-top: var(--space-6);">
  <div class="pricing-results-header">
    <span class="pricing-results-label" id="results-summary"></span>
    <button class="pricing-sort-toggle" id="sort-toggle" type="button">
      Sort: cheapest first
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-left:4px;vertical-align:middle;" aria-hidden="true"><path d="M2 4l4-3 4 3M2 8l4 3 4-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </div>
  <div id="results-grid"></div>
</div>

<style>
/* ── Config panel ──────────────────────────────────── */
.pcfg-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-5) var(--space-6);
}
.pcfg-main-row {
  display: flex;
  gap: var(--space-5);
  align-items: flex-start;
}
.pcfg-col-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: var(--space-3);
}
.pcfg-source-col {
  flex-shrink: 0;
  min-width: 180px;
}
.pcfg-source-select {
  width: 100%;
  padding: 8px 28px 8px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  color: var(--text);
  background: var(--bg-secondary);
  border: 1.5px solid var(--accent);
  border-radius: var(--radius-md);
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%233D5AFE' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.pcfg-source-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.pcfg-arrow {
  font-size: 1.4rem;
  color: var(--muted);
  padding-top: 32px;
  flex-shrink: 0;
  user-select: none;
}
.pcfg-targets-col {
  flex: 1;
  min-width: 0;
}
.pcfg-targets-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}
.pcfg-add-wrap {
  position: relative;
}
.pcfg-add-btn {
  padding: 5px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  font-family: inherit;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1.5px solid var(--accent);
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.pcfg-add-btn:hover {
  background: var(--accent);
  color: #fff;
}
.pcfg-lang-picker {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  width: 300px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 200;
  overflow: hidden;
}
.pcfg-lang-search {
  width: 100%;
  padding: 10px 14px;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--text);
  background: var(--surface);
  border: none;
  border-bottom: 1px solid var(--border);
  outline: none;
  box-sizing: border-box;
}
.pcfg-lang-list {
  max-height: 280px;
  overflow-y: auto;
}
.pcfg-lang-group-label {
  padding: 6px 14px 4px;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  background: var(--bg-secondary);
  position: sticky;
  top: 0;
}
.pcfg-lang-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 14px;
  font-size: 0.85rem;
  color: var(--text);
  cursor: pointer;
  transition: background 0.1s;
  user-select: none;
}
.pcfg-lang-option:hover { background: var(--accent-soft); }
.pcfg-lang-option.is-selected { color: var(--muted); cursor: default; }
.pcfg-lang-option.is-hidden { display: none; }
.pcfg-lang-option-code {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--muted);
  background: var(--bg-secondary);
  padding: 1px 6px;
  border-radius: 4px;
}
/* Target rows */
.pcfg-targets-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.pcfg-target-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color 0.15s;
}
.pcfg-target-row:hover { border-color: color-mix(in srgb, var(--accent) 30%, var(--border)); }
.pcfg-target-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.pcfg-target-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text);
  min-width: 160px;
}
.pcfg-target-code {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 1px 6px;
  border-radius: 4px;
}
.pcfg-words-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}
.pcfg-words-label {
  font-size: 0.7rem;
  color: var(--muted);
  white-space: nowrap;
}
.pcfg-words-input {
  width: 110px;
  padding: 4px 8px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
  text-align: right;
  font-variant-numeric: tabular-nums;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.pcfg-words-input:focus { border-color: var(--accent); }
.pcfg-remove-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
  color: var(--muted);
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
  padding: 0;
}
.pcfg-remove-btn:hover { background: var(--border); color: var(--text); }
.pcfg-empty-hint {
  font-size: 0.85rem;
  color: var(--muted);
  padding: var(--space-4) 0;
  margin: 0;
}
.pcfg-total {
  font-size: 0.8rem;
  color: var(--muted);
  margin: var(--space-3) 0 0;
}
.pcfg-total strong { color: var(--text); }
/* Presets row */
.pcfg-presets-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}
.pcfg-presets-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  margin-right: var(--space-1);
}
.pricing-preset-btn {
  padding: 5px 14px;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: inherit;
  color: var(--muted);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.pricing-preset-btn:hover {
  color: var(--text);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  background: var(--accent-soft);
}
/* Advanced */
.pcfg-advanced {
  margin-top: var(--space-4);
  border-top: 1px solid var(--border);
  padding-top: var(--space-3);
}
.pcfg-advanced-toggle {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  list-style: none;
  user-select: none;
  transition: color 0.15s;
}
.pcfg-advanced-toggle::-webkit-details-marker { display: none; }
.pcfg-advanced-toggle:hover { color: var(--text); }
.pcfg-advanced[open] .pcfg-advanced-toggle svg { transform: rotate(180deg); }
.pcfg-advanced-body {
  padding-top: var(--space-4);
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--space-5);
  align-items: start;
}
.pcfg-adv-grid {
  display: contents;
}
.pcfg-adv-providers {
  padding-left: var(--space-4);
  border-left: 1px solid var(--border);
}
/* ── Results ──────────────────────────────────────── */
.pricing-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}
.pricing-results-label { font-size: 0.8rem; color: var(--muted); }
.pricing-sort-toggle {
  padding: 5px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.15s;
}
.pricing-sort-toggle:hover {
  color: var(--text);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
}
.pricing-result-row {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5);
  margin-bottom: var(--space-3);
  transition: box-shadow 0.2s, border-color 0.2s;
}
.pricing-result-row:hover {
  box-shadow: var(--card-shadow);
  border-color: color-mix(in srgb, var(--accent) 20%, var(--border));
}
.pricing-result-row.rank-1 {
  border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
  background: color-mix(in srgb, var(--accent-soft) 60%, var(--surface));
}
.pricing-result-top {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.pricing-rank { font-size: 0.72rem; font-weight: 800; color: var(--muted); min-width: 22px; }
.rank-1 .pricing-rank { color: var(--accent); }
.pricing-model-name { font-size: 0.95rem; font-weight: 700; color: var(--text); flex: 1; }
.pricing-provider-badge {
  font-size: 0.68rem; font-weight: 700;
  padding: 2px 8px; border-radius: 100px; white-space: nowrap;
}
.pricing-costs {
  display: flex; flex-direction: column; align-items: flex-end; gap: 1px; margin-left: auto;
}
.pricing-monthly-cost {
  font-size: 1.1rem; font-weight: 800; color: var(--text);
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.pricing-per-lang-cost {
  font-size: 0.72rem; font-weight: 500; color: var(--muted);
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.pricing-result-meta {
  display: flex; gap: var(--space-5); flex-wrap: wrap;
  margin-bottom: var(--space-3); padding-left: 30px;
}
.pricing-meta-item { display: flex; flex-direction: column; gap: 1px; }
.pricing-meta-label {
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.07em;
  text-transform: uppercase; color: var(--muted);
}
.pricing-meta-value {
  font-size: 0.85rem; font-weight: 600; color: var(--text);
  font-variant-numeric: tabular-nums;
}
.pricing-lang-breakdown {
  padding-left: 30px;
  margin-bottom: var(--space-3);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.pricing-lang-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-variant-numeric: tabular-nums;
}
.pricing-bar-wrap { padding-left: 30px; margin-bottom: var(--space-2); }
.pricing-bar-track { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
.pricing-bar-fill {
  height: 100%; border-radius: 3px; background: var(--accent); transition: width 0.3s ease;
}
.pricing-result-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-left: 30px; margin-top: var(--space-2);
}
.pricing-notes { font-size: 0.75rem; color: var(--muted); font-style: italic; }
.pricing-updated { font-size: 0.68rem; color: var(--muted); }
.pricing-no-results {
  text-align: center; padding: var(--space-8) var(--space-4);
  color: var(--muted); font-size: 0.9rem;
}
/* Misc */
.pricing-range {
  width: 100%; height: 4px; margin-bottom: var(--space-2);
  accent-color: var(--accent); cursor: pointer;
}
.pricing-number-input {
  width: 100%; padding: 5px 10px; font-size: 0.8rem; font-weight: 500;
  font-family: inherit; color: var(--text); background: var(--bg-secondary);
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  outline: none; transition: border-color 0.2s; box-sizing: border-box;
}
.pricing-number-input:focus { border-color: var(--accent); }
.pricing-param { margin-bottom: 0; }
.pricing-param-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); }
.pricing-param-value { font-size: 0.8rem; font-weight: 700; color: var(--accent); font-variant-numeric: tabular-nums; }
@media (max-width: 760px) {
  .pcfg-main-row { flex-direction: column; gap: var(--space-4); }
  .pcfg-arrow { display: none; }
  .pcfg-source-col { width: 100%; }
  .pcfg-lang-picker { width: 100%; right: auto; left: 0; }
  .pcfg-target-name { min-width: 0; flex: 1; }
  .pcfg-advanced-body { grid-template-columns: 1fr; }
  .pcfg-adv-providers { border-left: none; padding-left: 0; border-top: 1px solid var(--border); padding-top: var(--space-4); }
}
</style>

<script>
(function () {
  var MODELS = {{ site.data.llm_pricing | jsonify }};

  /* ─ Language data ──────────────────────────────────────────────────────
     tokensPerWord  : avg tokens per word/character in this language
     wordExpansion  : typical word count ratio when translating TO this language
                      (relative to a Western European source baseline)
  ── */
  var LANGUAGES = [
    // Western European
    { code: 'EN',    name: 'English',               group: 'Western European', tokensPerWord: 1.30, wordExpansion: 1.00 },
    { code: 'FR',    name: 'French',                group: 'Western European', tokensPerWord: 1.35, wordExpansion: 1.15 },
    { code: 'DE',    name: 'German',                group: 'Western European', tokensPerWord: 1.30, wordExpansion: 1.25 },
    { code: 'ES',    name: 'Spanish',               group: 'Western European', tokensPerWord: 1.30, wordExpansion: 1.15 },
    { code: 'IT',    name: 'Italian',               group: 'Western European', tokensPerWord: 1.30, wordExpansion: 1.15 },
    { code: 'PT',    name: 'Portuguese',            group: 'Western European', tokensPerWord: 1.30, wordExpansion: 1.15 },
    { code: 'NL',    name: 'Dutch',                 group: 'Western European', tokensPerWord: 1.30, wordExpansion: 1.10 },
    { code: 'SV',    name: 'Swedish',               group: 'Western European', tokensPerWord: 1.30, wordExpansion: 1.10 },
    { code: 'DA',    name: 'Danish',                group: 'Western European', tokensPerWord: 1.30, wordExpansion: 1.10 },
    { code: 'NO',    name: 'Norwegian',             group: 'Western European', tokensPerWord: 1.30, wordExpansion: 1.10 },
    // Eastern European
    { code: 'PL',    name: 'Polish',                group: 'Eastern European', tokensPerWord: 1.50, wordExpansion: 1.20 },
    { code: 'RU',    name: 'Russian',               group: 'Eastern European', tokensPerWord: 1.50, wordExpansion: 1.20 },
    { code: 'CS',    name: 'Czech',                 group: 'Eastern European', tokensPerWord: 1.45, wordExpansion: 1.20 },
    { code: 'UK',    name: 'Ukrainian',             group: 'Eastern European', tokensPerWord: 1.50, wordExpansion: 1.20 },
    { code: 'RO',    name: 'Romanian',              group: 'Eastern European', tokensPerWord: 1.40, wordExpansion: 1.15 },
    { code: 'HU',    name: 'Hungarian',             group: 'Eastern European', tokensPerWord: 1.60, wordExpansion: 1.25 },
    { code: 'SK',    name: 'Slovak',                group: 'Eastern European', tokensPerWord: 1.45, wordExpansion: 1.20 },
    { code: 'BG',    name: 'Bulgarian',             group: 'Eastern European', tokensPerWord: 1.50, wordExpansion: 1.20 },
    { code: 'HR',    name: 'Croatian',              group: 'Eastern European', tokensPerWord: 1.45, wordExpansion: 1.20 },
    { code: 'EL',    name: 'Greek',                 group: 'Eastern European', tokensPerWord: 1.45, wordExpansion: 1.15 },
    { code: 'FI',    name: 'Finnish',               group: 'Eastern European', tokensPerWord: 1.60, wordExpansion: 1.30 },
    { code: 'TR',    name: 'Turkish',               group: 'Eastern European', tokensPerWord: 1.50, wordExpansion: 1.20 },
    // Arabic / RTL
    { code: 'AR',    name: 'Arabic',                group: 'Arabic / RTL',     tokensPerWord: 1.70, wordExpansion: 1.35 },
    { code: 'HE',    name: 'Hebrew',                group: 'Arabic / RTL',     tokensPerWord: 1.55, wordExpansion: 1.30 },
    { code: 'FA',    name: 'Persian',               group: 'Arabic / RTL',     tokensPerWord: 1.65, wordExpansion: 1.30 },
    { code: 'UR',    name: 'Urdu',                  group: 'Arabic / RTL',     tokensPerWord: 1.65, wordExpansion: 1.30 },
    // CJK
    { code: 'ZH',    name: 'Chinese (Simplified)',  group: 'CJK',              tokensPerWord: 2.00, wordExpansion: 0.70 },
    { code: 'ZH-TW', name: 'Chinese (Traditional)', group: 'CJK',             tokensPerWord: 2.00, wordExpansion: 0.70 },
    { code: 'JA',    name: 'Japanese',              group: 'CJK',              tokensPerWord: 2.20, wordExpansion: 0.75 },
    { code: 'KO',    name: 'Korean',                group: 'CJK',              tokensPerWord: 1.80, wordExpansion: 0.90 },
    // South / SE Asian
    { code: 'HI',    name: 'Hindi',                 group: 'South / SE Asian', tokensPerWord: 1.80, wordExpansion: 1.15 },
    { code: 'TH',    name: 'Thai',                  group: 'South / SE Asian', tokensPerWord: 2.00, wordExpansion: 0.90 },
    { code: 'VI',    name: 'Vietnamese',            group: 'South / SE Asian', tokensPerWord: 1.60, wordExpansion: 1.20 },
    { code: 'ID',    name: 'Indonesian',            group: 'South / SE Asian', tokensPerWord: 1.50, wordExpansion: 1.10 },
    { code: 'MS',    name: 'Malay',                 group: 'South / SE Asian', tokensPerWord: 1.50, wordExpansion: 1.10 }
  ];

  var GROUP_COLORS = {
    'Western European': '#3D5AFE',
    'Eastern European': '#2F7CB5',
    'Arabic / RTL':     '#c0822b',
    'CJK':              '#5a7d5e',
    'South / SE Asian': '#8a6b78'
  };

  var PROVIDER_COLORS = {
    'OpenAI':         { bg: '#10a37f22', text: '#0d8c6a' },
    'Anthropic':      { bg: '#d4622222', text: '#b84d16' },
    'Google':         { bg: '#1a73e822', text: '#1a73e8' },
    'Meta (via API)': { bg: '#1877f222', text: '#1877f2' }
  };

  var PRESETS = {
    small: {
      src: 'EN',
      targets: [
        { code: 'FR', words: 50000 },
        { code: 'DE', words: 50000 },
        { code: 'ES', words: 50000 }
      ]
    },
    mid: {
      src: 'EN',
      targets: [
        { code: 'FR', words: 100000 }, { code: 'DE', words: 100000 },
        { code: 'ES', words: 100000 }, { code: 'IT', words: 80000  },
        { code: 'PT', words: 80000  }, { code: 'NL', words: 60000  },
        { code: 'PL', words: 60000  }, { code: 'CS', words: 40000  }
      ]
    },
    enterprise: {
      src: 'EN',
      targets: [
        { code: 'FR', words: 500000 }, { code: 'DE', words: 500000 },
        { code: 'ES', words: 500000 }, { code: 'IT', words: 400000 },
        { code: 'PT', words: 400000 }, { code: 'NL', words: 300000 },
        { code: 'SV', words: 200000 }, { code: 'PL', words: 300000 },
        { code: 'RU', words: 300000 }, { code: 'CS', words: 200000 },
        { code: 'RO', words: 200000 }, { code: 'HU', words: 200000 },
        { code: 'TR', words: 200000 }, { code: 'AR', words: 300000 },
        { code: 'ZH', words: 400000 }, { code: 'JA', words: 400000 },
        { code: 'KO', words: 300000 }, { code: 'HI', words: 200000 },
        { code: 'VI', words: 150000 }, { code: 'ID', words: 150000 }
      ]
    }
  };

  var state = {
    srcCode: 'EN',
    targets: [
      { code: 'FR', words: 100000 },
      { code: 'DE', words: 100000 },
      { code: 'ES', words: 100000 }
    ],
    sortAsc: true,
    activeProviders: {}
  };
  MODELS.forEach(function (m) { state.activeProviders[m.provider] = true; });

  /* ─ Helpers ─ */
  function langByCode(code) {
    return LANGUAGES.find(function (l) { return l.code === code; }) || LANGUAGES[0];
  }
  function fmt(n, dec) {
    if (dec === undefined) dec = 2;
    return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function fmtWords(n) {
    if (n >= 1e6) return fmt(n / 1e6, 1) + 'M';
    if (n >= 1e3) return fmt(n / 1e3, 0) + 'K';
    return String(n);
  }
  function fmtCost(n) {
    if (n >= 10000) return '$' + fmt(n, 0);
    if (n >= 1000)  return '$' + fmt(n, 0);
    if (n >= 100)   return '$' + fmt(n, 1);
    if (n >= 1)     return '$' + fmt(n, 2);
    if (n >= 0.01)  return '$' + fmt(n, 3);
    return '$' + n.toFixed(5);
  }
  function fmtTokens(n) {
    if (n >= 1e9) return fmt(n / 1e9, 2) + 'B';
    if (n >= 1e6) return fmt(n / 1e6, 2) + 'M';
    if (n >= 1e3) return fmt(n / 1e3, 1) + 'K';
    return String(n);
  }

  /* ─ Cost calculation ─ */
  function calcModelCost(model) {
    var wordsPerCall       = parseInt(document.getElementById('words-per-call').value, 10)       || 500;
    var systemPromptTokens = parseInt(document.getElementById('system-prompt-tokens').value, 10) || 300;
    var src = langByCode(state.srcCode);

    var totalIn = 0, totalOut = 0, totalCalls = 0;
    var perLang = state.targets.map(function (t) {
      var tgt = langByCode(t.code);
      var inputTokPerCall  = Math.ceil(wordsPerCall * src.tokensPerWord) + systemPromptTokens;
      var outputTokPerCall = Math.ceil(wordsPerCall * tgt.wordExpansion * tgt.tokensPerWord);
      var calls = Math.ceil(t.words / wordsPerCall);
      var inTok = calls * inputTokPerCall;
      var outTok = calls * outputTokPerCall;
      var cost = (inTok / 1e6 * model.input_cost_per_1m) + (outTok / 1e6 * model.output_cost_per_1m);
      totalIn    += inTok;
      totalOut   += outTok;
      totalCalls += calls;
      return { code: t.code, name: tgt.name, words: t.words, cost: cost };
    });

    var totalCost = (totalIn / 1e6 * model.input_cost_per_1m) + (totalOut / 1e6 * model.output_cost_per_1m);
    return { totalCost: totalCost, totalIn: totalIn, totalOut: totalOut, totalCalls: totalCalls, perLang: perLang };
  }

  /* ─ Build source select ─ */
  function buildSourceSelect() {
    var sel = document.getElementById('source-lang');
    var groups = [];
    LANGUAGES.forEach(function (l) {
      if (groups.indexOf(l.group) === -1) groups.push(l.group);
    });
    sel.innerHTML = groups.map(function (g) {
      var opts = LANGUAGES.filter(function (l) { return l.group === g; }).map(function (l) {
        return '<option value="' + l.code + '"' + (l.code === state.srcCode ? ' selected' : '') + '>' +
          l.name + ' (' + l.code + ')</option>';
      }).join('');
      return '<optgroup label="' + g + '">' + opts + '</optgroup>';
    }).join('');

    sel.addEventListener('change', function () {
      state.srcCode = sel.value;
      // remove if same as source
      state.targets = state.targets.filter(function (t) { return t.code !== state.srcCode; });
      renderTargets();
      render();
    });
  }

  /* ─ Language picker dropdown ─ */
  function buildLangPicker() {
    var btn     = document.getElementById('add-lang-btn');
    var picker  = document.getElementById('lang-picker');
    var search  = document.getElementById('lang-search');
    var list    = document.getElementById('lang-list');

    function refreshList(query) {
      query = (query || '').toLowerCase().trim();
      var selectedCodes = state.targets.map(function (t) { return t.code; });
      var groups = [];
      LANGUAGES.forEach(function (l) { if (groups.indexOf(l.group) === -1) groups.push(l.group); });

      list.innerHTML = groups.map(function (g) {
        var items = LANGUAGES.filter(function (l) {
          return l.group === g && l.code !== state.srcCode;
        }).map(function (l) {
          var isSel = selectedCodes.indexOf(l.code) !== -1;
          var hidden = query && (l.name.toLowerCase().indexOf(query) === -1 && l.code.toLowerCase().indexOf(query) === -1);
          return '<div class="pcfg-lang-option' +
            (isSel ? ' is-selected' : '') +
            (hidden ? ' is-hidden' : '') +
            '" data-code="' + l.code + '">' +
            '<span>' + l.name + '</span>' +
            '<span class="pcfg-lang-option-code">' + l.code + '</span>' +
            '</div>';
        }).join('');
        var allHidden = LANGUAGES.filter(function (l) {
          return l.group === g && l.code !== state.srcCode &&
            !(query && (l.name.toLowerCase().indexOf(query) === -1 && l.code.toLowerCase().indexOf(query) === -1));
        }).length === 0;
        return (allHidden ? '' : '<div class="pcfg-lang-group-label">' + g + '</div>') + items;
      }).join('');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = picker.style.display !== 'none';
      picker.style.display = isOpen ? 'none' : '';
      if (!isOpen) {
        search.value = '';
        refreshList('');
        search.focus();
      }
    });

    search.addEventListener('input', function () { refreshList(search.value); });

    list.addEventListener('click', function (e) {
      var opt = e.target.closest('.pcfg-lang-option');
      if (!opt || opt.classList.contains('is-selected')) return;
      var code = opt.dataset.code;
      state.targets.push({ code: code, words: 50000 });
      picker.style.display = 'none';
      renderTargets();
      render();
    });

    document.addEventListener('click', function (e) {
      if (!picker.contains(e.target) && e.target !== btn) {
        picker.style.display = 'none';
      }
    });

    // expose refreshList so renderTargets can call it
    window._pickerRefresh = refreshList;
  }

  /* ─ Render target rows ─ */
  function renderTargets() {
    var list  = document.getElementById('targets-list');
    var hint  = document.getElementById('pcfg-empty-hint');
    var total = document.getElementById('pcfg-total');

    if (state.targets.length === 0) {
      list.innerHTML = '';
      hint.style.display = '';
      total.textContent = '';
      return;
    }
    hint.style.display = 'none';

    list.innerHTML = state.targets.map(function (t) {
      var lang  = langByCode(t.code);
      var color = GROUP_COLORS[lang.group] || '#888';
      return '<div class="pcfg-target-row" data-code="' + t.code + '">' +
        '<span class="pcfg-target-dot" style="background:' + color + '"></span>' +
        '<span class="pcfg-target-name">' + lang.name + '</span>' +
        '<span class="pcfg-target-code">' + t.code + '</span>' +
        '<div class="pcfg-words-wrap">' +
          '<span class="pcfg-words-label">words/mo</span>' +
          '<input type="number" class="pcfg-words-input" value="' + t.words + '" min="100" step="1000" data-code="' + t.code + '" aria-label="' + lang.name + ' word count">' +
        '</div>' +
        '<button class="pcfg-remove-btn" data-code="' + t.code + '" aria-label="Remove ' + lang.name + '">×</button>' +
      '</div>';
    }).join('');

    // wire up events
    list.querySelectorAll('.pcfg-words-input').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var v = parseInt(inp.value, 10);
        if (isNaN(v) || v < 0) return;
        var t = state.targets.find(function (x) { return x.code === inp.dataset.code; });
        if (t) t.words = v;
        updateTotal();
        render();
      });
    });
    list.querySelectorAll('.pcfg-remove-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.targets = state.targets.filter(function (x) { return x.code !== btn.dataset.code; });
        renderTargets();
        render();
        if (window._pickerRefresh) window._pickerRefresh(document.getElementById('lang-search').value);
      });
    });

    updateTotal();
  }

  function updateTotal() {
    var total = document.getElementById('pcfg-total');
    if (state.targets.length === 0) { total.textContent = ''; return; }
    var totalWords = state.targets.reduce(function (s, t) { return s + t.words; }, 0);
    var src = langByCode(state.srcCode);
    total.innerHTML = '<strong>' + state.targets.length + ' language' +
      (state.targets.length !== 1 ? 's' : '') + '</strong> · ' +
      '<strong>' + fmtWords(totalWords) + '</strong> words/mo total' +
      ' · source: ' + src.name;
  }

  /* ─ Provider filters ─ */
  function buildProviderFilters() {
    var providers = [];
    MODELS.forEach(function (m) { if (providers.indexOf(m.provider) === -1) providers.push(m.provider); });
    var container = document.getElementById('provider-filters');
    container.innerHTML = providers.map(function (p) {
      var c = PROVIDER_COLORS[p] || { bg: '#88888822', text: '#666' };
      return '<button class="filter-chip active pricing-provider-toggle" data-provider="' + p + '">' +
        '<span class="chip-dot" style="background:' + c.text + '"></span>' + p +
      '</button>';
    }).join('');
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.pricing-provider-toggle');
      if (!btn) return;
      state.activeProviders[btn.dataset.provider] = !state.activeProviders[btn.dataset.provider];
      btn.classList.toggle('active', state.activeProviders[btn.dataset.provider]);
      render();
    });
  }

  /* ─ Advanced sliders ─ */
  function syncSlider(rangeId, numberId, displayId) {
    var range  = document.getElementById(rangeId);
    var number = document.getElementById(numberId);
    var disp   = document.getElementById(displayId);
    function update(v) {
      range.value = number.value = v;
      if (disp) disp.textContent = Number(v).toLocaleString();
      render();
    }
    range.addEventListener('input',  function () { update(range.value); });
    number.addEventListener('input', function () { if (!isNaN(parseInt(number.value, 10))) update(number.value); });
  }

  /* ─ Presets ─ */
  function buildPresets() {
    document.querySelectorAll('.pricing-preset-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = PRESETS[btn.dataset.preset];
        if (!p) return;
        state.srcCode = p.src;
        state.targets = p.targets.map(function (t) { return { code: t.code, words: t.words }; });
        document.getElementById('source-lang').value = p.src;
        renderTargets();
        render();
      });
    });
  }

  /* ─ Render results ─ */
  function render() {
    if (state.targets.length === 0) {
      document.getElementById('results-summary').textContent = '';
      document.getElementById('results-grid').innerHTML =
        '<div class="pricing-no-results">Add at least one target language above to see cost estimates.</div>';
      return;
    }

    var visible = MODELS.filter(function (m) { return state.activeProviders[m.provider]; });
    var results = visible.map(function (m) {
      return Object.assign({ model: m }, calcModelCost(m));
    });
    results.sort(function (a, b) {
      return state.sortAsc ? a.totalCost - b.totalCost : b.totalCost - a.totalCost;
    });

    var maxCost    = results.reduce(function (acc, r) { return Math.max(acc, r.totalCost); }, 0);
    var totalWords = state.targets.reduce(function (s, t) { return s + t.words; }, 0);

    document.getElementById('results-summary').textContent =
      results.length + ' model' + (results.length !== 1 ? 's' : '') +
      ' — ' + state.targets.length + ' languages · ' + fmtWords(totalWords) + ' words/mo total';

    if (results.length === 0) {
      document.getElementById('results-grid').innerHTML =
        '<div class="pricing-no-results">No providers selected. Enable at least one in Advanced settings.</div>';
      return;
    }

    document.getElementById('results-grid').innerHTML = results.map(function (r, i) {
      var pColor    = PROVIDER_COLORS[r.model.provider] || { bg: '#88888822', text: '#666' };
      var barPct    = maxCost > 0 ? (r.totalCost / maxCost * 100).toFixed(1) : 0;
      var rankClass = i === 0 ? ' rank-1' : '';
      var costPerWord = totalWords > 0 ? r.totalCost / totalWords : 0;

      var multiLang = state.targets.length > 1;
      var costBlock = multiLang
        ? '<div class="pricing-costs">' +
            '<span class="pricing-monthly-cost">' + fmtCost(r.totalCost) +
              '<span style="font-size:0.65rem;font-weight:500;color:var(--muted)">/mo total</span></span>' +
            '<span class="pricing-per-lang-cost">avg ' + fmtCost(r.totalCost / state.targets.length) + '/language</span>' +
          '</div>'
        : '<div class="pricing-costs"><span class="pricing-monthly-cost">' + fmtCost(r.totalCost) +
            '<span style="font-size:0.65rem;font-weight:500;color:var(--muted)">/mo</span></span></div>';

      var breakdown = multiLang
        ? '<div class="pricing-lang-breakdown">' +
            r.perLang.map(function (pl) {
              var color = GROUP_COLORS[langByCode(pl.code).group] || '#888';
              return '<span class="pricing-lang-pill">' +
                '<span style="width:7px;height:7px;border-radius:50%;background:' + color + ';display:inline-block;flex-shrink:0"></span>' +
                pl.code + ' ' + fmtCost(pl.cost) +
              '</span>';
            }).join('') +
          '</div>'
        : '';

      return '<div class="pricing-result-row' + rankClass + '">' +
        '<div class="pricing-result-top">' +
          '<span class="pricing-rank">' + (i + 1) + '</span>' +
          '<span class="pricing-model-name">' + r.model.name + '</span>' +
          '<span class="pricing-provider-badge" style="background:' + pColor.bg + ';color:' + pColor.text + '">' + r.model.provider + '</span>' +
          costBlock +
        '</div>' +
        breakdown +
        '<div class="pricing-result-meta">' +
          '<div class="pricing-meta-item"><span class="pricing-meta-label">Cost per word</span><span class="pricing-meta-value">' + fmtCost(costPerWord) + '</span></div>' +
          '<div class="pricing-meta-item"><span class="pricing-meta-label">Per 1M words</span><span class="pricing-meta-value">' + fmtCost(costPerWord * 1e6) + '</span></div>' +
          '<div class="pricing-meta-item"><span class="pricing-meta-label">Total API calls</span><span class="pricing-meta-value">' + fmtTokens(r.totalCalls) + '</span></div>' +
          '<div class="pricing-meta-item"><span class="pricing-meta-label">Input tokens</span><span class="pricing-meta-value">' + fmtTokens(r.totalIn) + '</span></div>' +
          '<div class="pricing-meta-item"><span class="pricing-meta-label">Output tokens</span><span class="pricing-meta-value">' + fmtTokens(r.totalOut) + '</span></div>' +
        '</div>' +
        '<div class="pricing-bar-wrap"><div class="pricing-bar-track"><div class="pricing-bar-fill" style="width:' + barPct + '%"></div></div></div>' +
        '<div class="pricing-result-footer">' +
          '<span class="pricing-notes">' + (r.model.notes || '') + '</span>' +
          '<span class="pricing-updated">Updated ' + (r.model.last_updated || '—') + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ─ Sort toggle ─ */
  function buildSortToggle() {
    var btn = document.getElementById('sort-toggle');
    btn.addEventListener('click', function () {
      state.sortAsc = !state.sortAsc;
      btn.innerHTML = 'Sort: ' + (state.sortAsc ? 'cheapest first' : 'most expensive first') +
        ' <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-left:4px;vertical-align:middle;" aria-hidden="true"><path d="M2 4l4-3 4 3M2 8l4 3 4-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      render();
    });
  }

  /* ─ Init ─ */
  document.addEventListener('DOMContentLoaded', function () {
    buildSourceSelect();
    buildLangPicker();
    renderTargets();
    buildProviderFilters();
    syncSlider('words-per-call-range',       'words-per-call',       'words-per-call-display');
    syncSlider('system-prompt-tokens-range', 'system-prompt-tokens', 'system-prompt-tokens-display');
    buildPresets();
    buildSortToggle();
    render();
  });
})();
</script>
