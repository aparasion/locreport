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
  <div class="events-filters">
    <div class="events-filter-group">
      <button class="events-filter-btn" data-category="conference">Conferences</button>
      <button class="events-filter-btn" data-category="summit">Summits</button>
      <button class="events-filter-btn" data-category="forum">Forums</button>
    </div>
  </div>
</div>

<div class="events-timeline" id="events-timeline">
  {% assign today = site.time | date: "%Y-%m-%d" %}
  {% assign upcoming_events = site.data.events | where_exp: "event", "event.end_date >= today" | sort: "start_date" %}
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
             data-tags="{{ event.tags | join: ' ' }}">
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
  var timeline   = document.getElementById("events-timeline");
  var emptyState = document.getElementById("events-empty");
  var filterBtns = document.querySelectorAll(".events-filter-btn");
  var activeCategory = "all";

  function applyFilters() {
    var cards = timeline.querySelectorAll(".event-card");
    var visible = 0;

    cards.forEach(function (card) {
      var categoryMatch = activeCategory === "all" || card.getAttribute("data-category") === activeCategory;
      var show = categoryMatch;
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });

    // Show/hide month headings that have no visible cards
    timeline.querySelectorAll(".events-month-group").forEach(function (group) {
      var visibleInGroup = Array.from(group.querySelectorAll(".event-card")).some(function (c) {
        return c.style.display !== "none";
      });
      group.style.display = visibleInGroup ? "" : "none";
    });

    // Show/hide year headings that have no visible months
    timeline.querySelectorAll(".events-year-group").forEach(function (group) {
      var visibleInYear = Array.from(group.querySelectorAll(".events-month-group")).some(function (m) {
        return m.style.display !== "none";
      });
      group.style.display = visibleInYear ? "" : "none";
    });

    emptyState.style.display = visible === 0 ? "" : "none";
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var categoryVal = btn.getAttribute("data-category");

      if (categoryVal !== null) {
        // Category group — toggle
        var isActive = btn.classList.contains("active");
        document.querySelectorAll("[data-category]").forEach(function (b) { b.classList.remove("active"); });
        if (isActive) {
          activeCategory = "all";
        } else {
          btn.classList.add("active");
          activeCategory = categoryVal;
        }
      }

      applyFilters();
    });
  });
})();
</script>
