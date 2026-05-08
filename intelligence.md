---
layout: default
title: Intelligence
permalink: /intelligence/
nav: true
nav_order: 2
description: "Actionable localization intelligence — trend signals, impact scoring, and strategic decision-making."
---

<section class="intel-hero">
  <div class="intel-hero__share">
    {% include social-share.html as_dropdown=true title=page.title description=page.description %}
  </div>
  <h1>Localization Intelligence</h1>
  <p class="intel-subtitle">Less noise, more clarity. Structured, decision-ready intelligence for the localization industry.</p>
</section>

{% comment %} ── Dashboard Section Navigation ────────────────────── {% endcomment %}
<nav class="intel-dash-nav" id="intel-dash-nav">
  <a href="#overview-section" class="intel-dash-nav-item active" data-section="overview-section">Overview</a>
  <a href="#signals-section" class="intel-dash-nav-item" data-section="signals-section">Signals</a>
  <a href="#trends-section" class="intel-dash-nav-item" data-section="trends-section">Trends</a>
  <a href="#correlations-section" class="intel-dash-nav-item" data-section="correlations-section">Correlations</a>
  <a href="#high-impact-section" class="intel-dash-nav-item" data-section="high-impact-section">High Impact</a>
</nav>

{% comment %} ── Impact Overview Stats ─────────────────────────────── {% endcomment %}
{% assign total_posts = 0 %}
{% assign high_impact_posts = 0 %}
{% assign this_month_posts = 0 %}
{% assign now_date = site.time | date: "%Y-%m" %}
{% assign posts_with_signals = 0 %}

{% for post in site.posts %}
  {% if post.article_type == "theory" %}{% continue %}{% endif %}
  {% assign total_posts = total_posts | plus: 1 %}
  {% if post.impact_score >= 4 %}
    {% assign high_impact_posts = high_impact_posts | plus: 1 %}
  {% endif %}
  {% assign post_month = post.date | date: "%Y-%m" %}
  {% if post_month == now_date %}
    {% assign this_month_posts = this_month_posts | plus: 1 %}
  {% endif %}
  {% if post.signal_ids and post.signal_ids.size > 0 %}
    {% assign posts_with_signals = posts_with_signals | plus: 1 %}
  {% endif %}
{% endfor %}

<section class="intel-stats-grid" id="overview-section">
  <div class="intel-stat-card">
    <span class="intel-stat-number">{{ total_posts }}</span>
    <span class="intel-stat-label">Articles Tracked</span>
  </div>
  <div class="intel-stat-card">
    <span class="intel-stat-number">{{ high_impact_posts }}</span>
    <span class="intel-stat-label">High Impact (4-5)</span>
  </div>
  <div class="intel-stat-card">
    <span class="intel-stat-number">{{ site.data.signals.size }}</span>
    <span class="intel-stat-label">Active Signals</span>
  </div>
  <div class="intel-stat-card">
    <span class="intel-stat-number">{{ this_month_posts }}</span>
    <span class="intel-stat-label">This Month</span>
  </div>
</section>

{% comment %} ── Signal Health Overview (now with inline modal) ──── {% endcomment %}
<section class="intel-section" id="signals-section">
  <div class="intel-section-header">
    <div>
      <h2 class="intel-section-title">Signal Tracker</h2>
      <p class="intel-section-desc">Click any signal to see linked evidence articles. Real-time status of {{ site.data.signals.size }} industry signals.</p>
    </div>
    {% assign _signals_url = '/intelligence/#signals-section' | absolute_url %}
    {% include social-share.html as_dropdown=true title="LocReport Signal Tracker" url=_signals_url description="Real-time status of localization industry signals on LocReport." %}
  </div>

  {% comment %} Category filter for signals {% endcomment %}
  <div class="intel-signal-filters" id="signal-category-filters">
    <a class="intel-filter-pill active" href="#filter-all" data-signal-cat="all">All</a>
    <a class="intel-filter-pill" href="#filter-quality" data-signal-cat="quality">Quality</a>
    <a class="intel-filter-pill" href="#filter-operations" data-signal-cat="operations">Operations</a>
    <a class="intel-filter-pill" href="#filter-governance" data-signal-cat="governance">Governance</a>
    <a class="intel-filter-pill" href="#filter-market" data-signal-cat="market">Market</a>
    <a class="intel-filter-pill" href="#filter-strategy" data-signal-cat="strategy">Strategy</a>
    <a class="intel-filter-pill" href="#filter-watched" data-signal-cat="watched" id="watched-pill">Watched (<span id="watched-count">0</span>)</a>
  </div>

  {% comment %} Signal legend {% endcomment %}
  <div class="intel-legend">
    <div class="intel-legend-group">
      <span class="intel-legend-label">Signal status</span>
      <span class="status-badge status-badge--supported" title="Broad consensus across tracked articles">Supported</span>
      <span class="status-badge status-badge--emerging" title="Building evidence, not yet dominant">Emerging</span>
      <span class="status-badge status-badge--challenged" title="Contradictory or weakening evidence">Challenged</span>
      <span class="status-badge status-badge--mixed" title="Divided evidence">Mixed</span>
    </div>
    <div class="intel-legend-sep"></div>
    <div class="intel-legend-group">
      <span class="intel-legend-label">Article stance</span>
      <span class="stance-badge stance-badge--supports" title="Article supports the signal">Supports</span>
      <span class="stance-badge stance-badge--mixed" title="Article presents mixed evidence">Mixed</span>
      <span class="stance-badge stance-badge--contradicts" title="Article contradicts the signal">Contradicts</span>
    </div>
  </div>

  <div class="signal-health-grid">
    {% for signal in site.data.signals %}
      {% assign evidence_count = 0 %}
      {% assign supported_count = 0 %}
      {% assign mixed_count = 0 %}
      {% assign contradicts_count = 0 %}
      {% for post in site.posts %}
        {% if post.article_type == "theory" %}{% continue %}{% endif %}
        {% if post.signal_ids contains signal.id %}
          {% assign evidence_count = evidence_count | plus: 1 %}
          {% if post.signal_stance == "supports" %}
            {% assign supported_count = supported_count | plus: 1 %}
          {% elsif post.signal_stance == "mixed" %}
            {% assign mixed_count = mixed_count | plus: 1 %}
          {% elsif post.signal_stance == "contradicts" %}
            {% assign contradicts_count = contradicts_count | plus: 1 %}
          {% endif %}
        {% endif %}
      {% endfor %}
      <div class="signal-health-card signal-health-card--clickable" data-signal-id="{{ signal.id }}" data-signal-category="{{ signal.category }}" data-momentum="{{ signal.momentum | default: 'stable' }}" role="button" tabindex="0">
        <div class="signal-health-top">
          <span class="signal-tile__category">{{ signal.category }}</span>
          <div class="signal-health-top-right">
            <span class="status-badge status-badge--{{ signal.current_status }}">{{ signal.current_status }}</span>
            {% if signal.momentum == "rising" %}
            <span class="momentum-badge momentum-badge--rising" title="Evidence momentum: rising">↑</span>
            {% elsif signal.momentum == "declining" %}
            <span class="momentum-badge momentum-badge--declining" title="Evidence momentum: declining">↓</span>
            {% else %}
            <span class="momentum-badge momentum-badge--stable" title="Evidence momentum: stable">→</span>
            {% endif %}
            <div class="signal-card-actions">
              <button class="signal-watch-btn" data-signal-id="{{ signal.id }}" title="Watch this signal" aria-label="Watch" type="button">☆</button>
            </div>
          </div>
        </div>
        <h4 class="signal-health-title">{{ signal.title }}</h4>
        <div class="signal-health-bottom">
          <span class="signal-tile__count">{{ evidence_count }} articles</span>
          {% if supported_count > 0 or mixed_count > 0 or contradicts_count > 0 %}
          <span class="signal-stance-summary">
            {% if supported_count > 0 %}<span class="stance-dot stance-dot--supports" title="Supports">{{ supported_count }}</span>{% endif %}
            {% if mixed_count > 0 %}<span class="stance-dot stance-dot--mixed" title="Mixed">{{ mixed_count }}</span>{% endif %}
            {% if contradicts_count > 0 %}<span class="stance-dot stance-dot--contradicts" title="Contradicts">{{ contradicts_count }}</span>{% endif %}
          </span>
          {% endif %}
        </div>
      </div>
    {% endfor %}
  </div>
</section>

{% comment %} ── Signal Detail Modal (hidden, populated by JS) ──── {% endcomment %}
<div class="signal-modal-overlay" id="signal-modal-overlay">
  <div class="signal-modal" role="dialog" aria-modal="true" aria-labelledby="signal-modal-title">
    <div class="signal-modal-header">
      <div>
        <span class="signal-modal-category" id="signal-modal-category"></span>
        <span class="signal-modal-status" id="signal-modal-status"></span>
      </div>
      <button class="signal-modal-close" id="signal-modal-close" aria-label="Close">&times;</button>
    </div>
    <h2 class="signal-modal-title" id="signal-modal-title"></h2>
    <p class="signal-modal-desc" id="signal-modal-desc"></p>
    <div class="signal-modal-meta" id="signal-modal-meta"></div>
    <div class="signal-modal-market" id="signal-modal-market"></div>
    <div class="signal-modal-actions">
      <button class="sma-btn sma-btn--watch" id="signal-modal-watch-btn" type="button">
        <span class="sma-icon">☆</span>
        <span class="sma-label">Watch this signal</span>
      </button>
      <a class="sma-btn sma-btn--view" id="signal-modal-view-btn" href="#" type="button">
        <span class="sma-icon">→</span>
        <span class="sma-label">View full page</span>
      </a>
      <div class="sma-share-wrap" id="signal-modal-share"></div>
    </div>
    <div class="signal-modal-correlations" id="signal-modal-correlations"></div>
    <div class="signal-modal-articles" id="signal-modal-articles">
      <h3 class="signal-modal-articles-title">Linked Evidence</h3>
      <div class="signal-modal-articles-list" id="signal-modal-articles-list"></div>
    </div>
  </div>
</div>

{% comment %} ── Trend Charts Section ────────────────────────────── {% endcomment %}
<section class="intel-section" id="trends-section">
  <h2 class="intel-section-title">Signal Trends</h2>
  <p class="intel-section-desc">Monthly mention counts and category distribution across tracked signals.</p>
  <div class="intel-charts-row">
    <div class="intel-chart-container intel-chart-container--wide">
      <canvas id="signal-trend-chart" height="300"></canvas>
    </div>
    <div class="intel-chart-container intel-chart-container--narrow">
      <canvas id="category-distribution-chart" height="300"></canvas>
    </div>
  </div>
</section>

{% comment %} ── Signal Correlations ──────────────────────────────── {% endcomment %}
<section class="intel-section" id="correlations-section">
  <h2 class="intel-section-title">Signal Correlations</h2>
  <p class="intel-section-desc">Signal pairs that frequently co-occur in the same articles — revealing structural connections in the industry that no single article exposes.</p>

  <div class="intel-correlations-list">
    {% for corr in site.data.signal_correlations.correlations %}
    {% assign sig_a = site.data.signals | where: "id", corr.signal_a | first %}
    {% assign sig_b = site.data.signals | where: "id", corr.signal_b | first %}
    {% if sig_a and sig_b %}
    <div class="corr-item corr-item--{{ corr.strength }}" data-corr-a="{{ corr.signal_a }}" data-corr-b="{{ corr.signal_b }}">
      <div class="corr-signals">
        <button class="corr-signal-tag corr-signal-tag--{{ sig_a.category }}" data-open-signal="{{ corr.signal_a }}" type="button">{{ sig_a.title }}</button>
        <span class="corr-connector" aria-hidden="true">↔</span>
        <button class="corr-signal-tag corr-signal-tag--{{ sig_b.category }}" data-open-signal="{{ corr.signal_b }}" type="button">{{ sig_b.title }}</button>
      </div>
      <div class="corr-meta">
        <span class="corr-strength corr-strength--{{ corr.strength }}">{{ corr.strength }}</span>
        <span class="corr-count">{{ corr.co_occurrences }} co-occurrences</span>
      </div>
    </div>
    {% endif %}
    {% endfor %}
  </div>
  <p class="intel-correlations-footer"><a href="{{ '/intelligence/correlations/' | relative_url }}">View full correlation matrix →</a></p>
</section>

{% comment %} ── High Impact Articles ─────────────────────────────── {% endcomment %}
<section class="intel-section" id="high-impact-section">
  <h2 class="intel-section-title">High Impact Articles</h2>
  <p class="intel-section-desc">Recent articles scoring 3+ on the Localization Impact Scale.</p>

  {% comment %} Impact legend {% endcomment %}
  <div class="intel-legend">
    <div class="intel-legend-group">
      <span class="intel-legend-label">Impact</span>
      <span class="impact-badge impact-badge--3 impact-badge--sm" title="Notable shift requiring attention">Significant</span>
      <span class="impact-badge impact-badge--4 impact-badge--sm" title="Major change requiring strategic adaptation">Major</span>
      <span class="impact-badge impact-badge--5 impact-badge--sm" title="Fundamentally reshapes the industry">Disruptive</span>
    </div>
    <div class="intel-legend-sep"></div>
    <div class="intel-legend-group">
      <span class="intel-legend-label">Time horizon</span>
      <span class="time-horizon-badge time-horizon-badge--now time-horizon-badge--sm" title="Immediate impact">Now — Immediate</span>
      <span class="time-horizon-badge time-horizon-badge--6months time-horizon-badge--sm" title="Impact expected within 6 months">6mo — Near-term</span>
      <span class="time-horizon-badge time-horizon-badge--2years time-horizon-badge--sm" title="Long-term impact over 2 years">2yr — Long-term</span>
    </div>
  </div>

  <div class="intel-high-impact-list" id="intel-high-impact-list">
    {% assign high_impact_posts = site.posts | where_exp: "post", "post.article_type != 'theory'" | where_exp: "post", "post.impact_score >= 3" | sort: "impact_score" | reverse %}
    {% assign impact_count = 0 %}
    {% for post in high_impact_posts %}
      {% if impact_count >= 12 %}{% break %}{% endif %}
      {% assign impact_count = impact_count | plus: 1 %}
        <a href="{{ post.url | relative_url }}" class="intel-impact-item" data-segments="{{ post.affected_segments | join: '|' }}" data-impact="{{ post.impact_score }}">
          <div class="intel-impact-item-top">
            <span class="impact-badge impact-badge--{{ post.impact_score }} impact-badge--sm">
              {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}
            </span>
            {% if post.time_horizon %}
            <span class="time-horizon-badge time-horizon-badge--{{ post.time_horizon }} time-horizon-badge--sm">
              {% if post.time_horizon == "now" %}Now{% elsif post.time_horizon == "6months" %}6mo{% elsif post.time_horizon == "2years" %}2yr{% endif %}
            </span>
            {% endif %}
            <span class="intel-impact-date">{{ post.date | date: "%b %d" }}</span>
          </div>
          <h4 class="intel-impact-title">{{ post.title }}</h4>
          {% if post.business_implications and post.business_implications.size > 0 %}
          <p class="intel-impact-implication">{{ post.business_implications.first }}</p>
          {% endif %}
          {% if post.affected_segments and post.affected_segments.size > 0 %}
          <div class="intel-impact-segments">
            {% for seg in post.affected_segments %}
            <span class="segment-tag segment-tag--sm">{{ seg }}</span>
            {% endfor %}
          </div>
          {% endif %}
        </a>
    {% endfor %}
    {% if impact_count == 0 %}
    <p class="intel-empty">No high-impact articles yet. Intelligence scoring applies to new articles as they are published.</p>
    {% endif %}
  </div>
</section>

{% comment %} ── Build JSON data for charts and modal ──────────── {% endcomment %}
<script id="signal-data" type="application/json">
{
  "signals": [
    {% for signal in site.data.signals %}
    {
      "id": {{ signal.id | jsonify }},
      "title": {{ signal.title | jsonify }},
      "category": {{ signal.category | jsonify }},
      "first_seen": {{ signal.first_seen | jsonify }},
      "current_status": {{ signal.current_status | jsonify }},
      "description": {{ signal.description | jsonify }},
      "momentum": {{ signal.momentum | default: "stable" | jsonify }},
      "watched_tickers": {{ signal.watched_tickers | jsonify }}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ],
  "posts": [
    {% for post in site.posts %}
    {% if post.article_type == "theory" %}{% continue %}{% endif %}
    {% if post.signal_ids and post.signal_ids.size > 0 %}
    {
      "date": {{ post.date | date: "%Y-%m" | jsonify }},
      "date_full": {{ post.date | date: "%Y-%m-%d" | jsonify }},
      "signal_ids": {{ post.signal_ids | jsonify }},
      "title": {{ post.title | jsonify }},
      "url": {{ post.url | relative_url | jsonify }},
      "impact_score": {{ post.impact_score | default: 0 }},
      "signal_stance": {{ post.signal_stance | default: "" | jsonify }},
      "signal_confidence": {{ post.signal_confidence | default: "" | jsonify }},
      "publisher": {{ post.publisher | default: "" | jsonify }}
    },
    {% endif %}
    {% endfor %}
    null
  ],
  "correlations": [
    {% for corr in site.data.signal_correlations.correlations %}
    {
      "signal_a": {{ corr.signal_a | jsonify }},
      "signal_b": {{ corr.signal_b | jsonify }},
      "co_occurrences": {{ corr.co_occurrences }},
      "strength": {{ corr.strength | jsonify }}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ]
}
</script>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<script>
document.addEventListener("DOMContentLoaded", function () {
  // ── Dashboard Navigation ─────────────────────────────────
  var dashNavItems = document.querySelectorAll(".intel-dash-nav-item");
  var sections = {};
  dashNavItems.forEach(function (item) {
    var sectionId = item.getAttribute("data-section");
    if (sectionId) sections[sectionId] = document.getElementById(sectionId);
  });

  var navObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        dashNavItems.forEach(function (n) {
          n.classList.toggle("active", n.getAttribute("data-section") === entry.target.id);
        });
      }
    });
  }, { rootMargin: "-20% 0px -70% 0px" });

  Object.values(sections).forEach(function (sec) {
    if (sec) navObserver.observe(sec);
  });

  // ── Signal Category Filters ──────────────────────────────
  var signalFilterPills = document.querySelectorAll("#signal-category-filters .intel-filter-pill");
  var signalCards = document.querySelectorAll(".signal-health-card");
  var watchedSignals = JSON.parse(localStorage.getItem("locreport-watched") || "[]");

  function updateWatchedCount() {
    var el = document.getElementById("watched-count");
    if (el) el.textContent = watchedSignals.length;
  }
  updateWatchedCount();

  function applyFilter(cat) {
    signalFilterPills.forEach(function (p) { p.classList.remove("active"); });
    var activePill = document.querySelector('[data-signal-cat="' + cat + '"]');
    if (activePill) activePill.classList.add("active");
    signalCards.forEach(function (card) {
      var show;
      if (cat === "all") {
        show = true;
      } else if (cat === "watched") {
        show = watchedSignals.indexOf(card.getAttribute("data-signal-id")) !== -1;
      } else {
        show = card.getAttribute("data-signal-category") === cat;
      }
      card.style.display = show ? "" : "none";
    });
  }

  signalFilterPills.forEach(function (pill) {
    pill.addEventListener("click", function (e) {
      e.preventDefault();
      var cat = pill.getAttribute("data-signal-cat");
      applyFilter(cat);
      history.replaceState(null, "", "#filter-" + cat);
    });
  });

  // ── Signal Modal ─────────────────────────────────────────
  var dataEl = document.getElementById("signal-data");
  var rawData;
  try {
    rawData = JSON.parse(dataEl.textContent.trim());
  } catch (e) {
    console.error("Failed to parse signal data:", e);
    return;
  }

  var posts = (rawData.posts || []).filter(function (p) { return p !== null; });
  var signals = rawData.signals || [];
  var correlations = rawData.correlations || [];

  // ── Market Quotes (lazy-loaded once) ────────────────────────
  var marketQuotes = null;
  var marketQuotesPromise = null;

  function loadMarketQuotes() {
    if (marketQuotes !== null) return Promise.resolve(marketQuotes);
    if (marketQuotesPromise) return marketQuotesPromise;
    marketQuotesPromise = fetch("{{ '/assets/data/market_quotes.json' | relative_url }}")
      .then(function (r) { return r.json(); })
      .then(function (data) { marketQuotes = data.quotes || {}; return marketQuotes; })
      .catch(function () { marketQuotes = {}; return {}; });
    return marketQuotesPromise;
  }
  loadMarketQuotes();

  var modalOverlay = document.getElementById("signal-modal-overlay");
  var modalClose = document.getElementById("signal-modal-close");
  var modalTitle = document.getElementById("signal-modal-title");
  var modalCategory = document.getElementById("signal-modal-category");
  var modalStatus = document.getElementById("signal-modal-status");
  var modalDesc = document.getElementById("signal-modal-desc");
  var modalMeta = document.getElementById("signal-modal-meta");
  var modalArticlesList = document.getElementById("signal-modal-articles-list");

  function formatPct(v) {
    var prefix = v >= 0 ? "+" : "";
    return prefix + v.toFixed(2) + "%";
  }

  function renderMarketSection(signal) {
    var el = document.getElementById("signal-modal-market");
    if (!el) return;
    var tickers = signal.watched_tickers;
    if (!tickers || tickers.length === 0) { el.innerHTML = ""; return; }
    var quotes = marketQuotes || {};
    var items = tickers.map(function (t) {
      var q = quotes[t];
      if (!q) return '<span class="mq-item mq-item--na" title="' + t + '">' + t + '<span class="mq-na">n/a</span></span>';
      var dir = q.change_pct >= 0 ? "up" : "down";
      return '<span class="mq-item mq-item--' + dir + '" title="' + t + '">' +
        '<span class="mq-ticker">' + t + '</span>' +
        '<span class="mq-price">' + q.price.toFixed(2) + ' ' + q.currency + '</span>' +
        '<span class="mq-change">' + formatPct(q.change_pct) + '</span>' +
        '</span>';
    });
    el.innerHTML = '<div class="signal-modal-market-inner"><span class="signal-modal-market-label">Market</span>' + items.join("") + '</div>';
  }

  function renderCorrelationsSection(signalId) {
    var el = document.getElementById("signal-modal-correlations");
    if (!el) return;
    var related = correlations.filter(function (c) {
      return c.signal_a === signalId || c.signal_b === signalId;
    });
    if (related.length === 0) { el.innerHTML = ""; return; }
    var items = related.map(function (c) {
      var otherId = c.signal_a === signalId ? c.signal_b : c.signal_a;
      var other = signals.find(function (s) { return s.id === otherId; });
      if (!other) return "";
      return '<button class="corr-related-btn" data-open-signal="' + otherId + '" type="button">' +
        '<span class="corr-related-label">' + other.title + '</span>' +
        '<span class="corr-related-count">' + c.co_occurrences + 'x</span>' +
        '</button>';
    }).filter(Boolean);
    if (items.length === 0) { el.innerHTML = ""; return; }
    el.innerHTML = '<div class="signal-modal-correlations-inner"><h3 class="signal-modal-correlations-title">Frequently co-occurring signals</h3><div class="corr-related-list">' + items.join("") + '</div></div>';
    el.querySelectorAll(".corr-related-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openSignalModal(btn.getAttribute("data-open-signal"));
      });
    });
  }

  function openSignalModal(signalId) {
    var signal = signals.find(function (s) { return s.id === signalId; });
    if (!signal) return;

    modalTitle.textContent = signal.title;
    modalCategory.textContent = signal.category;
    modalCategory.className = "signal-modal-category signal-tile__category";
    modalStatus.textContent = signal.current_status;
    modalStatus.className = "signal-modal-status status-badge status-badge--" + signal.current_status;
    modalDesc.textContent = signal.description;

    var momentumIcon = signal.momentum === "rising" ? "↑ rising" : signal.momentum === "declining" ? "↓ declining" : "→ stable";
    modalMeta.innerHTML = '<span>First seen: ' + signal.first_seen + '</span><span class="signal-modal-momentum momentum-badge--' + (signal.momentum || "stable") + '">Momentum: ' + momentumIcon + '</span>';

    loadMarketQuotes().then(function () { renderMarketSection(signal); });
    renderCorrelationsSection(signalId);

    // Find linked articles
    var linked = posts.filter(function (p) {
      return p.signal_ids && p.signal_ids.indexOf(signalId) !== -1;
    }).sort(function (a, b) {
      return b.date_full.localeCompare(a.date_full);
    });

    modalArticlesList.innerHTML = "";
    if (linked.length === 0) {
      modalArticlesList.innerHTML = '<p class="signal-modal-empty">No linked evidence yet.</p>';
    } else {
      linked.forEach(function (article) {
        var el = document.createElement("a");
        el.href = article.url;
        el.className = "signal-modal-article-item";
        var stanceBadge = "";
        if (article.signal_stance) {
          stanceBadge = '<span class="stance-badge stance-badge--' + article.signal_stance + '">' + article.signal_stance + '</span>';
        }
        var impactBadge = "";
        if (article.impact_score >= 3) {
          var impactLabel = article.impact_score === 3 ? "Significant" : article.impact_score === 4 ? "Major" : "Disruptive";
          impactBadge = '<span class="impact-badge impact-badge--' + article.impact_score + ' impact-badge--sm">' + impactLabel + '</span>';
        }
        var publisherTag = article.publisher ? '<span class="signal-modal-article-publisher">' + article.publisher + '</span>' : '';
        el.innerHTML =
          '<div class="signal-modal-article-top">' +
            '<span class="signal-modal-article-date">' + article.date_full + '</span>' +
            stanceBadge + impactBadge + publisherTag +
          '</div>' +
          '<span class="signal-modal-article-title">' + article.title + '</span>';
        modalArticlesList.appendChild(el);
      });
    }

    modalOverlay.setAttribute("data-current-signal", signalId);
    var mwb = document.getElementById("signal-modal-watch-btn");
    var watched = watchedSignals.indexOf(signalId) !== -1;
    mwb.querySelector(".sma-icon").textContent = watched ? "★" : "☆";
    mwb.querySelector(".sma-label").textContent = watched ? "Watching" : "Watch this signal";
    mwb.classList.toggle("is-watched", watched);

    var viewBtn = document.getElementById("signal-modal-view-btn");
    if (viewBtn) viewBtn.setAttribute("href", "{{ '/signals/' | relative_url }}" + signalId + "/");
    renderModalShareDropdown(signal);

    modalOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    history.replaceState(null, "", "#" + signalId);
  }

  function closeSignalModal() {
    modalOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
    history.replaceState(null, "", "#signals-section");
  }

  // ── Modal action buttons ──────────────────────────────────
  document.getElementById("signal-modal-watch-btn").addEventListener("click", function () {
    var sid = modalOverlay.getAttribute("data-current-signal");
    if (!sid) return;
    var idx = watchedSignals.indexOf(sid);
    var icon = this.querySelector(".sma-icon");
    var label = this.querySelector(".sma-label");
    if (idx === -1) {
      watchedSignals.push(sid);
      icon.textContent = "★"; label.textContent = "Watching";
      this.classList.add("is-watched");
    } else {
      watchedSignals.splice(idx, 1);
      icon.textContent = "☆"; label.textContent = "Watch this signal";
      this.classList.remove("is-watched");
    }
    localStorage.setItem("locreport-watched", JSON.stringify(watchedSignals));
    updateWatchedCount();
    var cardBtn = document.querySelector('.signal-watch-btn[data-signal-id="' + sid + '"]');
    if (cardBtn) {
      var isNowWatched = watchedSignals.indexOf(sid) !== -1;
      cardBtn.textContent = isNowWatched ? "★" : "☆";
      cardBtn.classList.toggle("is-watched", isNowWatched);
    }
    var activePill = document.querySelector(".intel-filter-pill.active");
    if (activePill && activePill.getAttribute("data-signal-cat") === "watched") applyFilter("watched");
  });

  // ── Render share dropdown inside the signal modal ──────────
  function renderModalShareDropdown(signal) {
    var wrap = document.getElementById("signal-modal-share");
    if (!wrap) return;
    var origin = window.location.origin;
    var pageUrl = origin + "{{ '/signals/' | relative_url }}" + signal.id + "/";
    var encUrl = encodeURIComponent(pageUrl);
    var encTitle = encodeURIComponent(signal.title);
    var encDesc = encodeURIComponent((signal.description || "").slice(0, 200));
    function svg(d) {
      return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="' + d + '"/></svg>';
    }
    var btns = [
      { cls: "twitter",  href: "https://twitter.com/intent/tweet?url=" + encUrl + "&text=" + encTitle, label: "X / Twitter", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
      { cls: "linkedin", href: "https://www.linkedin.com/sharing/share-offsite/?url=" + encUrl, label: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
      { cls: "bluesky",  href: "https://bsky.app/intent/compose?text=" + encTitle + "%20" + encUrl, label: "Bluesky", path: "M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 01-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" },
      { cls: "facebook", href: "https://www.facebook.com/sharer/sharer.php?u=" + encUrl, label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
      { cls: "reddit",   href: "https://reddit.com/submit?url=" + encUrl + "&title=" + encTitle, label: "Reddit", path: "M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" },
      { cls: "whatsapp", href: "https://wa.me/?text=" + encTitle + "%20" + encUrl, label: "WhatsApp", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" },
      { cls: "telegram", href: "https://t.me/share/url?url=" + encUrl + "&text=" + encTitle, label: "Telegram", path: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" },
      { cls: "email",    href: "mailto:?subject=" + encTitle + "&body=" + encDesc + "%0A%0A" + encUrl, label: "Email", path: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" }
    ];
    var html = '<div class="social-share-dd" data-share-dropdown>' +
      '<button type="button" class="social-share-dd__toggle" aria-expanded="false" aria-haspopup="true" aria-label="Share">' +
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="social-share-dd__icon"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92S19.61 16.08 18 16.08z"/></svg>' +
        '<span class="social-share-dd__label">Share</span>' +
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="social-share-dd__chevron"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>' +
      '</button>' +
      '<div class="social-share-dd__menu" role="menu" hidden><div class="social-share__buttons">';
    btns.forEach(function (b) {
      var target = b.cls === "email" ? "" : ' target="_blank" rel="noopener noreferrer"';
      html += '<a class="social-share__btn social-share__btn--' + b.cls + '" href="' + b.href + '"' + target + ' data-label="' + b.label + '" aria-label="Share on ' + b.label + '">' + svg(b.path) + '</a>';
    });
    html += '<button class="social-share__btn social-share__btn--copy" type="button" data-label="Copy link" data-copy-url="' + pageUrl + '" aria-label="Copy link to clipboard">' +
      '<svg class="icon-link" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm1-4H8v2h8v-2z"/></svg>' +
      '<svg class="icon-check" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:none"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' +
      '</button>';
    html += '</div></div></div>';
    wrap.innerHTML = html;
    bindShareDropdown(wrap);
    var copyBtn = wrap.querySelector(".social-share__btn--copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var url = copyBtn.getAttribute("data-copy-url");
        function done() {
          copyBtn.classList.add("is-copied");
          setTimeout(function () { copyBtn.classList.remove("is-copied"); }, 2000);
        }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(done).catch(function () {
            var ta = document.createElement("textarea");
            ta.value = url; ta.style.cssText = "position:fixed;top:-9999px;left:-9999px";
            document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); done(); } catch (e) {}
            document.body.removeChild(ta);
          });
        }
      });
    }
  }
  function bindShareDropdown(scope) {
    var dd = scope.querySelector("[data-share-dropdown]");
    if (!dd) return;
    var toggle = dd.querySelector(".social-share-dd__toggle");
    var menu = dd.querySelector(".social-share-dd__menu");
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      menu.hidden = open;
    });
    menu.addEventListener("click", function (e) { e.stopPropagation(); });
  }

  signalCards.forEach(function (card) {
    card.addEventListener("click", function () {
      openSignalModal(card.getAttribute("data-signal-id"));
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openSignalModal(card.getAttribute("data-signal-id"));
      }
    });
  });

  // ── Watch buttons ─────────────────────────────────────────
  document.querySelectorAll(".signal-watch-btn").forEach(function (btn) {
    var sid = btn.getAttribute("data-signal-id");
    if (watchedSignals.indexOf(sid) !== -1) {
      btn.textContent = "★";
      btn.classList.add("is-watched");
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var idx = watchedSignals.indexOf(sid);
      if (idx === -1) {
        watchedSignals.push(sid);
        btn.textContent = "★";
        btn.classList.add("is-watched");
      } else {
        watchedSignals.splice(idx, 1);
        btn.textContent = "☆";
        btn.classList.remove("is-watched");
      }
      localStorage.setItem("locreport-watched", JSON.stringify(watchedSignals));
      updateWatchedCount();
      var activePill = document.querySelector(".intel-filter-pill.active");
      if (activePill && activePill.getAttribute("data-signal-cat") === "watched") {
        applyFilter("watched");
      }
    });
  });

  // ── Correlation section: open signal on click ────────────
  document.querySelectorAll("[data-open-signal]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openSignalModal(btn.getAttribute("data-open-signal"));
    });
  });

  // ── Initial hash routing ──────────────────────────────────
  var initialHash = window.location.hash.slice(1);
  if (initialHash) {
    if (initialHash.indexOf("filter-") === 0) {
      var cat = initialHash.slice(7);
      applyFilter(cat);
      var signalsSec = document.getElementById("signals-section");
      if (signalsSec) signalsSec.scrollIntoView({ behavior: "smooth" });
    } else if (signals.find(function (s) { return s.id === initialHash; })) {
      var signalsSection = document.getElementById("signals-section");
      if (signalsSection) signalsSection.scrollIntoView({ behavior: "smooth" });
      openSignalModal(initialHash);
    }
  }

  modalClose.addEventListener("click", closeSignalModal);
  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) closeSignalModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalOverlay.classList.contains("is-open")) {
      closeSignalModal();
    }
  });

  // ── Charts ───────────────────────────────────────────────
  // Generate last 6 months labels
  var now = new Date();
  var monthLabels = [];
  for (var i = 5; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    monthLabels.push(key);
  }

  var monthDisplay = monthLabels.map(function (m) {
    var parts = m.split("-");
    var names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return names[parseInt(parts[1], 10) - 1] + " " + parts[0].slice(2);
  });

  var palette = [
    "#3D5AFE", "#2F7CB5", "#e06c75", "#5a7d5e", "#d19a66",
    "#8a6b78", "#556b65", "#be5046", "#6B8AFF", "#e5c07b"
  ];

  var isDark = document.documentElement.getAttribute("data-theme") === "dark";
  var gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  var textColor = isDark ? "#9BA4B8" : "#5A6278";

  // ── Signal Trend Line Chart ──────────────────────────────
  var datasets = signals.map(function (sig, idx) {
    var counts = monthLabels.map(function (month) {
      return posts.filter(function (p) {
        return p.date === month && p.signal_ids.indexOf(sig.id) !== -1;
      }).length;
    });
    return {
      label: sig.title.length > 35 ? sig.title.substring(0, 32) + "..." : sig.title,
      data: counts,
      borderColor: palette[idx % palette.length],
      backgroundColor: palette[idx % palette.length] + "22",
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: false
    };
  });

  datasets = datasets.filter(function (ds) {
    return ds.data.some(function (v) { return v > 0; });
  });

  var trendCtx = document.getElementById("signal-trend-chart");
  if (trendCtx) {
    new Chart(trendCtx, {
      type: "line",
      data: { labels: monthDisplay, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: textColor,
              font: { family: "Outfit", size: 11, weight: 500 },
              boxWidth: 12, boxHeight: 12, padding: 16, usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: isDark ? "#1A2035" : "#ffffff",
            titleColor: isDark ? "#EDF2F7" : "#111827",
            bodyColor: isDark ? "#9BA4B8" : "#5A6278",
            borderColor: isDark ? "rgba(237,242,247,0.14)" : "rgba(17,24,39,0.12)",
            borderWidth: 1, cornerRadius: 8, padding: 12,
            titleFont: { family: "Outfit", weight: 700 },
            bodyFont: { family: "Outfit" }
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: "Outfit", size: 11 } } },
          y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, font: { family: "Outfit", size: 11 }, stepSize: 1 } }
        }
      }
    });
  }

  // ── Category Distribution Doughnut Chart ─────────────────
  var catCounts = {};
  var catColors = {
    quality: "#5a7d5e",
    operations: "#2F7CB5",
    governance: "#8a6b78",
    market: "#8a7a5e",
    strategy: "#556b65"
  };

  posts.forEach(function (p) {
    p.signal_ids.forEach(function (sid) {
      var sig = signals.find(function (s) { return s.id === sid; });
      if (sig) {
        catCounts[sig.category] = (catCounts[sig.category] || 0) + 1;
      }
    });
  });

  var catLabels = Object.keys(catCounts);
  var catData = catLabels.map(function (c) { return catCounts[c]; });
  var catBgColors = catLabels.map(function (c) { return catColors[c] || "#999"; });

  var doughnutCtx = document.getElementById("category-distribution-chart");
  if (doughnutCtx && catLabels.length > 0) {
    new Chart(doughnutCtx, {
      type: "doughnut",
      data: {
        labels: catLabels.map(function (c) { return c.charAt(0).toUpperCase() + c.slice(1); }),
        datasets: [{
          data: catData,
          backgroundColor: catBgColors,
          borderColor: isDark ? "#1A2035" : "#ffffff",
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: textColor,
              font: { family: "Outfit", size: 11, weight: 500 },
              boxWidth: 12, boxHeight: 12, padding: 12, usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: isDark ? "#1A2035" : "#ffffff",
            titleColor: isDark ? "#EDF2F7" : "#111827",
            bodyColor: isDark ? "#9BA4B8" : "#5A6278",
            borderColor: isDark ? "rgba(237,242,247,0.14)" : "rgba(17,24,39,0.12)",
            borderWidth: 1, cornerRadius: 8, padding: 12,
            titleFont: { family: "Outfit", weight: 700 },
            bodyFont: { family: "Outfit" }
          }
        }
      }
    });
  }
});
</script>
