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

<section class="all-articles-filter-bar" id="filter-bar">
  <button class="filter-bar-toggle" id="filter-bar-toggle" aria-expanded="false" aria-controls="filter-bar-collapsible">
    <span class="filter-bar-toggle-left">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      <span class="filter-bar-toggle-label">Filters</span>
      <span class="filter-bar-toggle-badge" id="filter-bar-badge"></span>
    </span>
    <svg class="filter-bar-toggle-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>

  <div class="filter-bar-collapsible" id="filter-bar-collapsible">
    <div class="filter-bar-inner">

      <div class="filter-group">
        <label class="filter-label">Domain</label>
        <select class="filter-select" id="domain-filter" aria-label="Filter by research domain">
          <option value="all">All domains</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Relevance</label>
        <div class="filter-chips" id="relevance-chips" role="group" aria-label="Filter by relevance">
          <button class="filter-chip active" data-relevance="all">Any</button>
          <button class="filter-chip" data-relevance="5"><span class="chip-impact-icon chip-impact--high"></span>Groundbreaking</button>
          <button class="filter-chip" data-relevance="4"><span class="chip-impact-icon chip-impact--high"></span>Major+</button>
          <button class="filter-chip" data-relevance="3"><span class="chip-impact-icon chip-impact--mid"></span>Notable+</button>
          <button class="filter-chip" data-relevance="2"><span class="chip-impact-icon chip-impact--low"></span>Relevant+</button>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">Date</label>
        <select class="filter-select" id="date-filter" aria-label="Filter by date">
          <option value="all">All time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
          <option value="365">Last year</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Source</label>
        <select class="filter-select" id="source-filter" aria-label="Filter by source">
          <option value="all">All sources</option>
        </select>
      </div>

      <div class="filter-group filter-group--sort">
        <label class="filter-label">Sort</label>
        <select class="filter-select" id="sort-select" aria-label="Sort articles">
          <option value="date">Newest first</option>
          <option value="relevance">Highest relevance</option>
        </select>
      </div>
    </div>

    <div class="filter-status-row">
      <p class="filter-count" id="feed-count" aria-live="polite"></p>
      <button class="filter-reset-btn" id="filter-reset" style="display:none;">Clear filters</button>
    </div>
  </div>
</section>

<p class="theory-crosslink" style="margin-bottom: var(--space-4); padding: var(--space-3) var(--space-4); background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: var(--radius-md); font-size: 0.9rem;">
  Looking for industry articles? Visit <a href="/all-articles/" style="color: var(--accent); font-weight: 600;">All articles</a>
</p>

<section class="all-articles-feed-section" id="articles-section">
  <div class="all-articles-feed" id="research-article-feed">
    {% for post in theory_posts %}
    <a href="{{ post.url | relative_url }}" class="article-card"
       data-title="{{ post.title | downcase | escape }}"
       data-relevance="{{ post.relevance_score | default: 0 }}"
       data-date="{{ post.date | date: '%Y%m%d' }}"
       data-date-iso="{{ post.date | date: '%Y-%m-%d' }}"
       data-domain="{{ post.research_domain | downcase | default: '' }}"
       data-source="{{ post.publisher | downcase | default: '' }}">
      <div class="article-card-body">
        <h3 class="article-card-title">{{ post.title }}</h3>
        <p class="article-card-excerpt">{{ post.excerpt | strip_html | truncate: 160 }}</p>
        {% if post.research_domain %}
        <div class="article-card-tags">
          <span class="article-tag article-tag--theory">{{ post.research_domain }}</span>
        </div>
        {% endif %}
      </div>
      <div class="article-card-meta">
        <time class="article-card-date">{{ post.date | date: "%b %d, %Y" }}</time>
        {% if post.relevance_score and post.relevance_score >= 2 %}
        <span class="article-card-impact article-card-impact--{{ post.relevance_score }}">
          {% if post.relevance_score == 5 %}Groundbreaking{% elsif post.relevance_score == 4 %}Major{% elsif post.relevance_score == 3 %}Notable{% elsif post.relevance_score == 2 %}Relevant{% else %}Peripheral{% endif %}
        </span>
        {% endif %}
        {% if post.publisher %}
        <span class="article-card-source">{{ post.publisher }}</span>
        {% endif %}
      </div>
    </a>
    {% endfor %}
  </div>

  <div class="autoload-loader" id="feed-loader">Loading more…</div>
  <div class="autoload-sentinel" id="feed-sentinel"></div>
</section>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var allItems = Array.from(document.querySelectorAll("#research-article-feed .article-card"));
  var feedLoader = document.getElementById("feed-loader");
  var feedSentinel = document.getElementById("feed-sentinel");
  var feedCount = document.getElementById("feed-count");
  var relevanceChips = Array.from(document.querySelectorAll("#relevance-chips [data-relevance]"));
  var domainFilter = document.getElementById("domain-filter");
  var dateFilter = document.getElementById("date-filter");
  var sourceFilter = document.getElementById("source-filter");
  var sortSelect = document.getElementById("sort-select");
  var resetBtn = document.getElementById("filter-reset");

  var filterBarToggle = document.getElementById("filter-bar-toggle");
  var filterBarEl = document.getElementById("filter-bar");
  var filterBarBadge = document.getElementById("filter-bar-badge");

  filterBarToggle.addEventListener("click", function () {
    var isOpen = filterBarEl.classList.toggle("is-open");
    filterBarToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  var BATCH = 30;
  var activeRelevance = "all";
  var observer = null;
  var currentItems = [];
  var loadedCount = 0;

  function updateMobileBadge() {
    var count = 0;
    if (activeRelevance !== "all") count++;
    if (domainFilter.value !== "all") count++;
    if (dateFilter.value !== "all") count++;
    if (sourceFilter.value !== "all") count++;
    if (filterBarBadge) {
      filterBarBadge.textContent = count > 0 ? count : "";
      filterBarBadge.style.display = count > 0 ? "" : "none";
    }
  }

  // Populate domain filter from actual data
  var domains = {};
  allItems.forEach(function (item) {
    var d = item.getAttribute("data-domain");
    if (d && d !== "") {
      if (!domains[d]) domains[d] = 0;
      domains[d]++;
    }
  });
  Object.keys(domains).sort().forEach(function (d) {
    var opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d.charAt(0).toUpperCase() + d.slice(1) + " (" + domains[d] + ")";
    domainFilter.appendChild(opt);
  });

  // Populate source filter from actual data
  var sources = {};
  allItems.forEach(function (item) {
    var src = item.getAttribute("data-source");
    if (src && src !== "") {
      var display = item.querySelector(".article-card-source");
      var label = display ? display.textContent.trim() : src;
      if (!sources[src]) sources[src] = { label: label, count: 0 };
      sources[src].count++;
    }
  });
  Object.keys(sources).sort(function (a, b) {
    return sources[b].count - sources[a].count;
  }).forEach(function (src) {
    var opt = document.createElement("option");
    opt.value = src;
    opt.textContent = sources[src].label + " (" + sources[src].count + ")";
    sourceFilter.appendChild(opt);
  });

  function hasActiveFilters() {
    return activeRelevance !== "all" || domainFilter.value !== "all" ||
           dateFilter.value !== "all" || sourceFilter.value !== "all";
  }

  function getFiltered() {
    var sortBy = sortSelect.value;
    var dateDays = dateFilter.value;
    var source = sourceFilter.value;
    var domain = domainFilter.value;
    var now = new Date();

    var cutoff = null;
    if (dateDays !== "all") {
      cutoff = new Date(now.getTime() - parseInt(dateDays, 10) * 86400000);
      cutoff = parseInt(cutoff.toISOString().slice(0, 10).replace(/-/g, ""), 10);
    }

    var filtered = allItems.filter(function (item) {
      // Domain filter
      if (domain !== "all") {
        var itemDomain = item.getAttribute("data-domain") || "";
        if (itemDomain !== domain) return false;
      }
      // Relevance filter
      if (activeRelevance !== "all") {
        var rel = parseInt(item.getAttribute("data-relevance") || "0", 10);
        if (rel < parseInt(activeRelevance, 10)) return false;
      }
      // Date filter
      if (cutoff) {
        var itemDate = parseInt(item.getAttribute("data-date") || "0", 10);
        if (itemDate < cutoff) return false;
      }
      // Source filter
      if (source !== "all") {
        var itemSource = item.getAttribute("data-source") || "";
        if (itemSource !== source) return false;
      }
      return true;
    });

    if (sortBy === "relevance") {
      filtered.sort(function (a, b) {
        return parseInt(b.getAttribute("data-relevance") || "0", 10) - parseInt(a.getAttribute("data-relevance") || "0", 10);
      });
    } else {
      filtered.sort(function (a, b) {
        return (b.getAttribute("data-date") || "").localeCompare(a.getAttribute("data-date") || "");
      });
    }
    return filtered;
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
      if (loadedCount >= currentItems.length) return;
      feedLoader.classList.add("is-active");
      setTimeout(function () {
        loadedCount = showBatch(currentItems, loadedCount);
        feedLoader.classList.remove("is-active");
        if (loadedCount >= currentItems.length) {
          observer.disconnect();
          observer = null;
        }
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
    updateMobileBadge();

    feedLoader.classList.remove("is-active");
    setupObserver();
  }

  // Relevance chips
  relevanceChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      relevanceChips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      activeRelevance = chip.getAttribute("data-relevance");
      applyFilter();
    });
  });

  // Dropdowns
  domainFilter.addEventListener("change", function () { applyFilter(); });
  dateFilter.addEventListener("change", function () { applyFilter(); });
  sourceFilter.addEventListener("change", function () { applyFilter(); });
  sortSelect.addEventListener("change", function () { applyFilter(); });

  // Reset
  resetBtn.addEventListener("click", function () {
    activeRelevance = "all";
    relevanceChips.forEach(function (c) { c.classList.remove("active"); });
    relevanceChips[0].classList.add("active");
    domainFilter.value = "all";
    dateFilter.value = "all";
    sourceFilter.value = "all";
    sortSelect.value = "date";
    applyFilter();
  });

  applyFilter();
});
</script>
