---
layout: default
title: All Topics
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

<section class="intel-hero">
  <h1>All Topics</h1>
  <p class="intel-subtitle">{{ total_posts }} articles — filter by topic, search, and browse the full archive.</p>
</section>

<section class="topic-filter-panel" aria-label="Filter by topic">
  <div class="topic-filter-buttons" role="group" aria-label="Topic filters">
    <button class="topic-pill active" data-topic="all">All</button>
    <button class="topic-pill" data-topic="quality">Quality</button>
    <button class="topic-pill" data-topic="operations">Operations</button>
    <button class="topic-pill" data-topic="governance">Governance</button>
    <button class="topic-pill" data-topic="market">Market</button>
    <button class="topic-pill" data-topic="strategy">Strategy</button>
  </div>
</section>

<section class="intel-section" id="articles-section">
  <div class="intel-feed-controls">
    <input type="search" class="intel-feed-search" id="intel-feed-search" placeholder="Search articles…" autocomplete="off" aria-label="Search articles">
    <select class="intel-feed-sort" id="intel-feed-sort" aria-label="Sort articles">
      <option value="date">Newest First</option>
      <option value="impact">Highest Impact</option>
    </select>
  </div>

  <p class="feed-count-label" id="feed-count" aria-live="polite"></p>

  <div class="intel-article-feed" id="intel-article-feed">
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

    <a href="{{ post.url | relative_url }}" class="intel-feed-item"
       data-title="{{ post.title | downcase | escape }}"
       data-impact="{{ post.impact_score | default: 0 }}"
       data-date="{{ post.date | date: '%Y%m%d' }}"
       data-topics="{{ topics_trimmed }}"
       data-segments="{{ post.affected_segments | join: '|' }}">
      <div class="intel-feed-item-left">
        <span class="intel-feed-date">{{ post.date | date: "%b %d, %Y" }}</span>
        {% if post.impact_score and post.impact_score >= 3 %}
        <span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {{ post.impact_score }}"></span>
        {% endif %}
      </div>
      <div class="intel-feed-item-main">
        <h4 class="intel-feed-title">{{ post.title }}</h4>
        <p class="intel-feed-excerpt">{{ post.excerpt | strip_html | truncate: 120 }}</p>
        {% if topics_trimmed != "" %}
        <div class="intel-feed-topics">{% assign tlist = topics_trimmed | split: " " %}{% for t in tlist %}<span class="feed-topic-tag feed-topic-tag--{{ t }}">{{ t }}</span>{% endfor %}</div>
        {% endif %}
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

  <div class="autoload-loader" id="feed-loader">Loading more…</div>
  <div class="autoload-sentinel" id="feed-sentinel"></div>
</section>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var allItems = Array.from(document.querySelectorAll("#intel-article-feed .intel-feed-item"));
  var feedSearch = document.getElementById("intel-feed-search");
  var feedSort = document.getElementById("intel-feed-sort");
  var feedLoader = document.getElementById("feed-loader");
  var feedSentinel = document.getElementById("feed-sentinel");
  var feedCount = document.getElementById("feed-count");
  var topicPills = Array.from(document.querySelectorAll(".topic-filter-panel [data-topic]"));
  var BATCH = 30;
  var activeTopic = "all";
  var observer = null;
  var currentItems = [];
  var loadedCount = 0;

  function getFiltered() {
    var query = (feedSearch.value || "").trim().toLowerCase();
    var sortBy = feedSort.value;

    var filtered = allItems.filter(function (item) {
      if (activeTopic !== "all") {
        var itemTopics = (item.getAttribute("data-topics") || "").trim().split(/\s+/);
        if (itemTopics.indexOf(activeTopic) === -1) return false;
      }
      if (query) {
        var title = item.getAttribute("data-title") || "";
        var excerptEl = item.querySelector(".intel-feed-excerpt");
        var excerpt = excerptEl ? excerptEl.textContent.toLowerCase() : "";
        return title.indexOf(query) !== -1 || excerpt.indexOf(query) !== -1;
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
        item.style.transform = "translateY(10px)";
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

    feedLoader.classList.remove("is-active");
    setupObserver();
  }

  topicPills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      topicPills.forEach(function (p) { p.classList.remove("active"); });
      pill.classList.add("active");
      activeTopic = pill.getAttribute("data-topic");
      history.replaceState(null, "", activeTopic === "all" ? window.location.pathname : "#" + activeTopic);
      applyFilter();
    });
  });

  feedSearch.addEventListener("input", function () { applyFilter(); });
  feedSort.addEventListener("change", function () { applyFilter(); });

  var hash = window.location.hash.replace("#", "");
  if (["quality", "operations", "governance", "market", "strategy"].indexOf(hash) !== -1) {
    activeTopic = hash;
    topicPills.forEach(function (p) { p.classList.remove("active"); });
    var match = document.querySelector('.topic-filter-panel [data-topic="' + hash + '"]');
    if (match) match.classList.add("active");
  }

  applyFilter();
});
</script>
