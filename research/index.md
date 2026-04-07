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

<section class="all-articles-filter-bar research-filter-panel" id="research-filter-bar">
  <button class="filter-bar-toggle" id="research-filter-toggle" aria-expanded="false" aria-controls="research-filter-collapsible">
    <span class="filter-bar-toggle-left">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      <span class="filter-bar-toggle-label">Filters</span>
      <span class="filter-bar-toggle-badge" id="research-filter-badge"></span>
    </span>
    <svg class="filter-bar-toggle-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>

  <div class="filter-bar-collapsible" id="research-filter-collapsible">
    <div class="filter-bar-inner">
      <div class="filter-group">
        <label class="filter-label" for="domain-filter">Domain</label>
        <select class="filter-select" id="domain-filter" aria-label="Filter by domain">
          <option value="all">All domains</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label" for="date-filter">Date</label>
        <select class="filter-select" id="date-filter" aria-label="Filter by date">
          <option value="all">All time</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
          <option value="365">Last year</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label" for="source-filter">Source</label>
        <select class="filter-select" id="source-filter" aria-label="Filter by source">
          <option value="all">All sources</option>
        </select>
      </div>
    </div>

    <div class="filter-status-row">
      <p class="filter-count" id="feed-count" aria-live="polite"></p>
      <button class="filter-reset-btn" id="filter-reset" style="display:none;">Clear filters</button>
    </div>
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
  var domainFilter = document.getElementById("domain-filter");
  var dateFilter = document.getElementById("date-filter");
  var sourceFilter = document.getElementById("source-filter");

  var filterBarEl = document.getElementById("research-filter-bar");
  var filterBarToggle = document.getElementById("research-filter-toggle");
  var filterBarBadge = document.getElementById("research-filter-badge");

  filterBarToggle.addEventListener("click", function () {
    var isOpen = filterBarEl.classList.toggle("is-open");
    filterBarToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  var BATCH = 30;
  var observer = null;
  var currentItems = [];
  var loadedCount = 0;

  function updateMobileBadge() {
    var count = 0;
    if (domainFilter.value !== "all") count++;
    if (dateFilter.value !== "all") count++;
    if (sourceFilter.value !== "all") count++;
    if (filterBarBadge) {
      filterBarBadge.textContent = count > 0 ? count : "";
      filterBarBadge.style.display = count > 0 ? "" : "none";
    }
  }

  // ── Populate domain dropdown ───────────────────────────────
  var domains = {};
  allItems.forEach(function (item) {
    var d = item.getAttribute("data-domain");
    if (d) domains[d] = (domains[d] || 0) + 1;
  });
  Object.keys(domains).sort().forEach(function (d) {
    var opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d.charAt(0).toUpperCase() + d.slice(1) + " (" + domains[d] + ")";
    domainFilter.appendChild(opt);
  });

  // ── Populate source dropdown ───────────────────────────────
  var sources = {};
  allItems.forEach(function (item) {
    var src = item.getAttribute("data-source");
    var label = item.querySelector(".segment-tag");
    if (src) sources[src] = { label: label ? label.textContent.trim() : src, count: (sources[src] ? sources[src].count : 0) + 1 };
  });
  Object.keys(sources).sort(function (a, b) { return sources[b].count - sources[a].count; }).forEach(function (src) {
    var opt = document.createElement("option");
    opt.value = src;
    opt.textContent = sources[src].label + " (" + sources[src].count + ")";
    sourceFilter.appendChild(opt);
  });

  [domainFilter, dateFilter, sourceFilter].forEach(function (el) {
    el.addEventListener("change", applyFilter);
  });

  // ── Filter logic ───────────────────────────────────────────
  function hasActiveFilters() {
    return domainFilter.value !== "all" || dateFilter.value !== "all" || sourceFilter.value !== "all";
  }

  function getFiltered() {
    var now = new Date();
    var cutoff = null;
    if (dateFilter.value !== "all") {
      cutoff = parseInt(new Date(now.getTime() - parseInt(dateFilter.value, 10) * 86400000)
        .toISOString().slice(0, 10).replace(/-/g, ""), 10);
    }

    return allItems.filter(function (item) {
      if (domainFilter.value !== "all" && item.getAttribute("data-domain") !== domainFilter.value) return false;
      if (sourceFilter.value !== "all" && item.getAttribute("data-source") !== sourceFilter.value) return false;
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
    updateMobileBadge();
    setupObserver();
  }

  resetBtn.addEventListener("click", function () {
    domainFilter.value = "all";
    dateFilter.value = "all";
    sourceFilter.value = "all";
    applyFilter();
  });

  applyFilter();
});
</script>
