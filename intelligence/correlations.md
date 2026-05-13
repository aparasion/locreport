---
layout: default
title: Signal Correlation Matrix
permalink: /intelligence/correlations/
description: "Which localization industry signals move together? Full co-occurrence matrix across all tracked articles."
---

<section class="intel-hero">
  <div class="intel-hero__share">
    {% include social-share.html as_dropdown=true title=page.title description=page.description %}
  </div>
  <h1>Signal Correlation Matrix</h1>
  <p class="intel-subtitle">Signals that frequently co-occur in the same articles reveal structural connections — patterns no single article exposes. Updated automatically with each new article batch.</p>
  <p class="intel-subtitle-sub"><a href="{{ '/intelligence/' | relative_url }}">← Back to Intelligence Dashboard</a></p>
</section>

{% comment %} Build a lookup: signal id → signal object {% endcomment %}
{% assign sig_count = site.data.signals.size %}

<section class="corr-page-section">
  <h2 class="corr-page-section-title">Co-occurrence Pairs</h2>
  <p class="corr-page-section-desc">Each pair shows how many tracked articles reference both signals simultaneously. Stronger connections indicate the signals are structurally linked in how the industry discusses them.</p>

  <div class="corr-legend">
    <span class="corr-strength corr-strength--strong">Strong ≥6</span>
    <span class="corr-strength corr-strength--moderate">Moderate ≥3</span>
    <span class="corr-strength corr-strength--weak">Weak ≥1</span>
  </div>

  <div class="corr-pairs-grid">
    {% for corr in site.data.signal_correlations.correlations %}
    {% assign sig_a = site.data.signals | where: "id", corr.signal_a | first %}
    {% assign sig_b = site.data.signals | where: "id", corr.signal_b | first %}
    {% if sig_a and sig_b %}
    <div class="corr-pair-card corr-pair-card--{{ corr.strength }}">
      <div class="corr-pair-strength">
        <span class="corr-strength corr-strength--{{ corr.strength }}">{{ corr.strength }}</span>
        <span class="corr-pair-count">{{ corr.co_occurrences }} article{% if corr.co_occurrences != 1 %}s{% endif %}</span>
      </div>
      <div class="corr-pair-signals">
        <a href="{{ '/intelligence/signals/' | relative_url }}{{ corr.signal_a }}/" class="corr-pair-signal corr-pair-signal--{{ sig_a.category }}">
          <span class="corr-pair-signal-cat">{{ sig_a.category }}</span>
          <span class="corr-pair-signal-title">{{ sig_a.title }}</span>
        </a>
        <span class="corr-pair-connector" aria-hidden="true">↔</span>
        <a href="{{ '/intelligence/signals/' | relative_url }}{{ corr.signal_b }}/" class="corr-pair-signal corr-pair-signal--{{ sig_b.category }}">
          <span class="corr-pair-signal-cat">{{ sig_b.category }}</span>
          <span class="corr-pair-signal-title">{{ sig_b.title }}</span>
        </a>
      </div>
      {% comment %} Show a few example articles {% endcomment %}
      {% assign examples = site.posts | where_exp: "p", "p.article_type != 'theory'" %}
      {% assign example_count = 0 %}
      <ul class="corr-pair-examples">
        {% for post in site.posts %}
        {% if post.article_type == "theory" %}{% continue %}{% endif %}
        {% if post.signal_ids contains corr.signal_a and post.signal_ids contains corr.signal_b %}
        {% if example_count < 2 %}
        <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a> <span class="corr-example-date">{{ post.date | date: "%b %d, %Y" }}</span></li>
        {% assign example_count = example_count | plus: 1 %}
        {% endif %}
        {% endif %}
        {% endfor %}
      </ul>
    </div>
    {% endif %}
    {% endfor %}
  </div>
</section>

{% comment %} Per-signal correlation summary {% endcomment %}
<section class="corr-page-section">
  <h2 class="corr-page-section-title">Per-Signal Network</h2>
  <p class="corr-page-section-desc">For each signal, the total number of unique signals it connects with and the combined co-occurrence weight.</p>

  <div class="corr-network-list">
    {% for signal in site.data.signals %}
    {% assign total_connections = 0 %}
    {% assign total_weight = 0 %}
    {% for corr in site.data.signal_correlations.correlations %}
      {% if corr.signal_a == signal.id or corr.signal_b == signal.id %}
        {% assign total_connections = total_connections | plus: 1 %}
        {% assign total_weight = total_weight | plus: corr.co_occurrences %}
      {% endif %}
    {% endfor %}
    {% if total_connections > 0 %}
    <div class="corr-network-item">
      <div class="corr-network-item-header">
        <span class="signal-tile__category">{{ signal.category }}</span>
        <a href="{{ '/intelligence/' | relative_url }}#{{ signal.id }}" class="corr-network-item-title">{{ signal.title }}</a>
      </div>
      <div class="corr-network-item-stats">
        <span class="corr-network-stat">{{ total_connections }} connection{% if total_connections != 1 %}s{% endif %}</span>
        <span class="corr-network-stat">{{ total_weight }} total co-occurrences</span>
      </div>
    </div>
    {% endif %}
    {% endfor %}
  </div>
</section>
