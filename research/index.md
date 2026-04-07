---
layout: default
title: "Language Science"
permalink: /research/
description: "Research articles on linguistics, communication theory, and language science — covering phonology, syntax, semantics, psycholinguistics, computational linguistics, and more."
nav: true
nav_order: 3.5
---

{% assign theory_posts = "" | split: "" %}
{% for post in site.posts %}
  {% if post.article_type == "theory" %}
    {% assign theory_posts = theory_posts | push: post %}
  {% endif %}
{% endfor %}

<section class="all-articles-hero">
  <h1>Language Science</h1>
  <p class="all-articles-subtitle">{{ theory_posts.size }} peer-reviewed research articles on linguistics and communication theory.</p>
</section>

<p class="theory-crosslink" style="margin-bottom: var(--space-4); padding: var(--space-3) var(--space-4); background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: var(--radius-md); font-size: 0.9rem;">
  Looking for industry articles? Visit <a href="/all-articles/" style="color: var(--accent); font-weight: 600;">All articles</a>
</p>

<section class="research-filter-bar" id="research-filter-bar">

  <div class="research-filter-row">
    <span class="research-filter-label">Domain</span>
    <div class="research-pills" id="domain-pills" role="group" aria-label="Filter by domain">
      <button class="intel-filter-pill active" data-domain="all">All</button>
    </div>
  </div>

  <div class="research-filter-row">
    <span class="research-filter-label">Date</span>
    <div class="research-pills" role="group" aria-label="Filter by date">
      <button class="intel-filter-pill active" data-date="all">All time</button>
      <button class="intel-filter-pill" data-date="30">Last 30 days</button>
      <button class="intel-filter-pill" data-date="90">Last 3 months</button>
      <button class="intel-filter-pill" data-date="365">Last year</button>
    </div>
  </div>

  <div class="research-filter-row">
    <span class="research-filter-label">Source</span>
    <div class="research-pills" id="source-pills" role="group" aria-label="Filter by source">
      <button class="intel-filter-pill active" data-source="all">All</button>
    </div>
  </div>

  <div class="filter-status-row">
    <p class="filter-count" id="feed-count" aria-live="polite"></p>
    <button class="filter-reset-btn" id="filter-reset" style="display:none;">Clear filters</button>
  </div>

</section>

<section class="all-articles-feed-section" id="articles-section">
  <div class="intel-high-impact-list" id="research-article-feed">
    {% for post in theory_posts %}
    <a href="{{ post.url | relative_url }}" class="intel-impact-item"
       data-title="{{ post.title | downcase | escape }}"
       data-date="{{ post.date | date: '%Y%m%d' }}"
       data-date-iso="{{ post.date | date: '%Y-%m-%d' }}"
       data-domain="{{ post.research_domain | downcase | default: '' }}"
       data-source="{{ post.publisher | downcase | default: '' }}">
      <div class="intel-impact-item-top">
        {% if post.research_domain %}
        <span class="article-tag article-tag--theory">{{ post.research_domain }}</span>
        {% endif %}
        <span class="intel-impact-date">{{ post.date | date: "%b %d, %Y" }}</span>
      </div>
      <h4 class="intel-impact-title">{{ post.title }}</h4>
      {% assign excerpt_text = post.excerpt | strip_html | truncate: 180 %}
      {% if excerpt_text and excerpt_text != "" %}
      <p class="intel-impact-implication">{{ excerpt_text }}</p>
      {% endif %}
      {% if post.publisher %}
      <div class="intel-impact-segments">
        <span class="segment-tag segment-tag--sm">{{ post.publisher }}</span>
      </div>
      {% endif %}
    </a>
    {% endfor %}
  </div>

  <div class="autoload-loader" id="feed-loader">Loading more…</div>
  <div class="autoload-sentinel" id="feed-sentinel"></div>
</section>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var allItems = Array.from(document.querySelectorAll("#research-article-feed .intel-impact-item"));
  var feedLoader = document.getElementById("feed-loader");
  var feedSentinel = document.getElementById("feed-sentinel");
  var feedCount = document.getElementById("feed-count");
  var resetBtn = document.getElementById("filter-reset");

  var BATCH = 30;
  var activeDomain = "all";
  var activeDate = "all";
  var activeSource = "all";
  var observer = null;
  var currentItems = [];
  var loadedCount = 0;

  // ── Populate domain pills ──────────────────────────────────
  var domains = {};
  allItems.forEach(function (item) {
    var d = item.getAttribute("data-domain");
    if (d) domains[d] = (domains[d] || 0) + 1;
  });
  var domainPills = document.getElementById("domain-pills");
  Object.keys(domains).sort().forEach(function (d) {
    var btn = document.createElement("button");
    btn.className = "intel-filter-pill";
    btn.setAttribute("data-domain", d);
    btn.textContent = d.charAt(0).toUpperCase() + d.slice(1);
    domainPills.appendChild(btn);
  });

  // ── Populate source pills ──────────────────────────────────
  var sources = {};
  allItems.forEach(function (item) {
    var src = item.getAttribute("data-source");
    var label = item.querySelector(".segment-tag");
    if (src) sources[src] = { label: label ? label.textContent.trim() : src, count: (sources[src] ? sources[src].count : 0) + 1 };
  });
  var sourcePills = document.getElementById("source-pills");
  Object.keys(sources).sort(function (a, b) { return sources[b].count - sources[a].count; }).forEach(function (src) {
    var btn = document.createElement("button");
    btn.className = "intel-filter-pill";
    btn.setAttribute("data-source", src);
    btn.textContent = sources[src].label;
    sourcePills.appendChild(btn);
  });

  // ── Pill click handlers ────────────────────────────────────
  function bindPills(container, attr, getCurrent, setCurrent) {
    container.addEventListener("click", function (e) {
      var btn = e.target.closest(".intel-filter-pill");
      if (!btn) return;
      Array.from(container.querySelectorAll(".intel-filter-pill")).forEach(function (p) { p.classList.remove("active"); });
      btn.classList.add("active");
      setCurrent(btn.getAttribute(attr));
      applyFilter();
    });
  }

  bindPills(domainPills, "data-domain",
    function () { return activeDomain; },
    function (v) { activeDomain = v; });

  bindPills(document.querySelector("[data-date='all']").parentElement, "data-date",
    function () { return activeDate; },
    function (v) { activeDate = v; });

  bindPills(sourcePills, "data-source",
    function () { return activeSource; },
    function (v) { activeSource = v; });

  // ── Filter logic ───────────────────────────────────────────
  function hasActiveFilters() {
    return activeDomain !== "all" || activeDate !== "all" || activeSource !== "all";
  }

  function getFiltered() {
    var now = new Date();
    var cutoff = null;
    if (activeDate !== "all") {
      cutoff = parseInt(new Date(now.getTime() - parseInt(activeDate, 10) * 86400000)
        .toISOString().slice(0, 10).replace(/-/g, ""), 10);
    }

    return allItems.filter(function (item) {
      if (activeDomain !== "all" && item.getAttribute("data-domain") !== activeDomain) return false;
      if (activeSource !== "all" && item.getAttribute("data-source") !== activeSource) return false;
      if (cutoff) {
        var d = parseInt(item.getAttribute("data-date") || "0", 10);
        if (d < cutoff) return false;
      }
      return true;
    }).sort(function (a, b) {
      return (b.getAttribute("data-date") || "").localeCompare(a.getAttribute("data-date") || "");
    });
  }

  function showBatch(items, start) {
    var end = Math.min(start + BATCH, items.length);
    for (var i = start; i < end; i++) {
      var item = items[i];
      item.style.display = "";
      if (start > 0) {
        item.style.opacity = "0";
        item.style.transform = "translateY(8px)";
        (function (el) {
          requestAnimationFrame(function () {
            el.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          });
        })(item);
      }
    }
    return end;
  }

  function setupObserver() {
    if (observer) { observer.disconnect(); observer = null; }
    if (loadedCount >= currentItems.length) return;
    observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      feedLoader.classList.add("is-active");
      setTimeout(function () {
        loadedCount = showBatch(currentItems, loadedCount);
        feedLoader.classList.remove("is-active");
        if (loadedCount >= currentItems.length) { observer.disconnect(); observer = null; }
      }, 80);
    }, { rootMargin: "300px" });
    observer.observe(feedSentinel);
  }

  function applyFilter() {
    if (observer) { observer.disconnect(); observer = null; }
    currentItems = getFiltered();
    loadedCount = 0;
    allItems.forEach(function (item) { item.style.display = "none"; });
    loadedCount = showBatch(currentItems, 0);
    if (feedCount) {
      feedCount.textContent = currentItems.length === allItems.length
        ? currentItems.length + " articles"
        : currentItems.length + " of " + allItems.length + " articles";
    }
    resetBtn.style.display = hasActiveFilters() ? "" : "none";
    feedLoader.classList.remove("is-active");
    setupObserver();
  }

  resetBtn.addEventListener("click", function () {
    activeDomain = "all";
    activeDate = "all";
    activeSource = "all";
    document.querySelectorAll("#research-filter-bar .intel-filter-pill").forEach(function (p) {
      var isAll = p.getAttribute("data-domain") === "all" ||
                  p.getAttribute("data-date") === "all" ||
                  p.getAttribute("data-source") === "all";
      p.classList.toggle("active", isAll);
    });
    applyFilter();
  });

  applyFilter();
});
</script>
