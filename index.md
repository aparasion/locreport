---
layout: default
title: Home
nav: true
nav_order: 1
---


<section class="topic-filter-panel" aria-label="Browse by topic">
  <p class="topic-filter-title">Browse by topic:</p>
  <div class="topic-filter-buttons" role="group" aria-label="Topic filters">
    <button type="button" class="topic-filter-button active" data-topic-filter="all">All</button>
    <a href="/topics/quality/" class="topic-filter-button">Quality</a>
    <a href="/topics/operations/" class="topic-filter-button">Operations</a>
    <a href="/topics/governance/" class="topic-filter-button">Governance</a>
    <a href="/topics/market/" class="topic-filter-button">Market</a>
    <a href="/topics/strategy/" class="topic-filter-button">Strategy</a>
  </div>
</section>

<section class="post-list">
{% assign latest_date = site.posts.first.date | date: "%Y-%m-%d" %}
{% for post in site.posts %}
  <article class="post-preview">
    <h2>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </h2>

    {% assign post_date = post.date | date: "%Y-%m-%d" %}
    <p class="post-meta">
      {{ post.date | date: "%B %d, %Y" }}
      {% if post_date == latest_date %}<span class="new-badge">NEW!</span>{% endif %}
    </p>

    <p>{{ post.excerpt }}</p>
  </article>

{% endfor %}
</section>
