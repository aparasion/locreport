---
layout: page
title: "Linguistic & Communication Theory"
permalink: /research/
description: "Research articles on linguistics, communication theory, and language science — covering phonology, syntax, semantics, psycholinguistics, computational linguistics, and more."
nav: true
nav_order: 3.5
---

Peer-reviewed research and theoretical contributions from linguistics and communication science. These articles explore the foundations of language — from phonetics and syntax to psycholinguistics and computational methods — separate from industry and market analysis.

<section class="post-list">
{% for post in site.posts %}
  {% unless post.article_type == "theory" %}{% continue %}{% endunless %}

  <article class="post-preview">
    <h2>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      {% if post.relevance_score %}
      <span class="relevance-badge relevance-badge--{{ post.relevance_score }} relevance-badge--sm">
        {% if post.relevance_score == 1 %}Peripheral
        {% elsif post.relevance_score == 2 %}Relevant
        {% elsif post.relevance_score == 3 %}Notable
        {% elsif post.relevance_score == 4 %}Major
        {% elsif post.relevance_score == 5 %}Groundbreaking
        {% endif %}
      </span>
      {% endif %}
    </h2>
    <p class="post-meta">
      {{ post.date | date: "%B %d, %Y" }}
      {% if post.research_domain %}
        <span class="research-domain-tag">{{ post.research_domain }}</span>
      {% endif %}
      {% if post.publisher %}
        &middot; {{ post.publisher }}
      {% endif %}
    </p>
    <p>{{ post.excerpt }}</p>
  </article>
{% endfor %}
</section>
