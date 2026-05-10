---
layout: default
title: Intelligence
permalink: /intelligence/
nav: true
nav_order: 2
description: "Actionable localization intelligence — trend signals, impact scoring, and strategic decision-making."
---

<section class="intel-hero">
  <div class="intel-hero__share">
    {% include social-share.html as_dropdown=true title=page.title description=page.description %}
  </div>
  <h1>Localization Intelligence</h1>
  <p class="intel-subtitle">Less noise, more clarity. Structured, decision-ready intelligence for the localization industry.</p>
</section>

{% comment %} ── Impact Overview Stats ─────────────────────────────── {% endcomment %}
{% assign total_posts = 0 %}
{% assign high_impact_posts = 0 %}
{% assign this_month_posts = 0 %}
{% assign now_date = site.time | date: "%Y-%m" %}

{% for post in site.posts %}
  {% if post.article_type == "theory" %}{% continue %}{% endif %}
  {% assign total_posts = total_posts | plus: 1 %}
  {% if post.impact_score >= 4 %}
    {% assign high_impact_posts = high_impact_posts | plus: 1 %}
  {% endif %}
  {% assign post_month = post.date | date: "%Y-%m" %}
  {% if post_month == now_date %}
    {% assign this_month_posts = this_month_posts | plus: 1 %}
  {% endif %}
{% endfor %}

<section class="intel-stats-grid" aria-label="Intelligence overview statistics">
  <div class="intel-stat-card">
    <span class="intel-stat-number">{{ total_posts }}</span>
    <span class="intel-stat-label">Articles Tracked</span>
  </div>
  <div class="intel-stat-card">
    <span class="intel-stat-number">{{ high_impact_posts }}</span>
    <span class="intel-stat-label">High Impact (4-5)</span>
  </div>
  <div class="intel-stat-card">
    <span class="intel-stat-number">{{ site.data.signals.size }}</span>
    <span class="intel-stat-label">Active Signals</span>
  </div>
  <div class="intel-stat-card">
    <span class="intel-stat-number">{{ this_month_posts }}</span>
    <span class="intel-stat-label">This Month</span>
  </div>
</section>

<section class="intel-link-grid" aria-label="Intelligence tools">
  <a class="intel-link-card" href="{{ '/signals/' | relative_url }}">
    <span class="intel-link-card__eyebrow">Tracker</span>
    <span class="intel-link-card__title">Signals tracker</span>
    <span class="intel-link-card__desc">Track active localization and AI signals with linked article evidence.</span>
    <span class="intel-link-card__cta">Open tracker →</span>
  </a>

  <a class="intel-link-card" href="{{ '/intelligence/correlations/' | relative_url }}">
    <span class="intel-link-card__eyebrow">Matrix</span>
    <span class="intel-link-card__title">Signal Correlation Matrix</span>
    <span class="intel-link-card__desc">See which signals co-occur across the article base and how strongly they connect.</span>
    <span class="intel-link-card__cta">Open matrix →</span>
  </a>

  <a class="intel-link-card" href="{{ '/intelligence/high-impact/' | relative_url }}">
    <span class="intel-link-card__eyebrow">Articles</span>
    <span class="intel-link-card__title">High Impact Articles</span>
    <span class="intel-link-card__desc">Review recent significant, major, and disruptive localization industry coverage.</span>
    <span class="intel-link-card__cta">Open articles →</span>
  </a>
</section>
