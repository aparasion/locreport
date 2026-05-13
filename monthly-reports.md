---
layout: page
title: Monthly Reports
permalink: /reports/monthly/
redirect_from:
  - /monthly-reports/
description: "Monthly localization industry reports — curated summaries of translation, AI, and language technology trends."
nav: false
nav_order: 3.2
nav_parent: "Reports"
---

{% assign monthly_posts = site.posts | where_exp: "post", "post.categories contains 'monthly-summary'" %}
{% assign total_sources = 0 %}
{% for post in monthly_posts %}
  {% if post.source_count %}
    {% assign total_sources = total_sources | plus: post.source_count %}
  {% endif %}
{% endfor %}

<div class="mr-hero">
  <span class="mr-hero-eyebrow">Industry Intelligence</span>
  <p class="mr-hero-desc">Each month we scan hundreds of sources across translation, AI, and language technology — then distill the signals that matter for localization leaders.</p>
  <div class="mr-hero-stats">
    <div class="mr-stat">
      <span class="mr-stat-num">{{ monthly_posts.size }}</span>
      <span class="mr-stat-label">Reports</span>
    </div>
    <div class="mr-stat-divider"></div>
    <div class="mr-stat">
      <span class="mr-stat-num">{{ total_sources }}+</span>
      <span class="mr-stat-label">Articles analyzed</span>
    </div>
    <div class="mr-stat-divider"></div>
    <div class="mr-stat">
      <span class="mr-stat-num">Free</span>
      <span class="mr-stat-label">Always</span>
    </div>
  </div>
</div>

{% if monthly_posts.size > 0 %}
  {% assign latest = monthly_posts.first %}

  <div class="mr-featured">
    <div class="mr-featured-label">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
      Latest Report
    </div>
    <h2 class="mr-featured-title">
      <a href="{{ latest.url | relative_url }}">{{ latest.title }}</a>
    </h2>
    <p class="mr-featured-meta">
      {{ latest.date | date: "%B %Y" }}{% if latest.source_count %} &middot; {{ latest.source_count }} articles analyzed{% endif %}
    </p>
    <p class="mr-featured-excerpt">{{ latest.excerpt }}</p>
    {% if latest.signal_ids %}
    <div class="mr-featured-signals">
      {% for sig in latest.signal_ids limit:3 %}
        <span class="mr-signal-chip">{{ sig | replace: '-', ' ' }}</span>
      {% endfor %}
    </div>
    {% endif %}
    <a href="{{ latest.url | relative_url }}" class="mr-featured-cta">Read Full Report &rarr;</a>
  </div>

  {% if monthly_posts.size > 1 %}
  <div class="mr-archive-header">
    <span class="mr-archive-title">Archive</span>
  </div>
  <div class="mr-archive-grid">
  {% for post in monthly_posts offset:1 %}
    {% assign source_text = post.title | append: ' ' | append: post.excerpt | append: ' ' | downcase %}
    {% assign topics = '' %}
    {% if source_text contains 'ai' or source_text contains 'llm' or source_text contains 'machine learning' or source_text contains 'neural' %}
      {% assign topics = topics | append: 'AI,' %}
    {% endif %}
    {% if source_text contains 'lsp' or source_text contains 'language service' or source_text contains 'vendor' or source_text contains 'provider' %}
      {% assign topics = topics | append: 'LSP,' %}
    {% endif %}
    {% if source_text contains 'platform' or source_text contains 'tool' or source_text contains 'workflow' or source_text contains 'software' %}
      {% assign topics = topics | append: 'Tools,' %}
    {% endif %}
    {% if source_text contains 'regulation' or source_text contains 'law' or source_text contains 'compliance' or source_text contains 'policy' %}
      {% assign topics = topics | append: 'Policy,' %}
    {% endif %}

    <article class="mr-card">
      <div class="mr-card-top">
        <span class="mr-card-date">{{ post.date | date: "%B %Y" }}</span>
        {% if post.source_count %}<span class="mr-card-sources">{{ post.source_count }} articles</span>{% endif %}
      </div>
      <h3 class="mr-card-title">
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      </h3>
      <p class="mr-card-excerpt">{{ post.excerpt }}</p>
      {% if topics != '' %}
      <div class="mr-card-topics">
        {% assign topic_arr = topics | split: ',' %}
        {% for t in topic_arr %}
          {% unless t == '' %}<span class="mr-topic-chip">{{ t }}</span>{% endunless %}
        {% endfor %}
      </div>
      {% endif %}
      <a href="{{ post.url | relative_url }}" class="mr-card-link">Read report &rarr;</a>
    </article>
  {% endfor %}
  </div>
  {% endif %}

{% else %}
  <p>No monthly reports have been published yet.</p>
{% endif %}

<div class="mr-newsletter-cta">
  <div class="mr-newsletter-cta-inner">
    <div class="mr-newsletter-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    </div>
    <h3 class="mr-newsletter-title">Never miss a monthly report</h3>
    <p class="mr-newsletter-desc">Get the weekly localization intelligence brief every Friday — key signals, market shifts, and strategic insights curated for leaders who need to stay ahead.</p>
    <a href="/newsletter/" class="btn btn--primary btn--lg">Subscribe Free &rarr;</a>
    <p class="mr-newsletter-hint">Every Friday &middot; No spam &middot; Unsubscribe anytime</p>
  </div>
</div>
