---
layout: default
title: Intelligence
permalink: /intelligence/
nav: true
nav_order: 2
description: "Actionable localization intelligence — trend signals, impact scoring, and role-based insights for strategic decision-making."
---

<section class="intel-hero">
  <h1>Localization Intelligence</h1>
  <p class="intel-subtitle">Less noise, more clarity. Structured, role-specific, decision-ready intelligence for the localization industry.</p>
</section>

{% comment %} ── Dashboard Section Navigation ────────────────────── {% endcomment %}
<nav class="intel-dash-nav" id="intel-dash-nav">
  <a href="#overview-section" class="intel-dash-nav-item active" data-section="overview-section">Overview</a>
  <a href="#signals-section" class="intel-dash-nav-item" data-section="signals-section">Signals</a>
  <a href="#trends-section" class="intel-dash-nav-item" data-section="trends-section">Trends</a>
  <a href="#articles-section" class="intel-dash-nav-item" data-section="articles-section">Articles</a>
</nav>

{% comment %} ── Role Picker ─────────────────────────────────────── {% endcomment %}
<section class="role-picker-section" id="role-picker-section">
  <div class="role-picker-header">
    <h3 class="role-picker-title">Personalize your view</h3>
    <p class="role-picker-desc">Select your role to see the most relevant insights first.</p>
  </div>
  <div class="role-picker-buttons" id="role-picker-buttons">
    <button class="role-pill active" data-role="all">All Roles</button>
    <button class="role-pill" data-role="LSPs">LSPs</button>
    <button class="role-pill" data-role="In-House Teams">In-House Teams</button>
    <button class="role-pill" data-role="Tech Vendors">Tech Vendors</button>
    <button class="role-pill" data-role="Translators">Translators</button>
  </div>
</section>

{% comment %} ── Impact Overview Stats ─────────────────────────────── {% endcomment %}
{% assign total_posts = 0 %}
{% assign high_impact_posts = 0 %}
{% assign this_month_posts = 0 %}
{% assign now_date = site.time | date: "%Y-%m" %}
{% assign posts_with_signals = 0 %}

{% for post in site.posts %}
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
  <h2 class="intel-section-title">Signal Tracker</h2>
  <p class="intel-section-desc">Click any signal to see linked evidence articles. Real-time status of {{ site.data.signals.size }} industry signals.</p>

  {% comment %} Category filter for signals {% endcomment %}
  <div class="intel-signal-filters" id="signal-category-filters">
    <button class="intel-filter-pill active" data-signal-cat="all">All</button>
    <button class="intel-filter-pill" data-signal-cat="quality">Quality</button>
    <button class="intel-filter-pill" data-signal-cat="operations">Operations</button>
    <button class="intel-filter-pill" data-signal-cat="governance">Governance</button>
    <button class="intel-filter-pill" data-signal-cat="market">Market</button>
    <button class="intel-filter-pill" data-signal-cat="strategy">Strategy</button>
  </div>

  <div class="signal-health-grid">
    {% for signal in site.data.signals %}
      {% assign evidence_count = 0 %}
      {% assign supported_count = 0 %}
      {% assign mixed_count = 0 %}
      {% assign contradicts_count = 0 %}
      {% for post in site.posts %}
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
      <button class="signal-health-card signal-health-card--clickable" data-signal-id="{{ signal.id }}" data-signal-category="{{ signal.category }}" type="button">
        <div class="signal-health-top">
          <span class="signal-tile__category">{{ signal.category }}</span>
          <span class="status-badge status-badge--{{ signal.current_status }}">{{ signal.current_status }}</span>
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
      </button>
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

{% comment %} ── High Impact Articles ─────────────────────────────── {% endcomment %}
<section class="intel-section">
  <h2 class="intel-section-title">High Impact Articles</h2>
  <p class="intel-section-desc">Recent articles scoring 3+ on the Localization Impact Scale.</p>
  <div class="intel-high-impact-list" id="intel-high-impact-list">
    {% assign impact_count = 0 %}
    {% for post in site.posts %}
      {% if post.impact_score >= 3 and impact_count < 12 %}
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
      {% endif %}
    {% endfor %}
    {% if impact_count == 0 %}
    <p class="intel-empty">No high-impact articles yet. Intelligence scoring applies to new articles as they are published.</p>
    {% endif %}
  </div>
</section>

{% comment %} ── Full Article Feed ────────────────────────────────── {% endcomment %}
<section class="intel-section" id="articles-section">
  <h2 class="intel-section-title">All Articles</h2>
  <p class="intel-section-desc">Complete feed of all {{ total_posts }} tracked articles. Newest first.</p>

  <div class="intel-feed-controls">
    <input type="search" class="intel-feed-search" id="intel-feed-search" placeholder="Filter articles..." autocomplete="off" aria-label="Filter articles">
    <select class="intel-feed-sort" id="intel-feed-sort" aria-label="Sort articles">
      <option value="date">Newest First</option>
      <option value="impact">Highest Impact</option>
    </select>
  </div>

  <div class="intel-article-feed" id="intel-article-feed">
    {% for post in site.posts %}
    <a href="{{ post.url | relative_url }}" class="intel-feed-item" data-title="{{ post.title | downcase }}" data-impact="{{ post.impact_score | default: 0 }}" data-date="{{ post.date | date: '%Y%m%d' }}" data-segments="{{ post.affected_segments | join: '|' }}" data-signals="{{ post.signal_ids | join: '|' }}">
      <div class="intel-feed-item-left">
        <span class="intel-feed-date">{{ post.date | date: "%b %d, %Y" }}</span>
        {% if post.impact_score and post.impact_score >= 3 %}
        <span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {{ post.impact_score }}"></span>
        {% endif %}
      </div>
      <div class="intel-feed-item-main">
        <h4 class="intel-feed-title">{{ post.title }}</h4>
        <p class="intel-feed-excerpt">{{ post.excerpt | strip_html | truncate: 120 }}</p>
      </div>
      <div class="intel-feed-item-right">
        {% if post.publisher %}
        <span class="intel-feed-publisher">{{ post.publisher }}</span>
        {% endif %}
        {% if post.signal_ids and post.signal_ids.size > 0 %}
        <span class="intel-feed-signal-count" title="Linked to {{ post.signal_ids.size }} signal(s)">{{ post.signal_ids.size }}S</span>
        {% endif %}
      </div>
    </a>
    {% endfor %}
  </div>
  <div class="intel-feed-load-more" id="intel-feed-load-more">
    <button class="intel-feed-load-btn" id="intel-feed-load-btn" type="button">Show more articles</button>
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
      "description": {{ signal.description | jsonify }}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ],
  "posts": [
    {% for post in site.posts %}
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
  ]
}
</script>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<script>
document.addEventListener("DOMContentLoaded", function () {
  // ── Role Picker ──────────────────────────────────────────
  var rolePills = document.querySelectorAll("#role-picker-buttons .role-pill");
  var savedRole = localStorage.getItem("locreport-role") || "all";

  function applyRole(role) {
    localStorage.setItem("locreport-role", role);
    rolePills.forEach(function (p) {
      p.classList.toggle("active", p.getAttribute("data-role") === role);
    });
    // Filter high-impact list
    var items = document.querySelectorAll("#intel-high-impact-list .intel-impact-item");
    items.forEach(function (item) {
      if (role === "all") {
        item.style.display = "";
      } else {
        var segments = (item.getAttribute("data-segments") || "").split("|");
        item.style.display = segments.indexOf(role) !== -1 ? "" : "none";
      }
    });
    // Dim feed items
    var feedItems = document.querySelectorAll("#intel-article-feed .intel-feed-item");
    feedItems.forEach(function (item) {
      if (role === "all") {
        item.classList.remove("role-dimmed");
      } else {
        var segments = (item.getAttribute("data-segments") || "").split("|");
        item.classList.toggle("role-dimmed", segments.indexOf(role) === -1);
      }
    });
  }

  applyRole(savedRole);
  rolePills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      applyRole(pill.getAttribute("data-role"));
    });
  });

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

  signalFilterPills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      signalFilterPills.forEach(function (p) { p.classList.remove("active"); });
      pill.classList.add("active");
      var cat = pill.getAttribute("data-signal-cat");
      signalCards.forEach(function (card) {
        if (cat === "all" || card.getAttribute("data-signal-category") === cat) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
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

  var modalOverlay = document.getElementById("signal-modal-overlay");
  var modalClose = document.getElementById("signal-modal-close");
  var modalTitle = document.getElementById("signal-modal-title");
  var modalCategory = document.getElementById("signal-modal-category");
  var modalStatus = document.getElementById("signal-modal-status");
  var modalDesc = document.getElementById("signal-modal-desc");
  var modalMeta = document.getElementById("signal-modal-meta");
  var modalArticlesList = document.getElementById("signal-modal-articles-list");

  function openSignalModal(signalId) {
    var signal = signals.find(function (s) { return s.id === signalId; });
    if (!signal) return;

    modalTitle.textContent = signal.title;
    modalCategory.textContent = signal.category;
    modalCategory.className = "signal-modal-category signal-tile__category";
    modalStatus.textContent = signal.current_status;
    modalStatus.className = "signal-modal-status status-badge status-badge--" + signal.current_status;
    modalDesc.textContent = signal.description;
    modalMeta.innerHTML = '<span>First seen: ' + signal.first_seen + '</span>';

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

    modalOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeSignalModal() {
    modalOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  signalCards.forEach(function (card) {
    card.addEventListener("click", function () {
      openSignalModal(card.getAttribute("data-signal-id"));
    });
  });

  modalClose.addEventListener("click", closeSignalModal);
  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) closeSignalModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalOverlay.classList.contains("is-open")) {
      closeSignalModal();
    }
  });

  // ── Article Feed: search, sort, and load-more ────────────
  var feedItems = Array.from(document.querySelectorAll("#intel-article-feed .intel-feed-item"));
  var feedSearch = document.getElementById("intel-feed-search");
  var feedSort = document.getElementById("intel-feed-sort");
  var feedLoadBtn = document.getElementById("intel-feed-load-btn");
  var feedLoadMore = document.getElementById("intel-feed-load-more");
  var FEED_BATCH = 20;
  var feedVisible = FEED_BATCH;

  function applyFeedVisibility() {
    var query = (feedSearch.value || "").trim().toLowerCase();
    var sortBy = feedSort.value;
    var visibleItems = feedItems.filter(function (item) {
      if (!query) return true;
      var title = item.getAttribute("data-title") || "";
      return title.indexOf(query) !== -1;
    });

    if (sortBy === "impact") {
      visibleItems.sort(function (a, b) {
        return parseInt(b.getAttribute("data-impact") || "0", 10) - parseInt(a.getAttribute("data-impact") || "0", 10);
      });
    } else {
      visibleItems.sort(function (a, b) {
        return (b.getAttribute("data-date") || "").localeCompare(a.getAttribute("data-date") || "");
      });
    }

    // Re-order in DOM
    var parent = document.getElementById("intel-article-feed");
    visibleItems.forEach(function (item) {
      parent.appendChild(item);
    });

    // Hide non-matching
    feedItems.forEach(function (item) {
      if (visibleItems.indexOf(item) === -1) {
        item.style.display = "none";
      }
    });

    // Show/hide based on batch
    visibleItems.forEach(function (item, idx) {
      item.style.display = idx < feedVisible ? "" : "none";
    });

    // Show/hide load more button
    if (feedLoadMore) {
      feedLoadMore.style.display = visibleItems.length > feedVisible ? "" : "none";
    }
  }

  // Initial hide
  applyFeedVisibility();

  feedSearch.addEventListener("input", function () {
    feedVisible = FEED_BATCH;
    applyFeedVisibility();
  });

  feedSort.addEventListener("change", function () {
    feedVisible = FEED_BATCH;
    applyFeedVisibility();
  });

  if (feedLoadBtn) {
    feedLoadBtn.addEventListener("click", function () {
      feedVisible += FEED_BATCH;
      applyFeedVisibility();
    });
  }

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
    "#1e5faa", "#38b6cc", "#e06c75", "#98c379", "#d19a66",
    "#c678dd", "#56b6c2", "#be5046", "#61afef", "#e5c07b"
  ];

  var isDark = document.documentElement.getAttribute("data-theme") === "dark";
  var gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  var textColor = isDark ? "#8a95b0" : "#5a6478";

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
              font: { family: "Manrope", size: 11, weight: 500 },
              boxWidth: 12, boxHeight: 12, padding: 16, usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: isDark ? "#1a1f30" : "#ffffff",
            titleColor: isDark ? "#e8ecf4" : "#1a1f2e",
            bodyColor: isDark ? "#8a95b0" : "#5a6478",
            borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
            borderWidth: 1, cornerRadius: 8, padding: 12,
            titleFont: { family: "Manrope", weight: 700 },
            bodyFont: { family: "Manrope" }
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: "Manrope", size: 11 } } },
          y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, font: { family: "Manrope", size: 11 }, stepSize: 1 } }
        }
      }
    });
  }

  // ── Category Distribution Doughnut Chart ─────────────────
  var catCounts = {};
  var catColors = {
    quality: "#1e5faa",
    operations: "#38b6cc",
    governance: "#e06c75",
    market: "#98c379",
    strategy: "#d19a66"
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
          borderColor: isDark ? "#1a1f30" : "#ffffff",
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
              font: { family: "Manrope", size: 11, weight: 500 },
              boxWidth: 12, boxHeight: 12, padding: 12, usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: isDark ? "#1a1f30" : "#ffffff",
            titleColor: isDark ? "#e8ecf4" : "#1a1f2e",
            bodyColor: isDark ? "#8a95b0" : "#5a6478",
            borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
            borderWidth: 1, cornerRadius: 8, padding: 12,
            titleFont: { family: "Manrope", weight: 700 },
            bodyFont: { family: "Manrope" }
          }
        }
      }
    });
  }
});
</script>
