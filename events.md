---
layout: page
title: Events
permalink: /events/
description: "Calendar of key language industry events — conferences, summits, and forums for localization, translation, and language technology professionals."
nav: true
nav_order: 4
no_share: true
---

A curated calendar of upcoming conferences, summits, and forums across the language services and localization industry. Filter by category to find what's relevant to you.

<div class="events-page-header">
  <div class="events-controls">
    <div class="events-filter-group">
      <button class="events-filter-btn" data-category="conference">Conferences</button>
      <button class="events-filter-btn" data-category="summit">Summits</button>
      <button class="events-filter-btn" data-category="forum">Forums</button>
    </div>
    <div class="events-view-toggle" role="group" aria-label="View mode">
      <button class="events-view-btn active" data-view="list" title="List view">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        List
      </button>
      <button class="events-view-btn" data-view="calendar" title="Calendar view">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Calendar
      </button>
    </div>
  </div>
</div>

<!-- Calendar view (rendered by JS) -->
<div class="events-calendar" id="events-calendar" style="display:none;" aria-live="polite">
  <div class="cal-nav">
    <button class="cal-nav-btn" id="cal-prev" aria-label="Previous month">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <span class="cal-month-label" id="cal-month-label"></span>
    <button class="cal-nav-btn" id="cal-next" aria-label="Next month">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  </div>

  <div class="cal-grid" id="cal-grid"></div>

  <div class="cal-legend">
    <span class="cal-legend-item"><span class="cal-legend-dot cal-dot--conference"></span>Conference</span>
    <span class="cal-legend-item"><span class="cal-legend-dot cal-dot--summit"></span>Summit</span>
    <span class="cal-legend-item"><span class="cal-legend-dot cal-dot--forum"></span>Forum</span>
    <span class="cal-legend-item"><span class="cal-legend-dot cal-dot--webinar"></span>Webinar</span>
    <span class="cal-legend-item"><span class="cal-legend-dot cal-dot--workshop"></span>Workshop</span>
  </div>

  <!-- Event detail popup -->
  <div class="cal-popup" id="cal-popup" style="display:none;" role="dialog" aria-modal="true">
    <button class="cal-popup__close" id="cal-popup-close" aria-label="Close">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <span class="cal-popup__badge" id="cal-popup-badge"></span>
    <h4 class="cal-popup__title" id="cal-popup-title"></h4>
    <p class="cal-popup__organizer" id="cal-popup-organizer"></p>
    <div class="cal-popup__details" id="cal-popup-details"></div>
    <a class="cal-popup__link" id="cal-popup-link" href="#" target="_blank" rel="noopener noreferrer">
      Visit event site
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
    </a>
  </div>
</div>

<!-- Inject events data for calendar JS -->
<script>
var EVENTS_DATA = {{ site.data.events | jsonify }};
</script>

<div class="events-timeline" id="events-timeline">
  {% assign today = site.time | date: "%Y-%m-%d" %}
  {% assign _all_events = site.data.events | default: "" %}
  {% if _all_events == "" %}{% assign _all_events = "" | split: "" %}{% endif %}
  {% assign upcoming_events = _all_events | where_exp: "event", "event.end_date >= today" | sort: "start_date" %}
  {% assign current_year = "" %}
  {% assign current_month = "" %}

  {% if upcoming_events.size > 0 %}
  {% for event in upcoming_events %}
    {% assign event_year = event.start_date | slice: 0, 4 %}
    {% assign event_month_num = event.start_date | slice: 5, 2 %}

    {% if event_year != current_year %}
      {% if current_year != "" %}</div></div>{% endif %}
      {% assign current_year = event_year %}
      {% assign current_month = "" %}
      <div class="events-year-group" data-year="{{ event_year }}">
      <h2 class="events-year-heading">{{ event_year }}</h2>
    {% endif %}

    {% assign month_names = "January,February,March,April,May,June,July,August,September,October,November,December" | split: "," %}
    {% assign month_index = event_month_num | minus: 1 %}
    {% assign month_name = month_names[month_index] %}

    {% if event_month_num != current_month %}
      {% if current_month != "" %}</div>{% endif %}
      {% assign current_month = event_month_num %}
      <div class="events-month-group" data-month="{{ event_month_num }}">
      <h3 class="events-month-heading">{{ month_name }}</h3>
    {% endif %}

    {% if event.start_date <= today %}
      {% assign event_status = "ongoing" %}
    {% else %}
      {% assign event_status = "upcoming" %}
    {% endif %}

    <article class="event-card reveal"
             data-status="{{ event_status }}"
             data-category="{{ event.category }}"
             data-tags="{{ event.tags | join: ' ' }}"
             id="event-card-{{ event.id }}">
      <div class="event-card__date-badge">
        <span class="event-card__day">{{ event.start_date | date: "%-d" }}</span>
        <span class="event-card__month-abbr">{{ event.start_date | date: "%b" }}</span>
      </div>
      <div class="event-card__body">
        <div class="event-card__meta-row">
          <span class="event-status-badge event-status-badge--{{ event_status }}">
            {% if event_status == "upcoming" %}Upcoming
            {% elsif event_status == "ongoing" %}Happening now
            {% endif %}
          </span>
          <span class="event-format-badge event-format-badge--{{ event.format }}">{{ event.format }}</span>
          <span class="event-category-label">{{ event.category }}</span>
        </div>

        <h4 class="event-card__title">
          {% if event.url %}
            <a href="{{ event.url }}" target="_blank" rel="noopener noreferrer">{{ event.name }}</a>
          {% else %}
            {{ event.name }}
          {% endif %}
        </h4>

        <p class="event-card__organizer">{{ event.organizer }}</p>

        <div class="event-card__details">
          <span class="event-card__detail">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {{ event.start_date | date: "%b %-d" }}{% if event.end_date and event.end_date != event.start_date %} – {{ event.end_date | date: "%-d, %Y" }}{% else %}, {{ event.start_date | date: "%Y" }}{% endif %}
          </span>
          <span class="event-card__detail">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ event.location }}
          </span>
        </div>

        <p class="event-card__description">{{ event.description }}</p>

        <div class="event-card__tags">
          {% for tag in event.tags %}
            <span class="event-tag">{{ tag | replace: "-", " " }}</span>
          {% endfor %}
        </div>

        {% if event.url %}
        <a class="event-card__cta" href="{{ event.url }}" target="_blank" rel="noopener noreferrer">
          Visit event site
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </a>
        {% endif %}
      </div>
    </article>

  {% endfor %}
  </div></div>
  {% endif %}
</div>

<div class="events-empty-state" id="events-empty"{% if upcoming_events.size > 0 %} style="display:none;"{% endif %}>
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  <p>No events match this filter.</p>
</div>

<div class="events-submit-cta">
  <p>Know of an event we should add? <a href="/contact/">Let us know.</a></p>
</div>

<script>
(function () {
  var timeline    = document.getElementById("events-timeline");
  var calEl       = document.getElementById("events-calendar");
  var calGrid     = document.getElementById("cal-grid");
  var calLabel    = document.getElementById("cal-month-label");
  var calPrev     = document.getElementById("cal-prev");
  var calNext     = document.getElementById("cal-next");
  var popup       = document.getElementById("cal-popup");
  var popupClose  = document.getElementById("cal-popup-close");
  var emptyState  = document.getElementById("events-empty");
  var filterBtns  = document.querySelectorAll(".events-filter-btn");
  var viewBtns    = document.querySelectorAll(".events-view-btn");

  var activeCategory = "all";
  var activeView = "list";

  var todayDate = new Date();
  var calYear  = todayDate.getFullYear();
  var calMonth = todayDate.getMonth();

  var MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
  var DAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  // ── View toggle ───────────────────────────────────────────
  viewBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeView = btn.getAttribute("data-view");
      viewBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      if (activeView === "calendar") {
        calEl.style.display = "";
        timeline.style.display = "none";
        emptyState.style.display = "none";
        renderCalendar();
      } else {
        calEl.style.display = "none";
        timeline.style.display = "";
        applyFilters();
      }
    });
  });

  // ── Filter buttons ────────────────────────────────────────
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-category");
      var wasActive = btn.classList.contains("active");
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      activeCategory = wasActive ? "all" : cat;
      if (!wasActive) btn.classList.add("active");
      if (activeView === "calendar") {
        renderCalendar();
      } else {
        applyFilters();
      }
    });
  });

  // ── Calendar month navigation ─────────────────────────────
  calPrev.addEventListener("click", function () {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  calNext.addEventListener("click", function () {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  // ── Popup close ───────────────────────────────────────────
  popupClose.addEventListener("click", function () {
    popup.style.display = "none";
  });
  document.addEventListener("click", function (e) {
    if (popup.style.display !== "none"
        && !popup.contains(e.target)
        && !e.target.classList.contains("cal-pill")) {
      popup.style.display = "none";
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") popup.style.display = "none";
  });

  // ── Helpers ───────────────────────────────────────────────
  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function escHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtDate(dateStr) {
    if (!dateStr) return "";
    var p = dateStr.split("-");
    return MONTHS[parseInt(p[1], 10) - 1].slice(0, 3) + " " + parseInt(p[2], 10);
  }

  function findById(id) {
    var evs = EVENTS_DATA || [];
    for (var i = 0; i < evs.length; i++) {
      if (evs[i].id === id) return evs[i];
    }
    return null;
  }

  // ── Calendar renderer ─────────────────────────────────────
  function renderCalendar() {
    popup.style.display = "none";
    calLabel.textContent = MONTHS[calMonth] + " " + calYear;

    var daysInMonth  = new Date(calYear, calMonth + 1, 0).getDate();
    var daysInPrev   = new Date(calYear, calMonth, 0).getDate();
    var firstDowRaw  = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
    var firstDowMon  = (firstDowRaw + 6) % 7; // Mon=0 … Sun=6

    var mStr  = calYear + "-" + pad(calMonth + 1);
    var mEnd  = mStr + "-" + pad(daysInMonth);
    var mStart= mStr + "-01";

    // Filter events overlapping this month
    var evs = (EVENTS_DATA || []).filter(function (ev) {
      if (activeCategory !== "all" && ev.category !== activeCategory) return false;
      var s = ev.start_date, e = ev.end_date || ev.start_date;
      return s <= mEnd && e >= mStart;
    });

    // Build date → events map
    var dayMap = {};
    evs.forEach(function (ev) {
      var cur = new Date(ev.start_date + "T00:00:00");
      var end = new Date((ev.end_date || ev.start_date) + "T00:00:00");
      while (cur <= end) {
        var key = cur.getFullYear() + "-" + pad(cur.getMonth() + 1) + "-" + pad(cur.getDate());
        if (!dayMap[key]) dayMap[key] = [];
        dayMap[key].push(ev);
        cur.setDate(cur.getDate() + 1);
      }
    });

    var todayStr = todayDate.getFullYear() + "-" + pad(todayDate.getMonth() + 1) + "-" + pad(todayDate.getDate());

    var html = "";

    // Header row
    DAYS_SHORT.forEach(function (d) {
      html += '<div class="cal-header-cell">' + d + '</div>';
    });

    // Pre-month padding
    for (var i = 0; i < firstDowMon; i++) {
      html += '<div class="cal-day cal-day--other-month"><span class="cal-day__num">' + (daysInPrev - firstDowMon + 1 + i) + '</span></div>';
    }

    // Days in month
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr  = mStr + "-" + pad(d);
      var isToday  = dateStr === todayStr;
      var dayEvs   = dayMap[dateStr];

      html += '<div class="cal-day' + (isToday ? ' cal-day--today' : '') + '">';
      html += '<span class="cal-day__num' + (isToday ? ' cal-day__num--today' : '') + '">' + d + '</span>';

      if (dayEvs && dayEvs.length) {
        html += '<div class="cal-day__events">';
        dayEvs.forEach(function (ev) {
          var cat  = ev.category || "conference";
          var isCont = ev.start_date !== dateStr;
          html += '<button class="cal-pill cal-pill--' + cat + (isCont ? ' cal-pill--continue' : '') + '"'
               +  ' data-event-id="' + escHtml(ev.id) + '"'
               +  ' title="' + escHtml(ev.name) + '">'
               +  escHtml(ev.name)
               + '</button>';
        });
        html += '</div>';
      }

      html += '</div>';
    }

    // Post-month padding
    var filled = firstDowMon + daysInMonth;
    var tail   = (7 - (filled % 7)) % 7;
    for (var j = 1; j <= tail; j++) {
      html += '<div class="cal-day cal-day--other-month"><span class="cal-day__num">' + j + '</span></div>';
    }

    calGrid.innerHTML = html;

    // Attach pill handlers
    calGrid.querySelectorAll(".cal-pill").forEach(function (pill) {
      pill.addEventListener("click", function (e) {
        e.stopPropagation();
        var ev = findById(pill.getAttribute("data-event-id"));
        if (ev) showPopup(pill, ev);
      });
    });
  }

  // ── Popup ─────────────────────────────────────────────────
  function showPopup(anchorEl, ev) {
    var badge = document.getElementById("cal-popup-badge");
    badge.textContent = ev.category || "";
    badge.className   = "cal-popup__badge cal-pill--" + (ev.category || "conference");

    document.getElementById("cal-popup-title").textContent     = ev.name || "";
    document.getElementById("cal-popup-organizer").textContent = ev.organizer || "";

    var startFmt = fmtDate(ev.start_date);
    var endFmt   = (ev.end_date && ev.end_date !== ev.start_date) ? " – " + fmtDate(ev.end_date) : "";
    var loc      = ev.location || "";
    document.getElementById("cal-popup-details").innerHTML =
      '<span><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> '
      + escHtml(startFmt + endFmt) + ', ' + calYear + '</span>'
      + (loc ? '<span><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + escHtml(loc) + '</span>' : '');

    var link = document.getElementById("cal-popup-link");
    if (ev.url) {
      link.href         = ev.url;
      link.style.display = "";
    } else {
      link.style.display = "none";
    }

    // Show & position
    popup.style.display = "";

    var pillRect = anchorEl.getBoundingClientRect();
    var calRect  = calEl.getBoundingClientRect();
    var rawLeft  = pillRect.left - calRect.left;
    var rawTop   = pillRect.bottom - calRect.top + 6;
    var maxLeft  = calEl.offsetWidth - 244;

    popup.style.left = Math.max(0, Math.min(rawLeft, maxLeft)) + "px";
    popup.style.top  = rawTop + "px";
  }

  // ── List view filter ──────────────────────────────────────
  function applyFilters() {
    var cards = timeline.querySelectorAll(".event-card");
    var visible = 0;

    cards.forEach(function (card) {
      var show = activeCategory === "all" || card.getAttribute("data-category") === activeCategory;
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });

    timeline.querySelectorAll(".events-month-group").forEach(function (group) {
      var any = Array.from(group.querySelectorAll(".event-card")).some(function (c) {
        return c.style.display !== "none";
      });
      group.style.display = any ? "" : "none";
    });

    timeline.querySelectorAll(".events-year-group").forEach(function (group) {
      var any = Array.from(group.querySelectorAll(".events-month-group")).some(function (m) {
        return m.style.display !== "none";
      });
      group.style.display = any ? "" : "none";
    });

    emptyState.style.display = visible === 0 ? "" : "none";
  }
})();
</script>
