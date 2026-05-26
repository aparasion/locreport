---
layout: default
title: "LLM Translation Cost Simulator"
permalink: /tools/llm-pricing/
nav: false
nav_parent: "Tools"
nav_order: 2.31
description: "Estimate and compare API costs for using major LLMs in your translation program. Simulate monthly spend across GPT-4o, Claude, Gemini, DeepSeek, and more."
---

<section class="all-articles-hero" style="padding-bottom: var(--space-3);">
  <h1>LLM Translation Cost Simulator</h1>
  <p class="all-articles-subtitle">Build your language programme pair by pair, set word volumes, and compare monthly API costs across all major models.</p>
</section>

<p class="intel-disclaimer" style="margin-bottom: var(--space-5);">
  <strong>Note:</strong> Prices are fetched weekly from the OpenRouter public API and reflect standard API list prices as of the date shown per model. This tool estimates API token costs only — it excludes infrastructure, human post-editing (MTPE), TMS integration, or volume discount pricing. Always verify rates directly with providers before budgeting.
</p>

<!-- ── Configuration panel ── -->
<div class="pcfg-panel">

  <!-- Header row -->
  <div class="pcfg-panel-header">
    <div>
      <div class="pcfg-panel-title">Language programme</div>
      <p class="pcfg-total" id="pcfg-total"></p>
    </div>
    <button class="pcfg-add-btn" id="add-pair-btn" type="button">+ Add language pair</button>
  </div>

  <!-- Column headers -->
  <div class="pcfg-col-headers" id="pcfg-col-headers" style="display:none;">
    <span class="pcfg-col-head">Source</span>
    <span></span>
    <span class="pcfg-col-head">Target</span>
    <span class="pcfg-col-head pcfg-col-head--right">Words / month</span>
    <span></span>
  </div>

  <!-- Pairs list -->
  <div class="pcfg-pairs-list" id="pairs-list"></div>

  <!-- Empty state -->
  <p class="pcfg-empty-hint" id="pcfg-empty-hint">
    Click <strong>+ Add language pair</strong> to start building your programme, or use a quick-start preset below.
  </p>

  <!-- Presets + advanced -->
  <div class="pcfg-footer-row">
    <div class="pcfg-presets-row">
      <span class="pcfg-presets-label">Quick start:</span>
      <button class="pricing-preset-btn" data-preset="small">Small agency</button>
      <button class="pricing-preset-btn" data-preset="mid">Mid-size LSP</button>
      <button class="pricing-preset-btn" data-preset="enterprise">Enterprise</button>
      <button class="pricing-preset-btn" data-preset="multilingual">Multi-source</button>
    </div>
  </div>

  <!-- Advanced settings -->
  <details class="pcfg-advanced">
    <summary class="pcfg-advanced-toggle">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:middle;margin-right:5px;" aria-hidden="true"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Advanced settings
    </summary>
    <div class="pcfg-advanced-body">
      <div class="pricing-param">
        <div class="pricing-param-header">
          <label class="filter-label" for="words-per-call">Words per API call</label>
          <span class="pricing-param-value" id="words-per-call-display">500</span>
        </div>
        <input type="range" id="words-per-call-range" min="50" max="5000" step="50" value="500" class="pricing-range">
        <input type="number" id="words-per-call" min="50" max="5000" step="50" value="500" class="pricing-number-input">
        <p class="pcfg-adv-hint" id="wpc-hint"></p>
      </div>
      <div class="pricing-param">
        <div class="pricing-param-header">
          <label class="filter-label" for="system-prompt-tokens">System prompt (tokens)</label>
          <span class="pricing-param-value" id="system-prompt-tokens-display">300</span>
        </div>
        <input type="range" id="system-prompt-tokens-range" min="50" max="2000" step="50" value="300" class="pricing-range">
        <input type="number" id="system-prompt-tokens" min="50" max="2000" step="50" value="300" class="pricing-number-input">
        <p class="pcfg-adv-hint" id="spt-hint"></p>
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
/* ── Config panel ─────────────────────────────────────── */
.pcfg-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-5) var(--space-6);
}
.pcfg-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}
.pcfg-panel-title {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: var(--space-1);
}
.pcfg-total {
  font-size: 0.82rem;
  color: var(--muted);
  margin: 0;
  min-height: 1.2em;
}
.pcfg-total strong { color: var(--text); }
.pcfg-add-btn {
  flex-shrink: 0;
  padding: 7px 18px;
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
.pcfg-add-btn:hover { background: var(--accent); color: #fff; }

/* Column headers */
.pcfg-col-headers {
  display: grid;
  grid-template-columns: 1fr 28px 1fr 160px 36px;
  gap: var(--space-3);
  padding: 0 0 var(--space-2);
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--space-2);
}
.pcfg-col-head {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.pcfg-col-head--right { text-align: right; }

/* Pair rows */
.pcfg-pairs-list { display: flex; flex-direction: column; gap: var(--space-2); }

.pcfg-pair-row {
  display: grid;
  grid-template-columns: 1fr 28px 1fr 160px 36px;
  gap: var(--space-3);
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
.pcfg-pair-row:last-child { border-bottom: none; }

.pcfg-pair-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.pcfg-pair-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.pcfg-pair-select {
  flex: 1;
  min-width: 0;
  padding: 6px 24px 6px 8px;
  font-size: 0.84rem;
  font-weight: 600;
  font-family: inherit;
  color: var(--text);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: border-color 0.15s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pcfg-pair-select:focus { border-color: var(--accent); }
.pcfg-pair-select:hover { border-color: color-mix(in srgb, var(--accent) 40%, var(--border)); }

.pcfg-pair-arrow {
  font-size: 1rem;
  color: var(--muted);
  text-align: center;
  user-select: none;
}
.pcfg-words-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}
.pcfg-words-label {
  font-size: 0.7rem;
  color: var(--muted);
  white-space: nowrap;
}
.pcfg-words-input {
  width: 100px;
  padding: 5px 8px;
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
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; line-height: 1;
  color: var(--muted);
  background: transparent;
  border: none; border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0; flex-shrink: 0;
}
.pcfg-remove-btn:hover { background: var(--border); color: var(--text); }

/* Empty hint */
.pcfg-empty-hint {
  font-size: 0.85rem;
  color: var(--muted);
  padding: var(--space-4) 0 var(--space-2);
  margin: 0;
  text-align: center;
}

/* Footer / presets */
.pcfg-footer-row {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}
.pcfg-presets-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
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
.pcfg-advanced-body {
  padding-top: var(--space-4);
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--space-5);
  align-items: start;
}
.pcfg-adv-providers { padding-left: var(--space-4); border-left: 1px solid var(--border); }

/* ── Results ──────────────────────────────────────── */
.pricing-results-header {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: var(--space-4);
}
.pricing-results-label { font-size: 0.8rem; color: var(--muted); }
.pricing-sort-toggle {
  padding: 5px 12px; font-size: 0.78rem; font-weight: 600;
  font-family: inherit; color: var(--muted); background: var(--surface);
  border: 1px solid var(--border); border-radius: 100px; cursor: pointer; transition: all 0.15s;
}
.pricing-sort-toggle:hover { color: var(--text); border-color: color-mix(in srgb, var(--accent) 40%, transparent); }
.pricing-result-row {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: var(--space-4) var(--space-5);
  margin-bottom: var(--space-3); transition: box-shadow 0.2s, border-color 0.2s;
}
.pricing-result-row:hover { box-shadow: var(--card-shadow); border-color: color-mix(in srgb, var(--accent) 20%, var(--border)); }
.pricing-result-row.rank-1 {
  border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
  background: color-mix(in srgb, var(--accent-soft) 60%, var(--surface));
}
.pricing-result-top { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
.pricing-rank { font-size: 0.72rem; font-weight: 800; color: var(--muted); min-width: 22px; }
.rank-1 .pricing-rank { color: var(--accent); }
.pricing-model-name { font-size: 0.95rem; font-weight: 700; color: var(--text); flex: 1; }
.pricing-provider-badge { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 100px; white-space: nowrap; }
.pricing-costs { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; margin-left: auto; }
.pricing-monthly-cost { font-size: 1.1rem; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; white-space: nowrap; }
.pricing-per-lang-cost { font-size: 0.72rem; font-weight: 500; color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.pricing-result-meta {
  display: flex; gap: var(--space-5); flex-wrap: wrap;
  margin-bottom: var(--space-3); padding-left: 30px;
}
.pricing-meta-item { display: flex; flex-direction: column; gap: 1px; }
.pricing-meta-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); }
.pricing-meta-value { font-size: 0.85rem; font-weight: 600; color: var(--text); font-variant-numeric: tabular-nums; }
.pricing-lang-breakdown {
  padding-left: 30px; margin-bottom: var(--space-3);
  display: flex; flex-wrap: wrap; gap: var(--space-2);
}
.pricing-lang-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; font-size: 0.75rem; font-weight: 600;
  color: var(--muted); background: var(--bg-secondary);
  border: 1px solid var(--border); border-radius: 100px; font-variant-numeric: tabular-nums;
}
.pricing-bar-wrap { padding-left: 30px; margin-bottom: var(--space-2); }
.pricing-bar-track { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
.pricing-bar-fill { height: 100%; border-radius: 3px; background: var(--accent); transition: width 0.3s ease; }
.pricing-result-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-left: 30px; margin-top: var(--space-2);
}
.pricing-notes { font-size: 0.75rem; color: var(--muted); font-style: italic; }
.pricing-updated { font-size: 0.68rem; color: var(--muted); }
.pricing-no-results { text-align: center; padding: var(--space-8) var(--space-4); color: var(--muted); font-size: 0.9rem; }

/* Misc shared */
.pricing-range { width: 100%; height: 4px; margin-bottom: var(--space-2); accent-color: var(--accent); cursor: pointer; }
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
.pcfg-adv-hint {
  margin: var(--space-2) 0 0;
  font-size: 0.76rem;
  color: var(--muted);
  line-height: 1.5;
  min-height: 1.1em;
}
.pcfg-adv-hint strong { color: var(--text); font-weight: 600; }

@media (max-width: 680px) {
  .pcfg-col-headers { display: none !important; }
  .pcfg-pair-row { grid-template-columns: 1fr 20px 1fr; grid-template-rows: auto auto; gap: var(--space-2); }
  .pcfg-words-cell { grid-column: 1 / 3; justify-content: flex-start; }
  .pcfg-remove-btn { grid-column: 3; grid-row: 2; justify-self: end; }
  .pcfg-advanced-body { grid-template-columns: 1fr; }
  .pcfg-adv-providers { border-left: none; padding-left: 0; border-top: 1px solid var(--border); padding-top: var(--space-4); }
}
</style>

<script>
(function () {
  var MODELS = {{ site.data.llm_pricing | jsonify }};

  var LANGUAGES = [
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
    { code: 'AR',    name: 'Arabic',                group: 'Arabic / RTL',     tokensPerWord: 1.70, wordExpansion: 1.35 },
    { code: 'HE',    name: 'Hebrew',                group: 'Arabic / RTL',     tokensPerWord: 1.55, wordExpansion: 1.30 },
    { code: 'FA',    name: 'Persian',               group: 'Arabic / RTL',     tokensPerWord: 1.65, wordExpansion: 1.30 },
    { code: 'UR',    name: 'Urdu',                  group: 'Arabic / RTL',     tokensPerWord: 1.65, wordExpansion: 1.30 },
    { code: 'ZH',    name: 'Chinese (Simplified)',  group: 'CJK',              tokensPerWord: 2.00, wordExpansion: 0.70 },
    { code: 'ZH-TW', name: 'Chinese (Traditional)', group: 'CJK',             tokensPerWord: 2.00, wordExpansion: 0.70 },
    { code: 'JA',    name: 'Japanese',              group: 'CJK',              tokensPerWord: 2.20, wordExpansion: 0.75 },
    { code: 'KO',    name: 'Korean',                group: 'CJK',              tokensPerWord: 1.80, wordExpansion: 0.90 },
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
    'Meta (via API)': { bg: '#1877f222', text: '#1877f2' },
    'DeepSeek':       { bg: '#4d6bfe22', text: '#3d55e0' }
  };

  var PRESETS = {
    small: { pairs: [
      { src: 'EN', tgt: 'FR', words: 50000 },
      { src: 'EN', tgt: 'DE', words: 50000 },
      { src: 'EN', tgt: 'ES', words: 50000 }
    ]},
    mid: { pairs: [
      { src: 'EN', tgt: 'FR', words: 100000 }, { src: 'EN', tgt: 'DE', words: 100000 },
      { src: 'EN', tgt: 'ES', words: 100000 }, { src: 'EN', tgt: 'IT', words:  80000 },
      { src: 'EN', tgt: 'PT', words:  80000 }, { src: 'EN', tgt: 'NL', words:  60000 },
      { src: 'EN', tgt: 'PL', words:  60000 }, { src: 'EN', tgt: 'CS', words:  40000 }
    ]},
    enterprise: { pairs: [
      { src: 'EN', tgt: 'FR', words: 500000 }, { src: 'EN', tgt: 'DE', words: 500000 },
      { src: 'EN', tgt: 'ES', words: 500000 }, { src: 'EN', tgt: 'IT', words: 400000 },
      { src: 'EN', tgt: 'PT', words: 400000 }, { src: 'EN', tgt: 'NL', words: 300000 },
      { src: 'EN', tgt: 'PL', words: 300000 }, { src: 'EN', tgt: 'RU', words: 300000 },
      { src: 'EN', tgt: 'AR', words: 300000 }, { src: 'EN', tgt: 'ZH', words: 400000 },
      { src: 'EN', tgt: 'JA', words: 400000 }, { src: 'EN', tgt: 'KO', words: 300000 }
    ]},
    multilingual: { pairs: [
      { src: 'EN', tgt: 'FR', words: 100000 }, { src: 'EN', tgt: 'DE', words: 100000 },
      { src: 'EN', tgt: 'ES', words: 100000 }, { src: 'EN', tgt: 'ZH', words:  80000 },
      { src: 'EN', tgt: 'JA', words:  80000 }, { src: 'DE', tgt: 'EN', words:  60000 },
      { src: 'DE', tgt: 'FR', words:  40000 }, { src: 'FR', tgt: 'EN', words:  50000 },
      { src: 'JA', tgt: 'EN', words:  70000 }, { src: 'ZH', tgt: 'EN', words:  70000 }
    ]}
  };

  var nextId = 0;
  var state = {
    pairs: [],
    sortAsc: true,
    activeProviders: {}
  };
  MODELS.forEach(function (m) { state.activeProviders[m.provider] = true; });

  /* ── Helpers ── */
  function langByCode(code) {
    return LANGUAGES.find(function (l) { return l.code === code; }) || LANGUAGES[0];
  }
  function langGroups() {
    var seen = [], out = [];
    LANGUAGES.forEach(function (l) { if (seen.indexOf(l.group) === -1) { seen.push(l.group); out.push(l.group); } });
    return out;
  }
  function buildSelectOptions(selectedCode) {
    return langGroups().map(function (g) {
      var opts = LANGUAGES.filter(function (l) { return l.group === g; }).map(function (l) {
        return '<option value="' + l.code + '"' + (l.code === selectedCode ? ' selected' : '') + '>' +
          l.name + ' (' + l.code + ')</option>';
      }).join('');
      return '<optgroup label="' + g + '">' + opts + '</optgroup>';
    }).join('');
  }
  function fmt(n, dec) {
    if (dec === undefined) dec = 2;
    return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function fmtWords(n) {
    if (n >= 1e6) return fmt(n / 1e6, 1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
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
    return String(Math.round(n));
  }

  /* ── Cost calculation ── */
  function calcModelCost(model) {
    var wordsPerCall       = parseInt(document.getElementById('words-per-call').value, 10)       || 500;
    var systemPromptTokens = parseInt(document.getElementById('system-prompt-tokens').value, 10) || 300;
    var totalIn = 0, totalOut = 0, totalCalls = 0;

    var perPair = state.pairs.map(function (p) {
      var src = langByCode(p.src);
      var tgt = langByCode(p.tgt);
      var inputTokPerCall  = Math.ceil(wordsPerCall * src.tokensPerWord) + systemPromptTokens;
      var outputTokPerCall = Math.ceil(wordsPerCall * tgt.wordExpansion * tgt.tokensPerWord);
      var calls = Math.ceil(p.words / wordsPerCall);
      var inTok = calls * inputTokPerCall;
      var outTok = calls * outputTokPerCall;
      var cost = (inTok / 1e6 * model.input_cost_per_1m) + (outTok / 1e6 * model.output_cost_per_1m);
      totalIn    += inTok;
      totalOut   += outTok;
      totalCalls += calls;
      return { src: p.src, tgt: p.tgt, words: p.words, cost: cost };
    });

    var totalCost = (totalIn / 1e6 * model.input_cost_per_1m) + (totalOut / 1e6 * model.output_cost_per_1m);
    return { totalCost: totalCost, totalIn: totalIn, totalOut: totalOut, totalCalls: totalCalls, perPair: perPair };
  }

  /* ── Render pairs list ── */
  function renderPairs() {
    var list    = document.getElementById('pairs-list');
    var hint    = document.getElementById('pcfg-empty-hint');
    var headers = document.getElementById('pcfg-col-headers');
    var total   = document.getElementById('pcfg-total');

    if (state.pairs.length === 0) {
      list.innerHTML = '';
      hint.style.display = '';
      headers.style.display = 'none';
      total.innerHTML = '';
      return;
    }

    hint.style.display = 'none';
    headers.style.display = '';

    list.innerHTML = state.pairs.map(function (p) {
      var srcLang  = langByCode(p.src);
      var tgtLang  = langByCode(p.tgt);
      var srcColor = GROUP_COLORS[srcLang.group] || '#888';
      var tgtColor = GROUP_COLORS[tgtLang.group] || '#888';

      return '<div class="pcfg-pair-row" data-id="' + p.id + '">' +
        '<div class="pcfg-pair-cell">' +
          '<span class="pcfg-pair-dot" style="background:' + srcColor + '"></span>' +
          '<select class="pcfg-pair-select pcfg-src-sel" data-id="' + p.id + '" aria-label="Source language">' +
            buildSelectOptions(p.src) +
          '</select>' +
        '</div>' +
        '<div class="pcfg-pair-arrow">→</div>' +
        '<div class="pcfg-pair-cell">' +
          '<span class="pcfg-pair-dot" style="background:' + tgtColor + '"></span>' +
          '<select class="pcfg-pair-select pcfg-tgt-sel" data-id="' + p.id + '" aria-label="Target language">' +
            buildSelectOptions(p.tgt) +
          '</select>' +
        '</div>' +
        '<div class="pcfg-words-cell">' +
          '<span class="pcfg-words-label">words/mo</span>' +
          '<input type="number" class="pcfg-words-input" value="' + p.words + '" min="100" step="1000" data-id="' + p.id + '" aria-label="Word count">' +
        '</div>' +
        '<button class="pcfg-remove-btn" data-id="' + p.id + '" aria-label="Remove pair">×</button>' +
      '</div>';
    }).join('');

    /* wire up row events */
    list.querySelectorAll('.pcfg-src-sel').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var p = pairById(parseInt(sel.dataset.id, 10));
        if (p) { p.src = sel.value; updateDotColor(sel, sel.value); render(); }
        updateTotal();
      });
    });
    list.querySelectorAll('.pcfg-tgt-sel').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var p = pairById(parseInt(sel.dataset.id, 10));
        if (p) { p.tgt = sel.value; updateDotColor(sel, sel.value); render(); }
        updateTotal();
      });
    });
    list.querySelectorAll('.pcfg-words-input').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var v = parseInt(inp.value, 10);
        var p = pairById(parseInt(inp.dataset.id, 10));
        if (p && !isNaN(v) && v >= 0) { p.words = v; render(); }
        updateTotal();
      });
    });
    list.querySelectorAll('.pcfg-remove-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.dataset.id, 10);
        state.pairs = state.pairs.filter(function (p) { return p.id !== id; });
        renderPairs();
        render();
      });
    });

    updateTotal();
  }

  function pairById(id) {
    return state.pairs.find(function (p) { return p.id === id; });
  }

  function updateDotColor(select, code) {
    var dot = select.parentElement.querySelector('.pcfg-pair-dot');
    if (dot) dot.style.background = GROUP_COLORS[langByCode(code).group] || '#888';
  }

  function updateTotal() {
    var total = document.getElementById('pcfg-total');
    if (state.pairs.length === 0) { total.innerHTML = ''; return; }
    var totalWords = state.pairs.reduce(function (s, p) { return s + p.words; }, 0);
    var srcSet = [];
    state.pairs.forEach(function (p) { if (srcSet.indexOf(p.src) === -1) srcSet.push(p.src); });
    total.innerHTML =
      '<strong>' + state.pairs.length + ' pair' + (state.pairs.length !== 1 ? 's' : '') + '</strong>' +
      ' · <strong>' + fmtWords(totalWords) + '</strong> words/mo total' +
      ' · ' + srcSet.length + ' source language' + (srcSet.length !== 1 ? 's' : '') +
      ' (' + srcSet.join(', ') + ')';
  }

  /* ── Add pair button ── */
  function buildAddPairBtn() {
    document.getElementById('add-pair-btn').addEventListener('click', function () {
      var lastSrc = state.pairs.length ? state.pairs[state.pairs.length - 1].src : 'EN';
      var lastTgt = state.pairs.length ? state.pairs[state.pairs.length - 1].tgt : 'FR';
      // pick a different target than the last one if possible
      var nextTgt = lastTgt;
      state.pairs.push({ id: nextId++, src: lastSrc, tgt: nextTgt, words: 50000 });
      renderPairs();
      render();
      // scroll to last row
      var rows = document.querySelectorAll('.pcfg-pair-row');
      if (rows.length) rows[rows.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  /* ── Presets ── */
  function buildPresets() {
    document.querySelectorAll('.pricing-preset-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = PRESETS[btn.dataset.preset];
        if (!p) return;
        state.pairs = p.pairs.map(function (pair) {
          return { id: nextId++, src: pair.src, tgt: pair.tgt, words: pair.words };
        });
        renderPairs();
        render();
      });
    });
  }

  /* ── Provider filters ── */
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

  /* ── Advanced sliders ── */
  function wpcHint(v) {
    v = parseInt(v, 10);
    if (v <= 100)  return '<strong>Segment-by-segment</strong> — one sentence per call. Highest system prompt overhead per word.';
    if (v <= 300)  return '<strong>Paragraph-level</strong> — a few sentences per call. Moderate overhead.';
    if (v <= 500)  return '<strong>Batched</strong> — multiple paragraphs per call. Cost-efficient for most pipelines.';
    if (v <= 1500) return '<strong>Large batch</strong> — full pages per call. Low overhead; requires reliable sentence splitting.';
    return '<strong>Document-level</strong> — maximum efficiency. Needs a large-context model (check context window limit).';
  }

  function sptHint(v) {
    v = parseInt(v, 10);
    if (v <= 100)  return '<strong>Minimal</strong> — language pair and basic instruction only. e.g. "Translate EN→DE."';
    if (v <= 300)  return '<strong>Standard</strong> — includes tone, register, or domain notes. Most common for MT workflows.';
    if (v <= 700)  return '<strong>Detailed</strong> — style guide, terminology rules, or formatting constraints.';
    if (v <= 1500) return '<strong>Extended</strong> — inline glossary or few-shot translation examples. Charged on every call.';
    return '<strong>Heavy</strong> — large glossary or multi-example prompts. Consider caching to reduce cost.';
  }

  function syncSlider(rangeId, numberId, displayId, hintFn, hintId) {
    var range  = document.getElementById(rangeId);
    var number = document.getElementById(numberId);
    var disp   = document.getElementById(displayId);
    var hint   = hintId ? document.getElementById(hintId) : null;
    function update(v) {
      range.value = number.value = v;
      if (disp) disp.textContent = Number(v).toLocaleString();
      if (hint && hintFn) hint.innerHTML = hintFn(v);
      render();
    }
    range.addEventListener('input',  function () { update(range.value); });
    number.addEventListener('input', function () { if (!isNaN(parseInt(number.value, 10))) update(number.value); });
    // set initial hint
    if (hint && hintFn) hint.innerHTML = hintFn(range.value);
  }

  /* ── Sort toggle ── */
  function buildSortToggle() {
    var btn = document.getElementById('sort-toggle');
    btn.addEventListener('click', function () {
      state.sortAsc = !state.sortAsc;
      btn.innerHTML = 'Sort: ' + (state.sortAsc ? 'cheapest first' : 'most expensive first') +
        ' <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-left:4px;vertical-align:middle;"><path d="M2 4l4-3 4 3M2 8l4 3 4-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      render();
    });
  }

  /* ── Render results ── */
  function render() {
    if (state.pairs.length === 0) {
      document.getElementById('results-summary').textContent = '';
      document.getElementById('results-grid').innerHTML =
        '<div class="pricing-no-results">Add at least one language pair above to see cost estimates.</div>';
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
    var totalWords = state.pairs.reduce(function (s, p) { return s + p.words; }, 0);

    document.getElementById('results-summary').textContent =
      results.length + ' model' + (results.length !== 1 ? 's' : '') +
      ' — ' + state.pairs.length + ' pair' + (state.pairs.length !== 1 ? 's' : '') +
      ' · ' + fmtWords(totalWords) + ' words/mo total';

    if (results.length === 0) {
      document.getElementById('results-grid').innerHTML =
        '<div class="pricing-no-results">No providers selected. Enable at least one in Advanced settings.</div>';
      return;
    }

    var showBreakdown = state.pairs.length > 1;

    document.getElementById('results-grid').innerHTML = results.map(function (r, i) {
      var pColor    = PROVIDER_COLORS[r.model.provider] || { bg: '#88888822', text: '#666' };
      var barPct    = maxCost > 0 ? (r.totalCost / maxCost * 100).toFixed(1) : 0;
      var rankClass = i === 0 ? ' rank-1' : '';
      var costPerWord = totalWords > 0 ? r.totalCost / totalWords : 0;

      var costBlock = showBreakdown
        ? '<div class="pricing-costs">' +
            '<span class="pricing-monthly-cost">' + fmtCost(r.totalCost) +
              '<span style="font-size:0.65rem;font-weight:500;color:var(--muted)">/mo total</span></span>' +
            '<span class="pricing-per-lang-cost">avg ' + fmtCost(r.totalCost / state.pairs.length) + ' per pair</span>' +
          '</div>'
        : '<div class="pricing-costs"><span class="pricing-monthly-cost">' + fmtCost(r.totalCost) +
            '<span style="font-size:0.65rem;font-weight:500;color:var(--muted)">/mo</span></span></div>';

      var breakdown = showBreakdown
        ? '<div class="pricing-lang-breakdown">' +
            r.perPair.map(function (pp) {
              var srcColor = GROUP_COLORS[langByCode(pp.src).group] || '#888';
              var tgtColor = GROUP_COLORS[langByCode(pp.tgt).group] || '#888';
              return '<span class="pricing-lang-pill">' +
                '<span style="width:6px;height:6px;border-radius:50%;background:' + srcColor + ';display:inline-block;flex-shrink:0"></span>' +
                pp.src + '→' + pp.tgt +
                '<span style="width:6px;height:6px;border-radius:50%;background:' + tgtColor + ';display:inline-block;flex-shrink:0;margin-left:2px"></span>' +
                ' ' + fmtCost(pp.cost) +
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

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    // load small preset by default
    var p = PRESETS.small;
    state.pairs = p.pairs.map(function (pair) {
      return { id: nextId++, src: pair.src, tgt: pair.tgt, words: pair.words };
    });

    buildAddPairBtn();
    buildPresets();
    buildProviderFilters();
    syncSlider('words-per-call-range',       'words-per-call',       'words-per-call-display',       wpcHint, 'wpc-hint');
    syncSlider('system-prompt-tokens-range', 'system-prompt-tokens', 'system-prompt-tokens-display', sptHint, 'spt-hint');
    buildSortToggle();
    renderPairs();
    render();
  });
})();
</script>
