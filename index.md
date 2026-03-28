---
layout: default
title: Home
nav: true
nav_order: 1
---

<section class="ai-hero">
  <div class="ai-hero-grid">
    <div class="ai-hero-content">
      <p class="ai-kicker">AI-first intelligence for localization leaders</p>
      <h1>Signal-rich coverage for teams scaling multilingual products.</h1>
      <p class="ai-hero-subtitle">LocReport tracks enterprise language strategy across AI, market shifts, quality operations, and governance. Built for operators who need clear context—not noise.</p>
      <div class="ai-hero-cta-row">
        <a href="{{ '/all-articles/' | relative_url }}" class="ai-cta-primary">Explore latest coverage</a>
        <a href="{{ '/intelligence/' | relative_url }}" class="ai-cta-secondary">Open intelligence dashboard</a>
      </div>
    </div>
    <aside class="ai-hero-panel" aria-label="LocReport summary panel">
      <img src="{{ '/assets/images/lrlogo.png' | relative_url }}" alt="LocReport" class="ai-hero-logo" loading="eager">
      <h2>Built for modern global content systems</h2>
      <ul>
        <li>Daily briefings on language AI and localization operations.</li>
        <li>Structured impact signals to prioritize what matters now.</li>
        <li>Text-first format optimized for fast executive reading.</li>
      </ul>
    </aside>
  </div>
</section>

{% include sources-bar.html %}

{% assign day_count = 0 %}
{% assign current_day = "" %}
{% assign day1 = "" %}
{% assign day2 = "" %}
{% assign day3 = "" %}

{% for post in site.posts %}
  {% assign post_day = post.date | date: "%Y-%m-%d" %}
  {% if post_day != current_day %}
    {% assign current_day = post_day %}
    {% assign day_count = day_count | plus: 1 %}
    {% if day_count == 1 %}
      {% assign day1 = post_day %}
    {% elsif day_count == 2 %}
      {% assign day2 = post_day %}
    {% elsif day_count == 3 %}
      {% assign day3 = post_day %}
    {% endif %}
  {% endif %}
  {% if day_count > 3 %}{% break %}{% endif %}
{% endfor %}

{% assign day1_first = true %}
<section class="day-section day-section--primary">
  <div class="day-section-heading-row">
    <h2 class="day-header">{{ site.posts.first.date | date: "%B %d, %Y" }}</h2>
    <p class="day-section-note">Most recent publishing cycle</p>
  </div>

  {% for post in site.posts %}
    {% assign post_day = post.date | date: "%Y-%m-%d" %}
    {% if post_day != day1 %}{% continue %}{% endif %}

    {% if day1_first %}
      {% assign day1_first = false %}
      <article class="featured-article reveal">
        <span class="featured-badge">Latest briefing</span>
        {% if post.impact_score %}
        <span class="impact-badge impact-badge--{{ post.impact_score }} impact-badge--inline">
          {% if post.impact_score == 1 %}Routine{% elsif post.impact_score == 2 %}Notable{% elsif post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}
        </span>
        {% endif %}
        <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}</p>
        <p>{{ post.excerpt | strip_html | truncate: 240 }}</p>
      </article>

      <div class="post-grid reveal-stagger">
    {% else %}
      <article class="post-card" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
        <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}<span class="new-badge">NEW</span>{% if post.impact_score and post.impact_score >= 3 %}<span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}"></span>{% endif %}</p>
        <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        <p>{{ post.excerpt | strip_html | truncate: 150 }}</p>
        <span class="read-more">Read intelligence note &rarr;</span>
      </article>
    {% endif %}
  {% endfor %}
      </div>
</section>

<section class="newsletter-banner">
  <div class="newsletter-banner-inner">
    <div class="newsletter-banner-text">
      <h3 class="newsletter-banner-title">Weekly AI + localization briefing</h3>
      <p class="newsletter-banner-desc">One concise Monday email covering market moves, operational lessons, and strategic watchpoints.</p>
    </div>
    <form action="https://buttondown.com/api/emails/embed-subscribe/locreport"
          method="post"
          class="newsletter-banner-form">
      <input type="email" name="email" required
             placeholder="you@example.com"
             class="newsletter-banner-input">
      <button type="submit" class="newsletter-banner-btn">Subscribe</button>
    </form>
  </div>
</section>

{% if day2 != "" %}
<section class="day-section">
  {% for post in site.posts %}
    {% assign post_day = post.date | date: "%Y-%m-%d" %}
    {% if post_day == day2 %}
      {% assign day2_display = post.date | date: "%B %d, %Y" %}
      {% break %}
    {% endif %}
  {% endfor %}
  <div class="day-section-heading-row">
    <h2 class="day-header">{{ day2_display }}</h2>
    <p class="day-section-note">Recent archive</p>
  </div>
  <div class="post-grid reveal-stagger">
    {% for post in site.posts %}
      {% assign post_day = post.date | date: "%Y-%m-%d" %}
      {% if post_day != day2 %}{% continue %}{% endif %}
      <article class="post-card" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
        <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}{% if post.impact_score and post.impact_score >= 3 %}<span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}"></span>{% endif %}</p>
        <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        <p>{{ post.excerpt | strip_html | truncate: 145 }}</p>
        <span class="read-more">Read intelligence note &rarr;</span>
      </article>
    {% endfor %}
  </div>
</section>
{% endif %}

{% if day3 != "" %}
<section class="day-section">
  {% for post in site.posts %}
    {% assign post_day = post.date | date: "%Y-%m-%d" %}
    {% if post_day == day3 %}
      {% assign day3_display = post.date | date: "%B %d, %Y" %}
      {% break %}
    {% endif %}
  {% endfor %}
  <div class="day-section-heading-row">
    <h2 class="day-header">{{ day3_display }}</h2>
    <p class="day-section-note">Recent archive</p>
  </div>
  <div class="post-grid reveal-stagger">
    {% for post in site.posts %}
      {% assign post_day = post.date | date: "%Y-%m-%d" %}
      {% if post_day != day3 %}{% continue %}{% endif %}
      <article class="post-card" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
        <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}{% if post.impact_score and post.impact_score >= 3 %}<span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}"></span>{% endif %}</p>
        <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        <p>{{ post.excerpt | strip_html | truncate: 145 }}</p>
        <span class="read-more">Read intelligence note &rarr;</span>
      </article>
    {% endfor %}
  </div>
</section>
{% endif %}

<div class="view-all-cta">
  <a href="/all-articles/" class="view-all-link">View all articles &rarr;</a>
  <br><br>
  <a href="/intelligence/" class="view-all-link view-all-link--secondary">Intelligence Dashboard &rarr;</a>
</div>
