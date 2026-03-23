---
layout: default
title: Search
description: Search LocReport articles on localization, translation, language services, and industry signals.
permalink: /search/
nav: false
---

<div class="search-page">
  <div class="search-page-header">
    <h1 class="search-page-title">Search Articles</h1>
    <p class="search-page-subtitle">Explore localization intelligence across all topics and signals</p>
  </div>

  <div class="search-page-input-wrap">
    <svg class="search-page-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input
      type="search"
      id="search-page-input"
      class="search-page-input"
      placeholder="Search by keyword, topic, publisher…"
      autocomplete="off"
      aria-label="Search articles"
      autofocus
    >
    <span class="search-page-clear" id="search-page-clear" aria-label="Clear search" role="button" tabindex="0">&#x2715;</span>
  </div>

  <div class="search-page-filters" id="search-page-filters">
    <button class="topic-pill active" data-search-topic="all">All Topics</button>
    <button class="topic-pill" data-search-topic="quality">Quality</button>
    <button class="topic-pill" data-search-topic="operations">Operations</button>
    <button class="topic-pill" data-search-topic="governance">Governance</button>
    <button class="topic-pill" data-search-topic="market">Market</button>
    <button class="topic-pill" data-search-topic="strategy">Strategy</button>
  </div>

  <div class="search-page-status" id="search-page-status"></div>

  <div class="post-grid" id="search-page-results" aria-live="polite" aria-atomic="true"></div>

  <div class="search-page-empty" id="search-page-empty" hidden>
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <p>No articles found for <strong id="search-page-empty-term"></strong></p>
    <p class="search-page-empty-hint">Try different keywords or browse by <a href="{{ '/topics/' | relative_url }}">topic</a>.</p>
  </div>
</div>

<script>
(function () {
  var INDEX_URL = "{{ '/search.json' | relative_url }}";
  var TOPIC_MAP = {
    quality: ["quality", "quality-gap-closure", "mqm", "human-in-the-loop", "evaluation"],
    operations: ["operations", "agentic-localization-ops", "tms", "cat", "multimodal", "workflow"],
    governance: ["governance", "ai-governance-localization", "regulation", "compliance", "audit"],
    market: ["market", "translator-employment-shift", "lsp", "employment", "acquisition"],
    strategy: ["strategy", "localization-first-design", "i18n", "content", "design"]
  };

  var allPosts = [];
  var activeTopic = "all";
  var currentQuery = "";

  var input = document.getElementById("search-page-input");
  var clearBtn = document.getElementById("search-page-clear");
  var resultsEl = document.getElementById("search-page-results");
  var statusEl = document.getElementById("search-page-status");
  var emptyEl = document.getElementById("search-page-empty");
  var emptyTerm = document.getElementById("search-page-empty-term");
  var topicBtns = document.querySelectorAll("[data-search-topic]");

  // Load search index
  fetch(INDEX_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      allPosts = data;
      // Handle URL query param ?q=...
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      if (q) {
        input.value = q;
        currentQuery = q;
      }
      renderResults();
    })
    .catch(function () {
      statusEl.textContent = "Search index could not be loaded.";
    });

  input.addEventListener("input", function () {
    currentQuery = input.value.trim();
    clearBtn.style.opacity = currentQuery ? "1" : "0";
    clearBtn.style.pointerEvents = currentQuery ? "auto" : "none";
    // Update URL without reload
    var url = new URL(window.location.href);
    if (currentQuery) {
      url.searchParams.set("q", currentQuery);
    } else {
      url.searchParams.delete("q");
    }
    history.replaceState(null, "", url.toString());
    renderResults();
  });

  clearBtn.addEventListener("click", function () {
    input.value = "";
    currentQuery = "";
    clearBtn.style.opacity = "0";
    clearBtn.style.pointerEvents = "none";
    history.replaceState(null, "", window.location.pathname);
    renderResults();
    input.focus();
  });

  clearBtn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") clearBtn.click();
  });

  topicBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      topicBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      activeTopic = btn.getAttribute("data-search-topic");
      renderResults();
    });
  });

  function postMatchesTopic(post, topic) {
    if (topic === "all") return true;
    var keywords = TOPIC_MAP[topic] || [];
    var haystack = (post.signal_ids + " " + post.categories + " " + post.tags + " " + post.content).toLowerCase();
    return keywords.some(function (kw) { return haystack.indexOf(kw) !== -1; });
  }

  // Parse query into quoted phrases (strict) and free terms (scored)
  function parseQuery(query) {
    var phrases = [];
    var remaining = query.replace(/"([^"]+)"/g, function (_, phrase) {
      var p = phrase.trim().toLowerCase();
      if (p) phrases.push(p);
      return " ";
    });
    var terms = remaining.split(/\s+/).filter(function (w) { return w.length > 1; }).map(function (w) { return w.toLowerCase(); });
    return { phrases: phrases, terms: terms };
  }

  function scorePost(post, query) {
    if (!query) return 1;
    var parsed = parseQuery(query);
    var title    = (post.title      || "").toLowerCase();
    var excerpt  = (post.excerpt    || "").toLowerCase();
    var content  = (post.content    || "").toLowerCase();
    var publisher = (post.publisher || "").toLowerCase();
    var signals  = (post.signal_ids || "").toLowerCase();

    // Strict: any quoted phrase must appear verbatim somewhere in the post
    for (var i = 0; i < parsed.phrases.length; i++) {
      var ph = parsed.phrases[i];
      if (title.indexOf(ph) === -1 && excerpt.indexOf(ph) === -1 &&
          content.indexOf(ph) === -1 && publisher.indexOf(ph) === -1 &&
          signals.indexOf(ph) === -1) {
        return 0;
      }
    }

    var score = 0;
    // Score phrase matches
    parsed.phrases.forEach(function (ph) {
      if (title.indexOf(ph)    !== -1) score += 15;
      if (excerpt.indexOf(ph)  !== -1) score += 8;
      if (content.indexOf(ph)  !== -1) score += 5;
      if (signals.indexOf(ph)  !== -1) score += 3;
    });
    // Score free-term matches
    parsed.terms.forEach(function (word) {
      if (title.indexOf(word)     !== -1) score += 4;
      if (excerpt.indexOf(word)   !== -1) score += 2;
      if (content.indexOf(word)   !== -1) score += 1;
      if (publisher.indexOf(word) !== -1) score += 1;
      if (signals.indexOf(word)   !== -1) score += 1;
    });
    return score;
  }

  function highlight(text, query) {
    if (!query || !text) return text;
    var parsed = parseQuery(query);
    var patterns = [];
    parsed.phrases.forEach(function (ph) {
      patterns.push(ph.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    });
    parsed.terms.forEach(function (w) {
      patterns.push(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    });
    if (!patterns.length) return text;
    var re = new RegExp("(" + patterns.join("|") + ")", "gi");
    return text.replace(re, '<mark class="search-highlight">$1</mark>');
  }

  function renderResults() {
    var query = currentQuery;
    var filtered = allPosts.filter(function (post) {
      return postMatchesTopic(post, activeTopic);
    });

    var scored;
    if (query) {
      scored = filtered
        .map(function (post) { return { post: post, score: scorePost(post, query) }; })
        .filter(function (item) { return item.score > 0; })
        .sort(function (a, b) { return b.score - a.score; })
        .map(function (item) { return item.post; });
    } else {
      scored = filtered;
    }

    resultsEl.innerHTML = "";
    emptyEl.hidden = true;

    if (scored.length === 0) {
      if (query) {
        emptyEl.hidden = false;
        emptyTerm.textContent = "\u201c" + query + "\u201d";
      }
      statusEl.textContent = query
        ? "No results for \u201c" + query + "\u201d"
        : "No articles in this topic yet.";
      return;
    }

    var count = scored.length;
    statusEl.textContent = query
      ? count + " result" + (count !== 1 ? "s" : "") + " for \u201c" + query + "\u201d"
      : count + " article" + (count !== 1 ? "s" : "");

    scored.forEach(function (post) {
      var titleHtml = highlight(post.title, query);
      var excerptHtml = highlight(post.excerpt, query);

      var signalBadge = "";
      if (post.signal_ids) {
        var sid = post.signal_ids.split(" ")[0];
        if (sid) {
          signalBadge = '<span class="post-signal-badge">' + sid.replace(/-/g, " ") + '</span>';
        }
      }

      var publisherBadge = post.publisher
        ? '<span class="post-publisher">' + post.publisher + '</span>'
        : "";

      var card = document.createElement("article");
      card.className = "post-card";
      card.innerHTML =
        '<div class="post-meta">' + post.date + (publisherBadge ? " &middot; " + publisherBadge : "") + '</div>' +
        '<h2><a href="' + post.url + '">' + titleHtml + '</a></h2>' +
        '<p>' + excerptHtml + '</p>' +
        (signalBadge ? '<div class="post-card-footer">' + signalBadge + '</div>' : '');
      resultsEl.appendChild(card);
    });
  }
})();
</script>
