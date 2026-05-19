---
layout: page
title: "Language Technology Directory"
permalink: /tools/directory/
nav: false
description: "Comprehensive directory of language technology tools — TMS platforms, CAT tools, AI translation engines, LSPs, interpreting platforms, and more. Search and filter 100+ companies."
robots: "index, follow"
---

<style>
.dir-hero { margin-bottom: var(--space-6); }
.dir-hero h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 900; margin-bottom: var(--space-2); }
.dir-hero p { color: var(--muted); font-size: 1.05rem; max-width: 640px; }

.dir-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.dir-search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
}
.dir-search-wrap svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
}
.dir-search {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.dir-search:focus { border-color: var(--accent); }
.dir-search::placeholder { color: var(--muted); }

.dir-sort {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  outline: none;
}
.dir-sort:focus { border-color: var(--accent); }

.dir-cats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}
.dir-cat-btn {
  padding: 6px 14px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.dir-cat-btn:hover { border-color: var(--accent); color: var(--accent); }
.dir-cat-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }

.dir-status {
  color: var(--muted);
  font-size: 0.85rem;
  margin-bottom: var(--space-4);
  min-height: 1.2em;
}
.dir-status strong { color: var(--text); }

.dir-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  max-width: var(--site-max-width);
  width: 100%;
}

.dir-card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: var(--space-5);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  text-decoration: none;
  color: var(--text);
}
.dir-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--card-shadow-hover);
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
}

.dir-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.dir-logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid var(--border);
  object-fit: contain;
  background: var(--bg);
  flex-shrink: 0;
  padding: 4px;
}
.dir-logo-fallback {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--accent-soft);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: -0.03em;
  font-family: 'Outfit', sans-serif;
}

.dir-card-title-group { flex: 1; min-width: 0; }
.dir-card-name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dir-card-hq {
  font-size: 0.75rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dir-cat-badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: var(--space-3);
  flex-shrink: 0;
}

.dir-card-desc {
  font-size: 0.875rem;
  color: var(--muted);
  line-height: 1.55;
  flex: 1;
  margin-bottom: var(--space-3);
}

.dir-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: var(--space-3);
}
.dir-tag {
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 600;
}

.dir-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: var(--space-3);
  border-top: 1px solid var(--border);
}
.dir-card-link {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
}
.dir-founded {
  font-size: 0.75rem;
  color: var(--muted);
}

.dir-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-12) var(--space-4);
  color: var(--muted);
}
.dir-empty svg { opacity: 0.3; margin-bottom: var(--space-3); }
.dir-empty p { font-size: 1rem; }

mark.dir-highlight {
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--text);
  border-radius: 2px;
  padding: 0 1px;
}

@media (max-width: 960px) {
  .dir-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .dir-grid { grid-template-columns: 1fr; }
  .dir-controls { flex-direction: column; align-items: stretch; }
}
</style>

<div class="dir-hero">
  <h1>Language Technology Directory</h1>
  <p>100+ tools, platforms, and companies across the language services industry — TMS, CAT tools, AI translation engines, LSPs, interpreting platforms, and more.</p>
</div>

<div class="dir-controls">
  <div class="dir-search-wrap">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input type="text" id="dir-search" class="dir-search" placeholder="Search by name, description, or tag…" autocomplete="off" aria-label="Search directory">
  </div>
  <select id="dir-sort" class="dir-sort" aria-label="Sort order">
    <option value="name">Sort: A–Z</option>
    <option value="founded">Sort: Founded</option>
  </select>
</div>

<div class="dir-cats" id="dir-cats" role="group" aria-label="Filter by category">
  <button class="dir-cat-btn active" data-cat="all">All</button>
  <button class="dir-cat-btn" data-cat="tms">TMS</button>
  <button class="dir-cat-btn" data-cat="cat">CAT Tools</button>
  <button class="dir-cat-btn" data-cat="ai-mt">AI &amp; MT</button>
  <button class="dir-cat-btn" data-cat="lsp">LSPs</button>
  <button class="dir-cat-btn" data-cat="interpreting">Interpreting</button>
  <button class="dir-cat-btn" data-cat="av-localization">A/V Localization</button>
  <button class="dir-cat-btn" data-cat="terminology">Terminology</button>
  <button class="dir-cat-btn" data-cat="qa">QA Tools</button>
  <button class="dir-cat-btn" data-cat="project-management">Project Mgmt</button>
  <button class="dir-cat-btn" data-cat="cms">CMS</button>
  <button class="dir-cat-btn" data-cat="research">Research</button>
  <button class="dir-cat-btn" data-cat="community">Community</button>
</div>

<p class="dir-status" id="dir-status" aria-live="polite"></p>

<div class="dir-grid" id="dir-grid" aria-label="Directory results"></div>

<script>
(function () {
  var LOGO_BASE = "https://www.google.com/s2/favicons?sz=64&domain=";

  var CAT_LABELS = {
    "tms":              "TMS",
    "cat":              "CAT Tool",
    "ai-mt":            "AI / MT",
    "lsp":              "LSP",
    "interpreting":     "Interpreting",
    "av-localization":  "A/V Localization",
    "terminology":      "Terminology",
    "qa":               "QA",
    "project-management": "Project Mgmt",
    "cms":              "CMS",
    "research":         "Research",
    "community":        "Community"
  };

  var CAT_COLORS = {
    "tms":              { bg: "rgba(61,90,254,0.12)",  color: "#3D5AFE" },
    "cat":              { bg: "rgba(16,185,129,0.12)", color: "#059669" },
    "ai-mt":            { bg: "rgba(139,92,246,0.12)", color: "#7C3AED" },
    "lsp":              { bg: "rgba(245,158,11,0.12)", color: "#B45309" },
    "interpreting":     { bg: "rgba(239,68,68,0.12)",  color: "#DC2626" },
    "av-localization":  { bg: "rgba(236,72,153,0.12)", color: "#BE185D" },
    "terminology":      { bg: "rgba(20,184,166,0.12)", color: "#0F766E" },
    "qa":               { bg: "rgba(249,115,22,0.12)", color: "#C2410C" },
    "project-management": { bg: "rgba(99,102,241,0.12)", color: "#4338CA" },
    "cms":              { bg: "rgba(16,185,129,0.10)", color: "#047857" },
    "research":         { bg: "rgba(107,114,128,0.12)", color: "#374151" },
    "community":        { bg: "rgba(234,179,8,0.12)",  color: "#92400E" }
  };

  var CAT_ICONS = {
    "tms": "🔄", "cat": "✏️", "ai-mt": "🤖", "lsp": "🌐",
    "interpreting": "🎤", "av-localization": "🎬", "terminology": "📖",
    "qa": "✅", "project-management": "📋", "cms": "📄",
    "research": "🔬", "community": "🤝"
  };

  var tools = {{ site.data.directory | jsonify }};

  var currentCat   = "all";
  var currentQuery = "";
  var currentSort  = "name";

  var grid    = document.getElementById("dir-grid");
  var status  = document.getElementById("dir-status");
  var search  = document.getElementById("dir-search");
  var sortSel = document.getElementById("dir-sort");
  var catBtns = document.querySelectorAll(".dir-cat-btn");

  function escapeHtml(str) {
    return (str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  function highlight(text, query) {
    if (!query || !text) return escapeHtml(text);
    var escaped = escapeHtml(text);
    if (!query.trim()) return escaped;
    var words = query.trim().split(/\s+/).filter(function(w){ return w.length > 1; });
    if (!words.length) return escaped;
    var pattern = new RegExp("(" + words.map(function(w){ return w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }).join("|") + ")", "gi");
    return escaped.replace(pattern, '<mark class="dir-highlight">$1</mark>');
  }

  function score(tool, query) {
    if (!query) return 1;
    var q = query.toLowerCase();
    var words = q.split(/\s+/).filter(function(w){ return w.length > 1; });
    if (!words.length) return 1;
    var s = 0;
    words.forEach(function(w) {
      if ((tool.name || "").toLowerCase().indexOf(w) !== -1) s += 10;
      if ((tool.description || "").toLowerCase().indexOf(w) !== -1) s += 4;
      if ((tool.category || "").toLowerCase().indexOf(w) !== -1) s += 3;
      if ((tool.hq || "").toLowerCase().indexOf(w) !== -1) s += 2;
      if ((tool.type || "").toLowerCase().indexOf(w) !== -1) s += 2;
      if (tool.tags && tool.tags.join(" ").toLowerCase().indexOf(w) !== -1) s += 3;
    });
    return s;
  }

  function initials(name) {
    return name.split(/\s+/).slice(0,2).map(function(w){ return w[0]; }).join("").toUpperCase();
  }

  function buildCard(tool, query) {
    var color = CAT_COLORS[tool.category] || { bg: "var(--accent-soft)", color: "var(--accent)" };
    var label = CAT_LABELS[tool.category] || tool.category;
    var domain = tool.domain || "";
    var logoUrl = domain ? LOGO_BASE + domain : "";

    var tagsHtml = "";
    if (tool.tags && tool.tags.length) {
      tagsHtml = tool.tags.slice(0, 5).map(function(t) {
        return '<span class="dir-tag">' + escapeHtml(t) + '</span>';
      }).join("");
    }

    var logoHtml = "";
    if (logoUrl) {
      logoHtml = '<img class="dir-logo" src="' + logoUrl + '" alt="' + escapeHtml(tool.name) + ' logo" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">' +
        '<div class="dir-logo-fallback" style="display:none;">' + initials(tool.name) + '</div>';
    } else {
      logoHtml = '<div class="dir-logo-fallback">' + initials(tool.name) + '</div>';
    }

    var nameHtml = highlight(tool.name, query);
    var descHtml = highlight(tool.description, query);

    var card = document.createElement("a");
    card.className = "dir-card";
    card.href = tool.website || "#";
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.setAttribute("data-cat", tool.category);
    card.innerHTML =
      '<div class="dir-card-header">' +
        logoHtml +
        '<div class="dir-card-title-group">' +
          '<div class="dir-card-name">' + nameHtml + '</div>' +
          '<div class="dir-card-hq">' + escapeHtml(tool.hq || "") + '</div>' +
        '</div>' +
      '</div>' +
      '<span class="dir-cat-badge" style="background:' + color.bg + ';color:' + color.color + ';">' +
        (CAT_ICONS[tool.category] ? CAT_ICONS[tool.category] + ' ' : '') + escapeHtml(label) +
      '</span>' +
      '<p class="dir-card-desc">' + descHtml + '</p>' +
      '<div class="dir-card-meta">' + tagsHtml + '</div>' +
      '<div class="dir-card-footer">' +
        '<span class="dir-card-link">Visit site →</span>' +
        (tool.founded ? '<span class="dir-founded">Est. ' + tool.founded + '</span>' : '') +
      '</div>';
    return card;
  }

  function render() {
    var q = currentQuery.trim().toLowerCase();
    var filtered = tools.filter(function(t) {
      if (currentCat !== "all" && t.category !== currentCat) return false;
      if (!q) return true;
      return score(t, q) > 0;
    });

    filtered.sort(function(a, b) {
      if (currentSort === "founded") {
        return (a.founded || 9999) - (b.founded || 9999);
      }
      return (a.name || "").localeCompare(b.name || "");
    });

    grid.innerHTML = "";

    if (filtered.length === 0) {
      var empty = document.createElement("div");
      empty.className = "dir-empty";
      empty.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
        '<p>No tools found for "<strong>' + escapeHtml(currentQuery) + '</strong>".<br>Try a different search or category.</p>';
      grid.appendChild(empty);
    } else {
      var frag = document.createDocumentFragment();
      filtered.forEach(function(t) { frag.appendChild(buildCard(t, q)); });
      grid.appendChild(frag);
    }

    var total = tools.length;
    var catLabel = currentCat === "all" ? "all categories" : (CAT_LABELS[currentCat] || currentCat);
    if (q) {
      status.innerHTML = 'Showing <strong>' + filtered.length + '</strong> of ' + total + ' tools matching "<strong>' + escapeHtml(currentQuery) + '</strong>"';
    } else if (currentCat !== "all") {
      status.innerHTML = 'Showing <strong>' + filtered.length + '</strong> ' + catLabel + ' tools';
    } else {
      status.innerHTML = '<strong>' + filtered.length + '</strong> tools in the directory';
    }
  }

  search.addEventListener("input", function() {
    currentQuery = search.value;
    render();
  });

  sortSel.addEventListener("change", function() {
    currentSort = sortSel.value;
    render();
  });

  catBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      catBtns.forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
      currentCat = btn.getAttribute("data-cat");
      render();
    });
  });

  render();
})();
</script>
