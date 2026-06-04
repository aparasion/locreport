import { createClient } from '@/lib/supabase/server'
import { Article } from '@/lib/types'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Articles — LocReport',
  description: 'Browse all localization industry articles by topic — quality, operations, governance, market dynamics, and strategy.',
}

export const revalidate = 3600

// Topic signal/keyword maps (mirrored from Jekyll all-articles.md)
const QUALITY_SIGNALS = ['quality-gap-closure', 'measurable-quality-evaluation']
const QUALITY_KEYWORDS = ['mqm', 'mtpe', 'post-edit', 'linguistic quality', 'quality assurance', 'quality evaluation', 'lqa']

const OPS_SIGNALS = ['localization-operating-system', 'translation-memory-obsolescence', 'agentic-localization-workflows', 'multimodal-content-localization']
const OPS_KEYWORDS = ['translation memory', 'tms', 'cat tool', 'localization platform', 'dubbing', 'subtitl', 'agentic', 'ai agent']

const GOV_SIGNALS = ['governance-in-ai-workflows', 'regulatory-fragmentation']
const GOV_KEYWORDS = ['eu ai act', 'ai regulation', 'compliance requirement', 'language law', 'ai governance', 'guardrail']

const MARKET_SIGNALS = ['human-post-editing-contraction']
const MARKET_KEYWORDS = ['freelance translator', 'translator demand', 'post-editor', 'language services market', 'translation rates']

const STRATEGY_SIGNALS = ['localization-first-content-design']
const STRATEGY_KEYWORDS = ['internationalization', 'i18n', 'locale-aware', 'transcreation', 'localization-first']

const IMPACT_LABEL: Record<number, string> = { 2: 'Notable', 3: 'Significant', 4: 'Major', 5: 'Disruptive' }

function getTopics(article: Article): string[] {
  const signalIds = (article.signal_ids ?? []).map(s => s.toLowerCase())
  const text = `${article.title} ${article.excerpt ?? ''}`.toLowerCase()
  const topics: string[] = []

  const matches = (signals: string[], keywords: string[]) =>
    signals.some(s => signalIds.includes(s)) || keywords.some(k => text.includes(k))

  if (matches(QUALITY_SIGNALS, QUALITY_KEYWORDS)) topics.push('quality')
  if (matches(OPS_SIGNALS, OPS_KEYWORDS)) topics.push('operations')
  if (matches(GOV_SIGNALS, GOV_KEYWORDS)) topics.push('governance')
  if (matches(MARKET_SIGNALS, MARKET_KEYWORDS)) topics.push('market')
  if (matches(STRATEGY_SIGNALS, STRATEGY_KEYWORDS)) topics.push('strategy')

  return topics
}

export default async function AllArticlesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('*')
    .neq('article_type', 'theory')
    .order('published_at', { ascending: false })

  const articles = (data as Article[]) ?? []

  return (
    <>
      <section className="all-articles-hero">
        <h1>All articles</h1>
        <p className="all-articles-subtitle">{articles.length} articles across the localization intelligence archive.</p>
      </section>

      <section className="all-articles-filter-bar" id="filter-bar">
        <button className="filter-bar-toggle" id="filter-bar-toggle" aria-expanded="false" aria-controls="filter-bar-collapsible">
          <span className="filter-bar-toggle-left">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="filter-bar-toggle-label">Filters</span>
            <span className="filter-bar-toggle-badge" id="filter-bar-badge" style={{ display: 'none' }}></span>
          </span>
          <svg className="filter-bar-toggle-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="filter-bar-collapsible" id="filter-bar-collapsible">
          <div className="filter-bar-inner">
            <div className="filter-group">
              <label className="filter-label" htmlFor="topic-select">Topic</label>
              <select className="filter-select" id="topic-select" aria-label="Filter by topic">
                <option value="all">All topics</option>
                <option value="quality">Quality</option>
                <option value="operations">Operations</option>
                <option value="governance">Governance</option>
                <option value="market">Market</option>
                <option value="strategy">Strategy</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="impact-select">Impact</label>
              <select className="filter-select" id="impact-select" aria-label="Filter by impact">
                <option value="all">All levels</option>
                <option value="4">Major+</option>
                <option value="3">Significant+</option>
                <option value="2">Notable+</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="source-filter">Source</label>
              <select className="filter-select" id="source-filter" aria-label="Filter by source">
                <option value="all">All sources</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="date-from">From</label>
              <input type="date" className="filter-select filter-date" id="date-from" aria-label="From date" />
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="date-to">To</label>
              <input type="date" className="filter-select filter-date" id="date-to" aria-label="To date" />
            </div>
            <div className="filter-group filter-group--sort">
              <label className="filter-label" htmlFor="sort-select">Sort</label>
              <select className="filter-select" id="sort-select" aria-label="Sort articles">
                <option value="date">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="impact">Highest impact</option>
              </select>
            </div>
          </div>
          <div className="filter-status-row">
            <button className="filter-reset-btn" id="filter-reset">Clear all</button>
            <p className="filter-count" id="feed-count" aria-live="polite"></p>
          </div>
        </div>
      </section>

      <p className="theory-crosslink" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
        Looking for research articles? Visit <Link href="/research" style={{ color: 'var(--accent)', fontWeight: 600 }}>Language Science</Link>
      </p>

      <section className="all-articles-feed-section" id="articles-section">
        <div className="all-articles-feed" id="intel-article-feed">
          {articles.map(article => {
            const topics = getTopics(article)
            const dateObj = new Date(article.published_at)
            const dateDisplay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            const dateInt = dateObj.toISOString().slice(0, 10).replace(/-/g, '')
            const dateIso = dateObj.toISOString().slice(0, 10)

            return (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="article-card"
                data-title={article.title.toLowerCase()}
                data-impact={article.impact_score ?? 0}
                data-date={dateInt}
                data-date-iso={dateIso}
                data-topics={topics.join(' ')}
                data-source={(article.publisher ?? '').toLowerCase()}
                data-segments={(article.affected_segments ?? []).join('|')}
              >
                <div className="article-card-body">
                  <h3 className="article-card-title">{article.title}</h3>
                  {article.excerpt && (
                    <p className="article-card-excerpt">
                      {article.excerpt.length > 160 ? article.excerpt.slice(0, 160) + '…' : article.excerpt}
                    </p>
                  )}
                  {topics.length > 0 && (
                    <div className="article-card-tags">
                      {topics.map(t => (
                        <span key={t} className={`article-tag article-tag--${t}`}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="article-card-meta">
                  <time className="article-card-date">{dateDisplay}</time>
                  {article.impact_score && article.impact_score >= 2 && (
                    <span className={`article-card-impact article-card-impact--${article.impact_score}`}>
                      {IMPACT_LABEL[article.impact_score]}
                    </span>
                  )}
                  {article.publisher && (
                    <span className="article-card-source">{article.publisher}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
        <div className="autoload-loader" id="feed-loader">Loading more…</div>
        <div className="autoload-sentinel" id="feed-sentinel"></div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
document.addEventListener("DOMContentLoaded", function () {
  var allItems = Array.from(document.querySelectorAll("#intel-article-feed .article-card"));
  var feedLoader = document.getElementById("feed-loader");
  var feedSentinel = document.getElementById("feed-sentinel");
  var feedCount = document.getElementById("feed-count");
  var topicSelect = document.getElementById("topic-select");
  var impactSelect = document.getElementById("impact-select");
  var dateFrom = document.getElementById("date-from");
  var dateTo = document.getElementById("date-to");
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
  var observer = null;
  var currentItems = [];
  var loadedCount = 0;

  function updateMobileBadge() {
    var count = 0;
    if (topicSelect.value !== "all") count++;
    if (impactSelect.value !== "all") count++;
    if (dateFrom.value !== "") count++;
    if (dateTo.value !== "") count++;
    if (sourceFilter.value !== "all") count++;
    if (filterBarBadge) {
      filterBarBadge.textContent = count > 0 ? count : "";
      filterBarBadge.style.display = count > 0 ? "" : "none";
    }
  }

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

  function dateToInt(dateStr) {
    return parseInt(dateStr.replace(/-/g, ""), 10);
  }

  function getFiltered() {
    var sortBy = sortSelect.value;
    var source = sourceFilter.value;
    var activeTopic = topicSelect.value;
    var activeImpact = impactSelect.value;
    var fromInt = dateFrom.value ? dateToInt(dateFrom.value) : null;
    var toInt = dateTo.value ? dateToInt(dateTo.value) : null;

    var filtered = allItems.filter(function (item) {
      if (activeTopic !== "all") {
        var itemTopics = (item.getAttribute("data-topics") || "").trim().split(/\\s+/);
        if (itemTopics.indexOf(activeTopic) === -1) return false;
      }
      if (activeImpact !== "all") {
        var imp = parseInt(item.getAttribute("data-impact") || "0", 10);
        if (imp < parseInt(activeImpact, 10)) return false;
      }
      var itemDate = parseInt(item.getAttribute("data-date") || "0", 10);
      if (fromInt && itemDate < fromInt) return false;
      if (toInt && itemDate > toInt) return false;
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
    } else if (sortBy === "oldest") {
      filtered.sort(function (a, b) {
        return (a.getAttribute("data-date") || "").localeCompare(b.getAttribute("data-date") || "");
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
    var feed = document.getElementById("intel-article-feed");
    currentItems.forEach(function (item) { feed.appendChild(item); });
    loadedCount = showBatch(currentItems, 0);
    if (feedCount) {
      feedCount.textContent = currentItems.length === allItems.length
        ? currentItems.length + " articles"
        : currentItems.length + " of " + allItems.length + " articles";
    }
    updateMobileBadge();
    feedLoader.classList.remove("is-active");
    setupObserver();
  }

  topicSelect.addEventListener("change", function () { applyFilter(); });
  impactSelect.addEventListener("change", function () { applyFilter(); });
  dateFrom.addEventListener("change", function () { applyFilter(); });
  dateTo.addEventListener("change", function () { applyFilter(); });
  sourceFilter.addEventListener("change", function () { applyFilter(); });
  sortSelect.addEventListener("change", function () { applyFilter(); });

  resetBtn.addEventListener("click", function () {
    topicSelect.value = "all";
    impactSelect.value = "all";
    dateFrom.value = "";
    dateTo.value = "";
    sourceFilter.value = "all";
    sortSelect.value = "date";
    applyFilter();
  });

  var hash = window.location.hash.replace("#", "");
  if (["quality", "operations", "governance", "market", "strategy"].indexOf(hash) !== -1) {
    topicSelect.value = hash;
  }

  applyFilter();
});
`}} />
    </>
  )
}
