---
layout: default
title: All articles
permalink: /all-articles/
nav: true
nav_order: 1.5
description: "Browse all localization industry articles by topic — quality, operations, governance, market dynamics, and strategy."
---

{% comment %} ── Topic signal/keyword maps (mirrored from topics/index.md) ── {% endcomment %}
{% assign quality_signals = "quality-gap-closure,measurable-quality-evaluation" | split: "," %}
{% assign quality_keywords = "mqm,mtpe,post-edit,linguistic quality,quality assurance,quality evaluation,lqa" | split: "," %}

{% assign ops_signals = "localization-operating-system,translation-memory-obsolescence,agentic-localization-workflows,multimodal-content-localization" | split: "," %}
{% assign ops_keywords = "translation memory,tms,cat tool,localization platform,dubbing,subtitl,agentic,ai agent" | split: "," %}

{% assign gov_signals = "governance-in-ai-workflows,regulatory-fragmentation" | split: "," %}
{% assign gov_keywords = "eu ai act,ai regulation,compliance requirement,language law,ai governance,guardrail" | split: "," %}

{% assign market_signals = "human-post-editing-contraction" | split: "," %}
{% assign market_keywords = "freelance translator,translator demand,post-editor,language services market,translation rates" | split: "," %}

{% assign strategy_signals = "localization-first-content-design" | split: "," %}
{% assign strategy_keywords = "internationalization,i18n,locale-aware,transcreation,localization-first" | split: "," %}

{% assign total_posts = site.posts.size %}

<section class="all-articles-hero">
  <h1>All articles</h1>
  <p class="all-articles-subtitle">{{ total_posts }} articles across the localization intelligence archive.</p>
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
        <label class="filter-label">Topic</label>
        <div class="filter-chips" id="topic-chips" role="group" aria-label="Filter by topic">
          <button class="filter-chip active" data-topic="all">All</button>
          <button class="filter-chip" data-topic="quality"><span class="chip-dot chip-dot--quality"></span>Quality</button>
          <button class="filter-chip" data-topic="operations"><span class="chip-dot chip-dot--operations"></span>Operations</button>
          <button class="filter-chip" data-topic="governance"><span class="chip-dot chip-dot--governance"></span>Governance</button>
          <button class="filter-chip" data-topic="market"><span class="chip-dot chip-dot--market"></span>Market</button>
          <button class="filter-chip" data-topic="strategy"><span class="chip-dot chip-dot--strategy"></span>Strategy</button>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">Impact</label>
        <div class="filter-chips" id="impact-chips" role="group" aria-label="Filter by impact">
          <button class="filter-chip active" data-impact="all">Any</button>
          <button class="filter-chip" data-impact="4"><span class="chip-impact-icon chip-impact--high"></span>Major+</button>
          <button class="filter-chip" data-impact="3"><span class="chip-impact-icon chip-impact--mid"></span>Significant+</button>
          <button class="filter-chip" data-impact="2"><span class="chip-impact-icon chip-impact--low"></span>Notable+</button>
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
          <option value="impact">Highest impact</option>
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
  <div class="all-articles-feed" id="intel-article-feed">
    {% for post in site.posts %}
      {% assign signal_ids_str = post.signal_ids | join: ',' | downcase %}
      {% assign source_text = post.title | append: ' ' | append: post.excerpt | downcase %}
      {% assign topics_list = "" %}

      {% assign match = false %}
      {% for sid in quality_signals %}{% if signal_ids_str contains sid %}{% assign match = true %}{% endif %}{% endfor %}
      {% if match == false %}{% for kw in quality_keywords %}{% if source_text contains kw %}{% assign match = true %}{% endif %}{% endfor %}{% endif %}
      {% if match %}{% assign topics_list = topics_list | append: "quality " %}{% endif %}

      {% assign match = false %}
      {% for sid in ops_signals %}{% if signal_ids_str contains sid %}{% assign match = true %}{% endif %}{% endfor %}
      {% if match == false %}{% for kw in ops_keywords %}{% if source_text contains kw %}{% assign match = true %}{% endif %}{% endfor %}{% endif %}
      {% if match %}{% assign topics_list = topics_list | append: "operations " %}{% endif %}

      {% assign match = false %}
      {% for sid in gov_signals %}{% if signal_ids_str contains sid %}{% assign match = true %}{% endif %}{% endfor %}
      {% if match == false %}{% for kw in gov_keywords %}{% if source_text contains kw %}{% assign match = true %}{% endif %}{% endfor %}{% endif %}
      {% if match %}{% assign topics_list = topics_list | append: "governance " %}{% endif %}

      {% assign match = false %}
      {% for sid in market_signals %}{% if signal_ids_str contains sid %}{% assign match = true %}{% endif %}{% endfor %}
      {% if match == false %}{% for kw in market_keywords %}{% if source_text contains kw %}{% assign match = true %}{% endif %}{% endfor %}{% endif %}
      {% if match %}{% assign topics_list = topics_list | append: "market " %}{% endif %}

      {% assign match = false %}
      {% for sid in strategy_signals %}{% if signal_ids_str contains sid %}{% assign match = true %}{% endif %}{% endfor %}
      {% if match == false %}{% for kw in strategy_keywords %}{% if source_text contains kw %}{% assign match = true %}{% endif %}{% endfor %}{% endif %}
      {% if match %}{% assign topics_list = topics_list | append: "strategy " %}{% endif %}

      {% assign topics_trimmed = topics_list | strip %}

    <a href="{{ post.url | relative_url }}" class="article-card"
       data-title="{{ post.title | downcase | escape }}"
       data-impact="{{ post.impact_score | default: 0 }}"
       data-date="{{ post.date | date: '%Y%m%d' }}"
       data-date-iso="{{ post.date | date: '%Y-%m-%d' }}"
       data-topics="{{ topics_trimmed }}"
       data-source="{{ post.publisher | downcase | default: '' }}"
       data-segments="{{ post.affected_segments | join: '|' }}">
      <div class="article-card-body">
        <h3 class="article-card-title">{{ post.title }}</h3>
        <p class="article-card-excerpt">{{ post.excerpt | strip_html | truncate: 160 }}</p>
        {% if topics_trimmed != "" %}
        <div class="article-card-tags">{% assign tlist = topics_trimmed | split: " " %}{% for t in tlist %}<span class="article-tag article-tag--{{ t }}">{{ t }}</span>{% endfor %}</div>
        {% endif %}
      </div>
      <div class="article-card-meta">
        <time class="article-card-date">{{ post.date | date: "%b %d, %Y" }}</time>
        {% if post.impact_score and post.impact_score >= 2 %}
        <span class="article-card-impact article-card-impact--{{ post.impact_score }}">
          {% if post.impact_score == 4 %}Major{% elsif post.impact_score == 3 %}Significant{% elsif post.impact_score == 2 %}Notable{% else %}Routine{% endif %}
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
  var allItems = Array.from(document.querySelectorAll("#intel-article-feed .article-card"));
  var feedLoader = document.getElementById("feed-loader");
  var feedSentinel = document.getElementById("feed-sentinel");
  var feedCount = document.getElementById("feed-count");
  var topicChips = Array.from(document.querySelectorAll("#topic-chips [data-topic]"));
  var impactChips = Array.from(document.querySelectorAll("#impact-chips [data-impact]"));
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
  var activeTopic = "all";
  var activeImpact = "all";
  var observer = null;
  var currentItems = [];
  var loadedCount = 0;

  function updateMobileBadge() {
    var count = 0;
    if (activeTopic !== "all") count++;
    if (activeImpact !== "all") count++;
    if (dateFilter.value !== "all") count++;
    if (sourceFilter.value !== "all") count++;
    if (filterBarBadge) {
      filterBarBadge.textContent = count > 0 ? count : "";
      filterBarBadge.style.display = count > 0 ? "" : "none";
    }
  }

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
  var sortedSources = Object.keys(sources).sort(function (a, b) {
    return sources[b].count - sources[a].count;
  });
  sortedSources.forEach(function (src) {
    var opt = document.createElement("option");
    opt.value = src;
    opt.textContent = sources[src].label + " (" + sources[src].count + ")";
    sourceFilter.appendChild(opt);
  });

  function hasActiveFilters() {
    return activeTopic !== "all" || activeImpact !== "all" ||
           dateFilter.value !== "all" || sourceFilter.value !== "all";
  }

  function getFiltered() {
    var sortBy = sortSelect.value;
    var dateDays = dateFilter.value;
    var source = sourceFilter.value;
    var now = new Date();

    var cutoff = null;
    if (dateDays !== "all") {
      cutoff = new Date(now.getTime() - parseInt(dateDays, 10) * 86400000);
      cutoff = parseInt(cutoff.toISOString().slice(0, 10).replace(/-/g, ""), 10);
    }

    var filtered = allItems.filter(function (item) {
      // Topic filter
      if (activeTopic !== "all") {
        var itemTopics = (item.getAttribute("data-topics") || "").trim().split(/\s+/);
        if (itemTopics.indexOf(activeTopic) === -1) return false;
      }
      // Impact filter
      if (activeImpact !== "all") {
        var imp = parseInt(item.getAttribute("data-impact") || "0", 10);
        if (imp < parseInt(activeImpact, 10)) return false;
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

    if (sortBy === "impact") {
      filtered.sort(function (a, b) {
        return parseInt(b.getAttribute("data-impact") || "0", 10) - parseInt(a.getAttribute("data-impact") || "0", 10);
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

  // Topic chips
  topicChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      topicChips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      activeTopic = chip.getAttribute("data-topic");
      applyFilter();
    });
  });

  // Impact chips
  impactChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      impactChips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      activeImpact = chip.getAttribute("data-impact");
      applyFilter();
    });
  });

  // Dropdowns
  dateFilter.addEventListener("change", function () { applyFilter(); });
  sourceFilter.addEventListener("change", function () { applyFilter(); });
  sortSelect.addEventListener("change", function () { applyFilter(); });

  // Reset
  resetBtn.addEventListener("click", function () {
    activeTopic = "all";
    activeImpact = "all";
    topicChips.forEach(function (c) { c.classList.remove("active"); });
    topicChips[0].classList.add("active");
    impactChips.forEach(function (c) { c.classList.remove("active"); });
    impactChips[0].classList.add("active");
    dateFilter.value = "all";
    sourceFilter.value = "all";
    sortSelect.value = "date";
    applyFilter();
  });

  // URL hash support
  var hash = window.location.hash.replace("#", "");
  if (["quality", "operations", "governance", "market", "strategy"].indexOf(hash) !== -1) {
    activeTopic = hash;
    topicChips.forEach(function (c) { c.classList.remove("active"); });
    var m = document.querySelector('#topic-chips [data-topic="' + hash + '"]');
    if (m) m.classList.add("active");
  }

  applyFilter();
});
</script>
