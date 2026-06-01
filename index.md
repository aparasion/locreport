---
layout: default
title: "Localization & Translation Industry News"
nav: true
nav_order: 1
---

<!-- ── Hero: Split Layout ──────────────────────────────────── -->
<section class="hero hero--split" id="hero-section">
  <div class="hero-bg" aria-hidden="true">
    <span class="hero-orb hero-orb--1"></span>
    <span class="hero-orb hero-orb--2"></span>
    <span class="hero-orb hero-orb--3"></span>
  </div>
  <div class="hero-split container">
    <div class="hero-split__left">
      <span class="hero-eyebrow">
        <svg class="hero-eyebrow-icon" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="22" height="22" rx="6" fill="url(#hg)"/><text x="11" y="16" text-anchor="middle" font-size="13" font-family="system-ui,sans-serif" fill="#fff">L</text><defs><linearGradient id="hg" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#3D5AFE"/><stop offset="1" stop-color="#06B6D4"/></linearGradient></defs></svg>
        Language services intelligence
      </span>
      <h1>The pulse of the language services industry</h1>
      <p class="hero-subtitle">Daily coverage of translation, localization, and AI &mdash; curated, analyzed, and tracked through the signals that matter.</p>
      <div class="hero-actions">
        <a href="/all-articles/" class="btn btn--hero-articles">Browse articles</a>
        <a href="/intelligence/" class="btn btn--hero-intel">Intelligence Dashboard</a>
        <a href="/research/" class="btn btn--hero-research">Language Science</a>
      </div>
    </div>
    <div class="hero-split__right" aria-label="Live signal pulse">
      <div class="hero-intel-panel">
        <div class="hero-intel-panel__head">
          <span class="hero-intel-panel__label">Signal Pulse</span>
          <span class="live-indicator"><span class="live-dot" aria-hidden="true"></span>Live</span>
        </div>
        {% for signal in site.data.signals limit:4 %}
        <a href="/intelligence/signals/{{ signal.id }}/" class="hero-signal-row">
          <span class="hero-signal-status hero-signal-status--{{ signal.current_status }}" title="{{ signal.current_status }}" aria-label="{{ signal.current_status }}"></span>
          <span class="hero-signal-title">{{ signal.title | truncate: 62 }}</span>
          <span class="hero-signal-cat hero-signal-cat--{{ signal.category }}">{{ signal.category }}</span>
        </a>
        {% endfor %}
        <a href="/intelligence/" class="hero-intel-panel__footer">View all {{ site.data.signals.size }} signals &rarr;</a>
      </div>
    </div>
  </div>
</section>

{% include sources-bar.html %}

<!-- ── Collect publication days ──────────────────────────── -->
{% assign day_count = 0 %}
{% assign current_day = "" %}
{% assign day1 = "" %}
{% assign day2 = "" %}
{% assign day3 = "" %}

{% for post in site.posts %}
  {% if post.article_type == "theory" %}{% continue %}{% endif %}
  {% assign post_day = post.date | date: "%Y-%m-%d" %}
  {% if post_day != current_day %}
    {% assign current_day = post_day %}
    {% assign day_count = day_count | plus: 1 %}
    {% if day_count == 1 %}{% assign day1 = post_day %}
    {% elsif day_count == 2 %}{% assign day2 = post_day %}
    {% elsif day_count == 3 %}{% assign day3 = post_day %}
    {% endif %}
  {% endif %}
  {% if day_count > 3 %}{% break %}{% endif %}
{% endfor %}

<!-- ── Home Layout: Main + Sidebar ───────────────────────── -->
<div class="home-layout container">
  <main class="home-main">

    <!-- Day 1 -->
    {% assign day1_first = true %}
    <section class="day-section">
      <h2 class="day-header">{{ day1 | date: "%B %d, %Y" }}</h2>
      <div class="article-list reveal-stagger">

      {% for post in site.posts %}
        {% if post.article_type == "theory" %}{% continue %}{% endif %}
        {% assign post_day = post.date | date: "%Y-%m-%d" %}
        {% if post_day != day1 %}{% continue %}{% endif %}
        {% assign card_category = "" %}
        {% if post.signal_ids and post.signal_ids.size > 0 %}
          {% assign first_sid = post.signal_ids[0] %}
          {% for signal in site.data.signals %}
            {% if signal.id == first_sid %}{% assign card_category = signal.category %}{% break %}{% endif %}
          {% endfor %}
        {% endif %}

        {% if day1_first %}
          {% assign day1_first = false %}
          <article class="article-row article-row--featured" data-category="{{ card_category }}" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
            <div class="article-row__header">
              <span class="article-row__badge article-row__badge--latest">Latest</span>
              {% if post.impact_score %}<span class="impact-badge impact-badge--{{ post.impact_score }}">{% if post.impact_score == 1 %}Routine{% elsif post.impact_score == 2 %}Notable{% elsif post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}</span>{% endif %}
              {% if card_category != "" %}<span class="article-row__category article-row__category--{{ card_category }}">{{ card_category }}</span>{% endif %}
              <span class="article-row__date">{{ post.date | date: "%B %d, %Y" }}</span>
            </div>
            <h2 class="article-row__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
            <p class="article-row__excerpt">{{ post.excerpt | strip_html | truncate: 220 }}</p>
            <div class="article-row__footer">
              {% if post.publisher %}<span class="article-row__publisher">{{ post.publisher }}</span>{% endif %}
              <a class="article-row__read-more" href="{{ post.url | relative_url }}">Read more &rarr;</a>
            </div>
          </article>
        {% else %}
          <article class="article-row" data-category="{{ card_category }}" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
            <div class="article-row__header">
              <span class="new-badge">NEW</span>
              {% if card_category != "" %}<span class="article-row__category article-row__category--{{ card_category }}">{{ card_category }}</span>{% endif %}
              <span class="article-row__date">{{ post.date | date: "%b %d, %Y" }}</span>
              {% if post.impact_score and post.impact_score >= 3 %}<span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}"></span>{% endif %}
            </div>
            <h2 class="article-row__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
            <p class="article-row__excerpt">{{ post.excerpt | strip_html | truncate: 170 }}</p>
            <div class="article-row__footer">
              {% if post.publisher %}<span class="article-row__publisher">{{ post.publisher }}</span>{% endif %}
              <a class="article-row__read-more" href="{{ post.url | relative_url }}">Read more &rarr;</a>
            </div>
          </article>
        {% endif %}
      {% endfor %}

      </div>
    </section>

    <!-- Day 2 -->
    {% if day2 != "" %}
    <section class="day-section">
      {% for post in site.posts %}
        {% if post.article_type == "theory" %}{% continue %}{% endif %}
        {% assign post_day = post.date | date: "%Y-%m-%d" %}
        {% if post_day == day2 %}{% assign day2_display = post.date | date: "%B %d, %Y" %}{% break %}{% endif %}
      {% endfor %}
      <h2 class="day-header">{{ day2_display }}</h2>
      <div class="article-list reveal-stagger">
        {% for post in site.posts %}
          {% if post.article_type == "theory" %}{% continue %}{% endif %}
          {% assign post_day = post.date | date: "%Y-%m-%d" %}
          {% if post_day != day2 %}{% continue %}{% endif %}
          {% assign card_category = "" %}
          {% if post.signal_ids and post.signal_ids.size > 0 %}
            {% assign first_sid = post.signal_ids[0] %}
            {% for signal in site.data.signals %}
              {% if signal.id == first_sid %}{% assign card_category = signal.category %}{% break %}{% endif %}
            {% endfor %}
          {% endif %}
          <article class="article-row" data-category="{{ card_category }}" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
            <div class="article-row__header">
              {% if card_category != "" %}<span class="article-row__category article-row__category--{{ card_category }}">{{ card_category }}</span>{% endif %}
              <span class="article-row__date">{{ post.date | date: "%b %d, %Y" }}</span>
              {% if post.impact_score and post.impact_score >= 3 %}<span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}"></span>{% endif %}
            </div>
            <h2 class="article-row__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
            <p class="article-row__excerpt">{{ post.excerpt | strip_html | truncate: 170 }}</p>
            <div class="article-row__footer">
              {% if post.publisher %}<span class="article-row__publisher">{{ post.publisher }}</span>{% endif %}
              <a class="article-row__read-more" href="{{ post.url | relative_url }}">Read more &rarr;</a>
            </div>
          </article>
        {% endfor %}
      </div>
    </section>
    {% endif %}

    <!-- Day 3 -->
    {% if day3 != "" %}
    <section class="day-section">
      {% for post in site.posts %}
        {% if post.article_type == "theory" %}{% continue %}{% endif %}
        {% assign post_day = post.date | date: "%Y-%m-%d" %}
        {% if post_day == day3 %}{% assign day3_display = post.date | date: "%B %d, %Y" %}{% break %}{% endif %}
      {% endfor %}
      <h2 class="day-header">{{ day3_display }}</h2>
      <div class="article-list reveal-stagger">
        {% for post in site.posts %}
          {% if post.article_type == "theory" %}{% continue %}{% endif %}
          {% assign post_day = post.date | date: "%Y-%m-%d" %}
          {% if post_day != day3 %}{% continue %}{% endif %}
          {% assign card_category = "" %}
          {% if post.signal_ids and post.signal_ids.size > 0 %}
            {% assign first_sid = post.signal_ids[0] %}
            {% for signal in site.data.signals %}
              {% if signal.id == first_sid %}{% assign card_category = signal.category %}{% break %}{% endif %}
            {% endfor %}
          {% endif %}
          <article class="article-row" data-category="{{ card_category }}" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
            <div class="article-row__header">
              {% if card_category != "" %}<span class="article-row__category article-row__category--{{ card_category }}">{{ card_category }}</span>{% endif %}
              <span class="article-row__date">{{ post.date | date: "%b %d, %Y" }}</span>
              {% if post.impact_score and post.impact_score >= 3 %}<span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}"></span>{% endif %}
            </div>
            <h2 class="article-row__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
            <p class="article-row__excerpt">{{ post.excerpt | strip_html | truncate: 170 }}</p>
            <div class="article-row__footer">
              {% if post.publisher %}<span class="article-row__publisher">{{ post.publisher }}</span>{% endif %}
              <a class="article-row__read-more" href="{{ post.url | relative_url }}">Read more &rarr;</a>
            </div>
          </article>
        {% endfor %}
      </div>
    </section>
    {% endif %}

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-inner">
        <h2>Ready to stay ahead?</h2>
        <p>Join localization professionals who rely on LocReport for daily industry intelligence.</p>
        <div class="cta-actions">
          <a href="/all-articles/" class="btn btn--primary btn--lg">View all articles</a>
          <a href="/intelligence/" class="btn btn--ghost btn--lg">Intelligence Dashboard</a>
        </div>
      </div>
    </section>

  </main><!-- /.home-main -->

  <aside class="home-sidebar" aria-label="Sidebar">

    <div class="sidebar-widget sidebar-widget--report">
      <p class="sidebar-report__eyebrow">Monthly Report · May 2026</p>
      <h3 class="sidebar-report__title">May 2026 Industry Intelligence</h3>
      <p class="sidebar-report__desc">Key themes, signals, and trends from 135 articles across the language services industry.</p>
      <a href="/2026/05/28/monthly-report-may-2026/" class="sidebar-report__link">Read the report &rarr;</a>
    </div>

    <div class="sidebar-widget sidebar-widget--report">
      <p class="sidebar-report__eyebrow">2026 Report</p>
      <h3 class="sidebar-report__title">Global Market Report</h3>
      <p class="sidebar-report__desc">Market sizing, AI-era growth drivers, and strategic forecasts.</p>
      <a href="/reports/2026-Annual-Global-Market-Report/" class="sidebar-report__link">Read the report &rarr;</a>
    </div>

    <div class="sidebar-widget">
      <h3 class="sidebar-widget__title">Active Signals</h3>
      {% for signal in site.data.signals limit:6 %}
      <a href="/intelligence/signals/{{ signal.id }}/" class="sidebar-signal">
        <span class="sidebar-signal__status sidebar-signal__status--{{ signal.current_status }}" aria-label="{{ signal.current_status }}"></span>
        <span class="sidebar-signal__title">{{ signal.title | truncate: 58 }}</span>
      </a>
      {% endfor %}
      <a href="/intelligence/" class="sidebar-widget__more">All {{ site.data.signals.size }} signals &rarr;</a>
    </div>

  </aside><!-- /.home-sidebar -->

</div><!-- /.home-layout -->
