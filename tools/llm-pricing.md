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
  <p class="all-articles-subtitle">Compare monthly API spend across major models based on your translation program volume and language mix.</p>
</section>

<p class="intel-disclaimer" style="margin-bottom: var(--space-6);">
  <strong>Note:</strong> Prices are fetched weekly from the OpenRouter public API and reflect standard API list prices as of the date shown per model. This tool estimates API token costs only — it excludes infrastructure, human post-editing (MTPE), TMS integration, or volume discount pricing. Always verify rates directly with providers before budgeting.
</p>

<div class="pricing-sim-wrap">

  <!-- Inputs panel -->
  <aside class="pricing-sim-panel" id="pricing-inputs">

    <div class="pricing-sim-section-head">Volume</div>

    <div class="pricing-param">
      <div class="pricing-param-header">
        <label class="filter-label" for="monthly-words">Monthly word volume <span style="font-weight:400;text-transform:none;letter-spacing:0">(per language)</span></label>
        <span class="pricing-param-value" id="monthly-words-display">100,000</span>
      </div>
      <input type="range" id="monthly-words-range" min="1000" max="10000000" step="1000" value="100000" class="pricing-range">
      <input type="number" id="monthly-words" min="1000" max="10000000" step="1000" value="100000" class="pricing-number-input">
    </div>

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

    <div class="pricing-sim-section-head" style="margin-top: var(--space-5);">Source language group</div>
    <div class="pricing-lang-chips" id="source-group-chips"></div>

    <div class="pricing-sim-section-head" style="margin-top: var(--space-5);">Target language group</div>
    <div class="pricing-lang-chips" id="target-group-chips"></div>

    <div class="pricing-param" style="margin-top: var(--space-4);">
      <div class="pricing-param-header">
        <label class="filter-label" for="num-languages">Number of target languages</label>
        <span class="pricing-param-value" id="num-languages-display">1</span>
      </div>
      <input type="range" id="num-languages-range" min="1" max="50" step="1" value="1" class="pricing-range">
      <input type="number" id="num-languages" min="1" max="50" step="1" value="1" class="pricing-number-input">
    </div>

    <!-- Advanced overrides — shown only when Custom group is selected -->
    <div id="advanced-params" style="display:none;">
      <div class="pricing-sim-section-head" style="margin-top: var(--space-4);">Custom values</div>
      <div class="pricing-param">
        <div class="pricing-param-header">
          <label class="filter-label" for="tokens-per-word">Tokens per source word</label>
          <span class="pricing-param-value" id="tokens-per-word-display">1.30</span>
        </div>
        <input type="range" id="tokens-per-word-range" min="0.5" max="2.5" step="0.05" value="1.30" class="pricing-range">
        <input type="number" id="tokens-per-word" min="0.5" max="2.5" step="0.05" value="1.30" class="pricing-number-input">
      </div>
      <div class="pricing-param">
        <div class="pricing-param-header">
          <label class="filter-label" for="expansion-ratio">Output expansion ratio</label>
          <span class="pricing-param-value" id="expansion-ratio-display">1.10</span>
        </div>
        <input type="range" id="expansion-ratio-range" min="0.5" max="2.0" step="0.05" value="1.10" class="pricing-range">
        <input type="number" id="expansion-ratio" min="0.5" max="2.0" step="0.05" value="1.10" class="pricing-number-input">
      </div>
    </div>

    <div class="pricing-sim-section-head" style="margin-top: var(--space-5);">Providers</div>
    <div class="filter-chips" id="provider-filters"></div>

    <div class="pricing-sim-section-head" style="margin-top: var(--space-5);">Presets</div>
    <div style="display: flex; flex-direction: column; gap: var(--space-2);">
      <button class="pricing-preset-btn" data-preset="small">Small agency — 50K words, 3 languages</button>
      <button class="pricing-preset-btn" data-preset="mid">Mid-size LSP — 500K words, 8 languages</button>
      <button class="pricing-preset-btn" data-preset="enterprise">Enterprise — 5M words, 20 languages</button>
    </div>

  </aside>

  <!-- Results panel -->
  <div class="pricing-sim-results" id="pricing-results">
    <div class="pricing-results-header">
      <span class="pricing-results-label" id="results-summary"></span>
      <button class="pricing-sort-toggle" id="sort-toggle" title="Toggle sort order">
        Sort: cheapest first
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-left:4px;vertical-align:middle;" aria-hidden="true"><path d="M2 4l4-3 4 3M2 8l4 3 4-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
    <div id="results-grid"></div>
  </div>

</div>

<style>
.pricing-sim-wrap {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: var(--space-6);
  align-items: start;
  margin-top: var(--space-2);
}
.pricing-sim-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  position: sticky;
  top: 72px;
  max-height: calc(100vh - 96px);
  overflow-y: auto;
}
.pricing-sim-section-head {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--border);
}
.pricing-param {
  margin-bottom: var(--space-4);
}
.pricing-param-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}
.pricing-param-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
.pricing-range {
  width: 100%;
  height: 4px;
  margin-bottom: var(--space-2);
  accent-color: var(--accent);
  cursor: pointer;
}
.pricing-number-input {
  width: 100%;
  padding: 5px 10px;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: inherit;
  color: var(--text);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.pricing-number-input:focus { border-color: var(--accent); }
.pricing-lang-chips {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}
.pricing-lang-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 12px;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: inherit;
  color: var(--muted);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  width: 100%;
}
.pricing-lang-chip:hover {
  color: var(--text);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
}
.pricing-lang-chip.active {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-soft);
  font-weight: 700;
}
.pricing-lang-chip-examples {
  font-size: 0.68rem;
  font-weight: 400;
  color: var(--muted);
  margin-left: var(--space-2);
}
.pricing-lang-chip.active .pricing-lang-chip-examples {
  color: color-mix(in srgb, var(--accent) 60%, var(--muted));
}
.pricing-lang-chip-stat {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--muted);
  white-space: nowrap;
  margin-left: auto;
  padding-left: var(--space-2);
}
.pricing-lang-chip.active .pricing-lang-chip-stat {
  color: var(--accent);
}
.pricing-preset-btn {
  padding: 7px 12px;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: inherit;
  color: var(--muted);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}
.pricing-preset-btn:hover {
  color: var(--text);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  background: var(--accent-soft);
}
.pricing-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}
.pricing-results-label {
  font-size: 0.8rem;
  color: var(--muted);
}
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
  transition: all 0.15s ease;
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
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
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
.pricing-rank {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--muted);
  min-width: 22px;
}
.rank-1 .pricing-rank { color: var(--accent); }
.pricing-model-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  flex: 1;
}
.pricing-provider-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 100px;
  white-space: nowrap;
}
.pricing-costs {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: auto;
  gap: 1px;
}
.pricing-monthly-cost {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.pricing-per-lang-cost {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.pricing-result-meta {
  display: flex;
  gap: var(--space-5);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
  padding-left: 30px;
}
.pricing-meta-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.pricing-meta-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--muted);
}
.pricing-meta-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
.pricing-bar-wrap {
  padding-left: 30px;
  margin-bottom: var(--space-2);
}
.pricing-bar-track {
  height: 5px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}
.pricing-bar-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--accent);
  transition: width 0.3s ease;
}
.pricing-result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 30px;
  margin-top: var(--space-2);
}
.pricing-notes {
  font-size: 0.75rem;
  color: var(--muted);
  font-style: italic;
}
.pricing-updated {
  font-size: 0.68rem;
  color: var(--muted);
}
.pricing-no-results {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--muted);
  font-size: 0.9rem;
}
@media (max-width: 900px) {
  .pricing-sim-wrap {
    grid-template-columns: 1fr;
  }
  .pricing-sim-panel {
    position: static;
    max-height: none;
  }
}
</style>

<script>
(function() {
  var MODELS = {{ site.data.llm_pricing | jsonify }};

  var LANG_GROUPS = [
    { id: 'w-european', label: 'Western European', examples: 'EN, FR, DE, ES, IT, PT, NL', tokensPerWord: 1.30, expansionRatio: 1.15 },
    { id: 'e-european', label: 'Eastern European', examples: 'PL, RU, CS, UK, RO, HU',     tokensPerWord: 1.45, expansionRatio: 1.20 },
    { id: 'rtl',        label: 'Arabic / RTL',     examples: 'AR, HE, FA, UR',              tokensPerWord: 1.65, expansionRatio: 1.35 },
    { id: 'cjk',        label: 'CJK',              examples: 'ZH, JA, KO',                  tokensPerWord: 2.10, expansionRatio: 0.85 },
    { id: 'asian',      label: 'South / SE Asian', examples: 'HI, TH, VI, ID, MS',          tokensPerWord: 1.70, expansionRatio: 1.15 },
    { id: 'custom',     label: 'Custom',            examples: 'set manually',                tokensPerWord: null, expansionRatio: null }
  ];

  var PROVIDER_COLORS = {
    'OpenAI':         { bg: '#10a37f22', text: '#0d8c6a' },
    'Anthropic':      { bg: '#d4622222', text: '#b84d16' },
    'Google':         { bg: '#1a73e822', text: '#1a73e8' },
    'Meta (via API)': { bg: '#1877f222', text: '#1877f2' }
  };

  var PRESETS = {
    small:      { monthlyWords: 50000,   wordsPerCall: 300,  systemPromptTokens: 200, srcGroup: 'w-european', tgtGroup: 'w-european', numLanguages: 3  },
    mid:        { monthlyWords: 500000,  wordsPerCall: 500,  systemPromptTokens: 300, srcGroup: 'w-european', tgtGroup: 'w-european', numLanguages: 8  },
    enterprise: { monthlyWords: 5000000, wordsPerCall: 1000, systemPromptTokens: 400, srcGroup: 'w-european', tgtGroup: 'e-european', numLanguages: 20 }
  };

  var state = {
    srcGroupId: 'w-european',
    tgtGroupId: 'w-european',
    sortAsc: true,
    activeProviders: {}
  };

  MODELS.forEach(function(m) { state.activeProviders[m.provider] = true; });

  function groupById(id) {
    return LANG_GROUPS.find(function(g) { return g.id === id; }) || LANG_GROUPS[0];
  }

  function getParams() {
    var src = groupById(state.srcGroupId);
    var tgt = groupById(state.tgtGroupId);
    return {
      monthlyWords:       parseFloat(document.getElementById('monthly-words').value)        || 100000,
      wordsPerCall:       parseFloat(document.getElementById('words-per-call').value)       || 500,
      systemPromptTokens: parseFloat(document.getElementById('system-prompt-tokens').value) || 300,
      numLanguages:       parseInt(document.getElementById('num-languages').value, 10)      || 1,
      tokensPerWord:      src.tokensPerWord  !== null ? src.tokensPerWord  : (parseFloat(document.getElementById('tokens-per-word').value)  || 1.3),
      expansionRatio:     tgt.expansionRatio !== null ? tgt.expansionRatio : (parseFloat(document.getElementById('expansion-ratio').value)  || 1.1)
    };
  }

  function calcCost(model, p) {
    var inputTok     = Math.ceil(p.wordsPerCall * p.tokensPerWord) + p.systemPromptTokens;
    var outputTok    = Math.ceil(p.wordsPerCall * p.tokensPerWord * p.expansionRatio);
    var callsPerLang = Math.ceil(p.monthlyWords / p.wordsPerCall);
    var totalCalls   = callsPerLang * p.numLanguages;
    var totalIn      = totalCalls * inputTok;
    var totalOut     = totalCalls * outputTok;
    var totalCost    = (totalIn / 1e6 * model.input_cost_per_1m) + (totalOut / 1e6 * model.output_cost_per_1m);
    var perLangCost  = totalCost / p.numLanguages;
    return {
      totalCost:      totalCost,
      perLangCost:    perLangCost,
      costPerWord:    perLangCost / p.monthlyWords,
      costPerMillion: perLangCost / p.monthlyWords * 1e6,
      totalCalls:     totalCalls,
      totalInputTok:  totalIn,
      totalOutputTok: totalOut
    };
  }

  function fmt(n, dec) {
    if (dec === undefined) dec = 2;
    return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
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

  function syncAdvancedVisibility() {
    var show = state.srcGroupId === 'custom' || state.tgtGroupId === 'custom';
    document.getElementById('advanced-params').style.display = show ? '' : 'none';
  }

  function render() {
    var p = getParams();
    var visible = MODELS.filter(function(m) { return state.activeProviders[m.provider]; });
    var results = visible.map(function(m) {
      return Object.assign({ model: m }, calcCost(m, p));
    });

    results.sort(function(a, b) {
      return state.sortAsc ? a.totalCost - b.totalCost : b.totalCost - a.totalCost;
    });

    var maxCost = results.reduce(function(acc, r) { return Math.max(acc, r.totalCost); }, 0);
    var grid    = document.getElementById('results-grid');
    var summary = document.getElementById('results-summary');

    var totalWords = p.monthlyWords * p.numLanguages;
    var langLabel  = p.numLanguages === 1 ? '1 language' : p.numLanguages + ' languages';
    summary.textContent = results.length + ' model' + (results.length !== 1 ? 's' : '') +
      ' — ' + fmt(p.monthlyWords) + ' words × ' + langLabel +
      ' = ' + fmtTokens(totalWords) + ' words/mo total';

    if (results.length === 0) {
      grid.innerHTML = '<div class="pricing-no-results">No providers selected. Enable at least one above.</div>';
      return;
    }

    var multiLang = p.numLanguages > 1;

    grid.innerHTML = results.map(function(r, i) {
      var pColor   = PROVIDER_COLORS[r.model.provider] || { bg: '#88888822', text: '#666' };
      var barPct   = maxCost > 0 ? (r.totalCost / maxCost * 100).toFixed(1) : 0;
      var rankClass = i === 0 ? ' rank-1' : '';

      var costBlock = multiLang
        ? '<div class="pricing-costs">' +
            '<span class="pricing-monthly-cost">' + fmtCost(r.totalCost) + '<span style="font-size:0.65rem;font-weight:500;color:var(--muted)">/mo total</span></span>' +
            '<span class="pricing-per-lang-cost">' + fmtCost(r.perLangCost) + '/mo per language</span>' +
          '</div>'
        : '<div class="pricing-costs">' +
            '<span class="pricing-monthly-cost">' + fmtCost(r.totalCost) + '<span style="font-size:0.65rem;font-weight:500;color:var(--muted)">/mo</span></span>' +
          '</div>';

      return '<div class="pricing-result-row' + rankClass + '">' +
        '<div class="pricing-result-top">' +
          '<span class="pricing-rank">' + (i + 1) + '</span>' +
          '<span class="pricing-model-name">' + r.model.name + '</span>' +
          '<span class="pricing-provider-badge" style="background:' + pColor.bg + ';color:' + pColor.text + '">' + r.model.provider + '</span>' +
          costBlock +
        '</div>' +
        '<div class="pricing-result-meta">' +
          '<div class="pricing-meta-item"><span class="pricing-meta-label">Per word</span><span class="pricing-meta-value">' + fmtCost(r.costPerWord) + '</span></div>' +
          '<div class="pricing-meta-item"><span class="pricing-meta-label">Per 1M words</span><span class="pricing-meta-value">' + fmtCost(r.costPerMillion) + '</span></div>' +
          '<div class="pricing-meta-item"><span class="pricing-meta-label">Total API calls</span><span class="pricing-meta-value">' + fmtTokens(r.totalCalls) + '</span></div>' +
          '<div class="pricing-meta-item"><span class="pricing-meta-label">Input tokens</span><span class="pricing-meta-value">' + fmtTokens(r.totalInputTok) + '</span></div>' +
          '<div class="pricing-meta-item"><span class="pricing-meta-label">Output tokens</span><span class="pricing-meta-value">' + fmtTokens(r.totalOutputTok) + '</span></div>' +
        '</div>' +
        '<div class="pricing-bar-wrap"><div class="pricing-bar-track"><div class="pricing-bar-fill" style="width:' + barPct + '%"></div></div></div>' +
        '<div class="pricing-result-footer">' +
          '<span class="pricing-notes">' + (r.model.notes || '') + '</span>' +
          '<span class="pricing-updated">Updated ' + (r.model.last_updated || '—') + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function buildLangChips(containerId, groupKey, statKey, statSuffix) {
    var container = document.getElementById(containerId);
    container.innerHTML = LANG_GROUPS.map(function(g) {
      var statLabel = g[statKey] !== null ? g[statKey] + statSuffix : '—';
      return '<button class="pricing-lang-chip" data-group="' + g.id + '">' +
        '<span>' + g.label + ' <span class="pricing-lang-chip-examples">' + g.examples + '</span></span>' +
        '<span class="pricing-lang-chip-stat">' + statLabel + '</span>' +
      '</button>';
    }).join('');

    // set initial active
    var initial = groupKey === 'srcGroupId' ? state.srcGroupId : state.tgtGroupId;
    container.querySelector('[data-group="' + initial + '"]').classList.add('active');

    container.addEventListener('click', function(e) {
      var btn = e.target.closest('.pricing-lang-chip');
      if (!btn) return;
      container.querySelectorAll('.pricing-lang-chip').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state[groupKey] = btn.dataset.group;
      syncAdvancedVisibility();
      render();
    });
  }

  function syncSliderToNumber(rangeId, numberId, displayId, toFixed) {
    var range  = document.getElementById(rangeId);
    var number = document.getElementById(numberId);
    var disp   = document.getElementById(displayId);

    function update(v) {
      number.value = v;
      range.value  = v;
      if (disp) disp.textContent = toFixed ? parseFloat(v).toFixed(toFixed) : Number(v).toLocaleString();
      render();
    }
    range.addEventListener('input',  function() { update(range.value);  });
    number.addEventListener('input', function() { if (!isNaN(parseFloat(number.value))) update(number.value); });
  }

  function buildProviderFilters() {
    var providers = [];
    MODELS.forEach(function(m) { if (providers.indexOf(m.provider) === -1) providers.push(m.provider); });
    var container = document.getElementById('provider-filters');
    container.innerHTML = providers.map(function(p) {
      var c = PROVIDER_COLORS[p] || { bg: '#88888822', text: '#666' };
      return '<button class="filter-chip active pricing-provider-toggle" data-provider="' + p + '">' +
        '<span class="chip-dot" style="background:' + c.text + '"></span>' + p +
      '</button>';
    }).join('');
    container.addEventListener('click', function(e) {
      var btn = e.target.closest('.pricing-provider-toggle');
      if (!btn) return;
      state.activeProviders[btn.dataset.provider] = !state.activeProviders[btn.dataset.provider];
      btn.classList.toggle('active', state.activeProviders[btn.dataset.provider]);
      render();
    });
  }

  function setLangChipActive(containerId, groupId) {
    var container = document.getElementById(containerId);
    container.querySelectorAll('.pricing-lang-chip').forEach(function(b) { b.classList.remove('active'); });
    var target = container.querySelector('[data-group="' + groupId + '"]');
    if (target) target.classList.add('active');
  }

  function buildPresets() {
    document.querySelectorAll('.pricing-preset-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var p = PRESETS[btn.dataset.preset];
        if (!p) return;

        document.getElementById('monthly-words').value               = p.monthlyWords;
        document.getElementById('monthly-words-range').value         = p.monthlyWords;
        document.getElementById('monthly-words-display').textContent = Number(p.monthlyWords).toLocaleString();

        document.getElementById('words-per-call').value              = p.wordsPerCall;
        document.getElementById('words-per-call-range').value        = p.wordsPerCall;
        document.getElementById('words-per-call-display').textContent = p.wordsPerCall;

        document.getElementById('system-prompt-tokens').value        = p.systemPromptTokens;
        document.getElementById('system-prompt-tokens-range').value  = p.systemPromptTokens;
        document.getElementById('system-prompt-tokens-display').textContent = p.systemPromptTokens;

        document.getElementById('num-languages').value               = p.numLanguages;
        document.getElementById('num-languages-range').value         = p.numLanguages;
        document.getElementById('num-languages-display').textContent = p.numLanguages;

        state.srcGroupId = p.srcGroup;
        state.tgtGroupId = p.tgtGroup;
        setLangChipActive('source-group-chips', p.srcGroup);
        setLangChipActive('target-group-chips',  p.tgtGroup);
        syncAdvancedVisibility();
        render();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    buildLangChips('source-group-chips', 'srcGroupId', 'tokensPerWord',  ' tok/w');
    buildLangChips('target-group-chips', 'tgtGroupId', 'expansionRatio', '× exp');

    syncSliderToNumber('monthly-words-range',        'monthly-words',        'monthly-words-display',        0);
    syncSliderToNumber('words-per-call-range',       'words-per-call',       'words-per-call-display',       0);
    syncSliderToNumber('system-prompt-tokens-range', 'system-prompt-tokens', 'system-prompt-tokens-display', 0);
    syncSliderToNumber('num-languages-range',        'num-languages',        'num-languages-display',        0);
    syncSliderToNumber('tokens-per-word-range',      'tokens-per-word',      'tokens-per-word-display',      2);
    syncSliderToNumber('expansion-ratio-range',      'expansion-ratio',      'expansion-ratio-display',      2);

    buildProviderFilters();
    buildPresets();

    document.getElementById('sort-toggle').addEventListener('click', function() {
      state.sortAsc = !state.sortAsc;
      this.innerHTML = 'Sort: ' + (state.sortAsc ? 'cheapest first' : 'most expensive first') +
        ' <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-left:4px;vertical-align:middle;" aria-hidden="true"><path d="M2 4l4-3 4 3M2 8l4 3 4-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      render();
    });

    render();
  });
})();
</script>
