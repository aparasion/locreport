---
layout: default
title: Home
nav: true
nav_order: 1
---

<section class="hero">
  <div class="hero-content">
    <div class="hero-eyebrow">
      <img src="{{ '/assets/images/icon.png' | relative_url }}" alt="" class="hero-eyebrow-icon">
      <span>Industry Intelligence Platform</span>
    </div>
    <h1>The pulse of the language<br>services industry</h1>
    <p class="hero-subtitle">Daily coverage of translation, localization, and AI — curated, analyzed, and tracked through the signals that matter.</p>
    <div class="hero-actions">
      <a href="/all-articles/" class="btn btn--primary">Browse articles</a>
      <a href="/intelligence/" class="btn btn--secondary">Intelligence Dashboard</a>
    </div>
  </div>
</section>

{% include sources-bar.html %}

<!-- Features Grid -->
<section class="features-section">
  <div class="features-header">
    <h2 class="section-label">Why LocReport</h2>
    <p class="section-title">Built for localization professionals</p>
    <p class="section-desc">Everything you need to stay ahead of industry shifts — in one place.</p>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      </div>
      <h3>Daily Coverage</h3>
      <p>Curated news from 15+ industry sources, published every day with context that matters.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      </div>
      <h3>Signal Tracking</h3>
      <p>Articles are mapped to industry signals so you can see trends forming across the landscape.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h3>Impact Scoring</h3>
      <p>Every article is assessed for business impact — from routine updates to disruptive shifts.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <h3>Segment Targeting</h3>
      <p>Filter by role — LSP, Technology Provider, Enterprise Client, or Brand/Marketplace.</p>
    </div>
  </div>
</section>

<!-- Latest Articles -->
{% comment %}
  Collect the last 3 unique days that have published content.
  Posts are already sorted newest-first by Jekyll.
{% endcomment %}
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

{% comment %} Day 1: Most recent — featured first article + grid of remaining {% endcomment %}
{% assign day1_first = true %}
<section class="day-section">
  <h2 class="day-header">{{ site.posts.first.date | date: "%B %d, %Y" }}</h2>

  {% for post in site.posts %}
    {% assign post_day = post.date | date: "%Y-%m-%d" %}
    {% if post_day != day1 %}{% continue %}{% endif %}

    {% if day1_first %}
      {% assign day1_first = false %}
      <article class="featured-article reveal">
        <span class="featured-badge">Latest</span>
        {% if post.impact_score %}
        <span class="impact-badge impact-badge--{{ post.impact_score }} impact-badge--inline">
          {% if post.impact_score == 1 %}Routine{% elsif post.impact_score == 2 %}Notable{% elsif post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}
        </span>
        {% endif %}
        <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}</p>
        <p>{{ post.excerpt | strip_html | truncate: 200 }}</p>
      </article>

      <div class="post-grid reveal-stagger">
    {% else %}
      <article class="post-card" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
        <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}<span class="new-badge">NEW</span>{% if post.impact_score and post.impact_score >= 3 %}<span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}"></span>{% endif %}</p>
        <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        <p>{{ post.excerpt | strip_html | truncate: 140 }}</p>
        <span class="read-more">Read more &rarr;</span>
      </article>
    {% endif %}
  {% endfor %}
      </div>
</section>

{% comment %} Newsletter signup banner {% endcomment %}
<section class="newsletter-banner">
  <div class="newsletter-banner-inner">
    <div class="newsletter-banner-text">
      <h3 class="newsletter-banner-title">Stay in the loop</h3>
      <p class="newsletter-banner-desc">Weekly digest of localization news and signal shifts — every Monday.</p>
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

{% comment %} Day 2 {% endcomment %}
{% if day2 != "" %}
<section class="day-section">
  {% for post in site.posts %}
    {% assign post_day = post.date | date: "%Y-%m-%d" %}
    {% if post_day == day2 %}
      {% assign day2_display = post.date | date: "%B %d, %Y" %}
      {% break %}
    {% endif %}
  {% endfor %}
  <h2 class="day-header">{{ day2_display }}</h2>
  <div class="post-grid reveal-stagger">
    {% for post in site.posts %}
      {% assign post_day = post.date | date: "%Y-%m-%d" %}
      {% if post_day != day2 %}{% continue %}{% endif %}
      <article class="post-card" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
        <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}{% if post.impact_score and post.impact_score >= 3 %}<span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}"></span>{% endif %}</p>
        <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        <p>{{ post.excerpt | strip_html | truncate: 140 }}</p>
        <span class="read-more">Read more &rarr;</span>
      </article>
    {% endfor %}
  </div>
</section>
{% endif %}

{% comment %} Day 3 {% endcomment %}
{% if day3 != "" %}
<section class="day-section">
  {% for post in site.posts %}
    {% assign post_day = post.date | date: "%Y-%m-%d" %}
    {% if post_day == day3 %}
      {% assign day3_display = post.date | date: "%B %d, %Y" %}
      {% break %}
    {% endif %}
  {% endfor %}
  <h2 class="day-header">{{ day3_display }}</h2>
  <div class="post-grid reveal-stagger">
    {% for post in site.posts %}
      {% assign post_day = post.date | date: "%Y-%m-%d" %}
      {% if post_day != day3 %}{% continue %}{% endif %}
      <article class="post-card" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
        <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}{% if post.impact_score and post.impact_score >= 3 %}<span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}"></span>{% endif %}</p>
        <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        <p>{{ post.excerpt | strip_html | truncate: 140 }}</p>
        <span class="read-more">Read more &rarr;</span>
      </article>
    {% endfor %}
  </div>
</section>
{% endif %}

<!-- Capabilities Section -->
<section class="capabilities-section">
  <div class="capabilities-header">
    <h2 class="section-label">Capabilities</h2>
    <p class="section-title">Intelligence at every layer</p>
  </div>
  <div class="capabilities-grid">
    <div class="capability-card">
      <span class="capability-number">01</span>
      <h3>Topic Streams</h3>
      <p>Coverage organized into five strategic pillars — Quality, Operations, Governance, Market, and Strategy — so you can focus on what you care about.</p>
      <a href="/topics/" class="capability-link">Explore topics &rarr;</a>
    </div>
    <div class="capability-card">
      <span class="capability-number">02</span>
      <h3>Intelligence Dashboard</h3>
      <p>Visual overview of signal health, impact distribution, and segment-specific trends across the entire article corpus.</p>
      <a href="/intelligence/" class="capability-link">View dashboard &rarr;</a>
    </div>
    <div class="capability-card">
      <span class="capability-number">03</span>
      <h3>Smart Search</h3>
      <p>Full-text search with phrase matching, smart scoring, and keyboard navigation. Press <kbd>Cmd+K</kbd> to try it.</p>
    </div>
    <div class="capability-card">
      <span class="capability-number">04</span>
      <h3>Weekly Newsletter</h3>
      <p>A curated weekly digest of the most important localization news and signal shifts, delivered every Monday.</p>
      <a href="/newsletter/" class="capability-link">Subscribe &rarr;</a>
    </div>
  </div>
</section>

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
