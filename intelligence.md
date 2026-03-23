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

{% comment %} ── Role Picker (Phase 3) ─────────────────────────────── {% endcomment %}
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

{% for post in site.posts %}
  {% assign total_posts = total_posts | plus: 1 %}
  {% if post.impact_score >= 4 %}
    {% assign high_impact_posts = high_impact_posts | plus: 1 %}
  {% endif %}
  {% assign post_month = post.date | date: "%Y-%m" %}
  {% if post_month == now_date %}
    {% assign this_month_posts = this_month_posts | plus: 1 %}
  {% endif %}
{% endfor %}

<section class="intel-stats-grid">
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

{% comment %} ── Signal Health Overview ─────────────────────────────── {% endcomment %}
<section class="intel-section">
  <h2 class="intel-section-title">Signal Health</h2>
  <p class="intel-section-desc">Real-time status of the 10 industry signals we track.</p>
  <div class="signal-health-grid">
    {% for signal in site.data.signals %}
      {% assign evidence_count = 0 %}
      {% for post in site.posts %}
        {% if post.signal_ids contains signal.id %}
          {% assign evidence_count = evidence_count | plus: 1 %}
        {% endif %}
      {% endfor %}
      <a href="{{ '/signals/#' | append: signal.id | relative_url }}" class="signal-health-card">
        <div class="signal-health-top">
          <span class="signal-tile__category">{{ signal.category }}</span>
          <span class="status-badge status-badge--{{ signal.current_status }}">{{ signal.current_status }}</span>
        </div>
        <h4 class="signal-health-title">{{ signal.title }}</h4>
        <span class="signal-tile__count">{{ evidence_count }} articles</span>
      </a>
    {% endfor %}
  </div>
</section>

{% comment %} ── Trend Chart: Signal Mentions Over Time ─────────────── {% endcomment %}
<section class="intel-section">
  <h2 class="intel-section-title">Signal Trends</h2>
  <p class="intel-section-desc">Monthly mention counts for each tracked signal over the past 6 months.</p>
  <div class="intel-chart-container">
    <canvas id="signal-trend-chart" height="300"></canvas>
  </div>
</section>

{% comment %} ── Build trend data at build time ─────────────────────── {% endcomment %}
{% assign month_labels = "" %}
{% assign m_now = site.time | date: "%s" | plus: 0 %}

{% comment %} We build 6 months of data using post dates {% endcomment %}

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

{% comment %} ── Build JSON data for chart ─────────────────────────── {% endcomment %}
<script id="signal-data" type="application/json">
{
  "signals": [
    {% for signal in site.data.signals %}
    {
      "id": {{ signal.id | jsonify }},
      "title": {{ signal.title | jsonify }},
      "category": {{ signal.category | jsonify }}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ],
  "posts": [
    {% for post in site.posts %}
    {% if post.signal_ids and post.signal_ids.size > 0 %}
    {
      "date": {{ post.date | date: "%Y-%m" | jsonify }},
      "signal_ids": {{ post.signal_ids | jsonify }}
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
  // ── Role Picker (Phase 3) ──────────────────────────────────
  var rolePills = document.querySelectorAll("#role-picker-buttons .role-pill");
  var savedRole = localStorage.getItem("locreport-role") || "all";

  function applyRole(role) {
    localStorage.setItem("locreport-role", role);

    // Update pills
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
  }

  // Initialize from saved preference
  applyRole(savedRole);

  rolePills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      applyRole(pill.getAttribute("data-role"));
    });
  });

  // ── Signal Trend Chart (Phase 2) ────────────────────────────
  var dataEl = document.getElementById("signal-data");
  if (!dataEl) return;

  var rawData;
  try {
    var jsonText = dataEl.textContent.trim();
    rawData = JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse signal data:", e);
    return;
  }

  // Filter out null entries from Liquid trailing comma
  var posts = (rawData.posts || []).filter(function (p) { return p !== null; });
  var signals = rawData.signals || [];

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

  // Assign colors per signal
  var palette = [
    "#1e5faa", "#38b6cc", "#e06c75", "#98c379", "#d19a66",
    "#c678dd", "#56b6c2", "#be5046", "#61afef", "#e5c07b"
  ];

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

  // Only show signals that have at least 1 mention in the period
  datasets = datasets.filter(function (ds) {
    return ds.data.some(function (v) { return v > 0; });
  });

  var ctx = document.getElementById("signal-trend-chart");
  if (!ctx) return;

  var isDark = document.documentElement.getAttribute("data-theme") === "dark";
  var gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  var textColor = isDark ? "#8a95b0" : "#5a6478";

  new Chart(ctx, {
    type: "line",
    data: {
      labels: monthDisplay,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: textColor,
            font: { family: "Manrope", size: 11, weight: 500 },
            boxWidth: 12,
            boxHeight: 12,
            padding: 16,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: isDark ? "#1a1f30" : "#ffffff",
          titleColor: isDark ? "#e8ecf4" : "#1a1f2e",
          bodyColor: isDark ? "#8a95b0" : "#5a6478",
          borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          titleFont: { family: "Manrope", weight: 700 },
          bodyFont: { family: "Manrope" }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: "Manrope", size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: "Manrope", size: 11 },
            stepSize: 1
          }
        }
      }
    }
  });
});
</script>
