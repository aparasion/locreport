---
layout: default
title: All Articles
permalink: /all-articles/
nav: true
nav_order: 1.5
description: "Complete feed of all localization industry articles — search, sort, and browse the full archive."
---

{% comment %} ── Count totals ─────────────────────────────────────── {% endcomment %}
{% assign total_posts = site.posts.size %}

<section class="intel-hero">
  <h1>All Articles</h1>
  <p class="intel-subtitle">Complete feed of all {{ total_posts }} tracked articles. Search, filter, and browse the full archive.</p>
</section>

{% comment %} ── Full Article Feed ────────────────────────────────── {% endcomment %}
<section class="intel-section" id="articles-section">
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

<script>
document.addEventListener("DOMContentLoaded", function () {
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

    var parent = document.getElementById("intel-article-feed");
    visibleItems.forEach(function (item) {
      parent.appendChild(item);
    });

    feedItems.forEach(function (item) {
      if (visibleItems.indexOf(item) === -1) {
        item.style.display = "none";
      }
    });

    visibleItems.forEach(function (item, idx) {
      item.style.display = idx < feedVisible ? "" : "none";
    });

    if (feedLoadMore) {
      feedLoadMore.style.display = visibleItems.length > feedVisible ? "" : "none";
    }
  }

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
});
</script>
