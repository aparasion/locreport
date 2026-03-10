---
layout: default
title: Home
nav: true
nav_order: 1
---


<section class="topic-filter-panel" aria-label="Filter posts by topic">
  <p class="topic-filter-title">Filter by topic:</p>
  <div class="topic-filter-buttons" role="group" aria-label="Topic filters">
    <button type="button" class="topic-filter-button active" data-topic-filter="all">All</button>
    <button type="button" class="topic-filter-button" data-topic-filter="quality">Quality</button>
    <button type="button" class="topic-filter-button" data-topic-filter="operations">Operations</button>
    <button type="button" class="topic-filter-button" data-topic-filter="governance">Governance</button>
    <button type="button" class="topic-filter-button" data-topic-filter="market">Market</button>
    <button type="button" class="topic-filter-button" data-topic-filter="strategy">Strategy</button>
  </div>
</section>

<section class="post-list">
{% assign latest_date = site.posts.first.date | date: "%Y-%m-%d" %}
{% for post in site.posts %}
  {% assign topics = '' %}
  {% assign signal_ids_str = post.signal_ids | join: ',' | downcase %}
  {% assign has_signals = false %}
  {% if post.signal_ids and post.signal_ids.size > 0 %}
    {% assign has_signals = true %}
    {% if signal_ids_str contains 'quality-gap-closure' or signal_ids_str contains 'measurable-quality-evaluation' %}
      {% assign topics = topics | append: 'quality,' %}
    {% endif %}
    {% if signal_ids_str contains 'governance-in-ai-workflows' or signal_ids_str contains 'regulatory-fragmentation' %}
      {% assign topics = topics | append: 'governance,' %}
    {% endif %}
    {% if signal_ids_str contains 'localization-operating-system' or signal_ids_str contains 'translation-memory-obsolescence' or signal_ids_str contains 'agentic-localization-workflows' or signal_ids_str contains 'multimodal-content-localization' %}
      {% assign topics = topics | append: 'operations,' %}
    {% endif %}
    {% if signal_ids_str contains 'human-post-editing-contraction' %}
      {% assign topics = topics | append: 'market,' %}
    {% endif %}
    {% if signal_ids_str contains 'localization-first-content-design' %}
      {% assign topics = topics | append: 'strategy,' %}
    {% endif %}
  {% endif %}
  {% if has_signals == false or topics == '' %}
    {% assign source_text = post.title | append: ' ' | append: post.excerpt | downcase %}
    {% if source_text contains 'mqm' or source_text contains 'mtpe' or source_text contains 'post-edit' or source_text contains 'linguistic quality' or source_text contains 'quality assurance' or source_text contains 'quality evaluation' or source_text contains 'lqa' %}
      {% assign topics = topics | append: 'quality,' %}
    {% endif %}
    {% if source_text contains 'eu ai act' or source_text contains 'ai regulation' or source_text contains 'compliance requirement' or source_text contains 'language law' or source_text contains 'ai governance' or source_text contains 'guardrail' %}
      {% assign topics = topics | append: 'governance,' %}
    {% endif %}
    {% if source_text contains 'translation memory' or source_text contains 'tms' or source_text contains 'cat tool' or source_text contains 'localization platform' or source_text contains 'dubbing' or source_text contains 'subtitl' or source_text contains 'agentic' or source_text contains 'ai agent' %}
      {% assign topics = topics | append: 'operations,' %}
    {% endif %}
    {% if source_text contains 'freelance translator' or source_text contains 'translator demand' or source_text contains 'post-editor' or source_text contains 'language services market' or source_text contains 'translation rates' %}
      {% assign topics = topics | append: 'market,' %}
    {% endif %}
    {% if source_text contains 'internationalization' or source_text contains 'i18n' or source_text contains 'locale-aware' or source_text contains 'transcreation' or source_text contains 'localization-first' %}
      {% assign topics = topics | append: 'strategy,' %}
    {% endif %}
  {% endif %}
  {% if topics == '' %}
    {% assign topics = 'operations' %}
  {% endif %}

  <article class="post-preview" data-topics="{{ topics | strip }}">
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
