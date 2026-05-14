---
layout: page
title: Signal Tracker
permalink: /intelligence/signals/
redirect_from:
  - /signals/
description: "Track high-impact localization industry signals with linked evidence from published coverage on LocReport."
nav: false
nav_order: 2
no_share: true
---

{% assign supported_signals = site.data.signals | where: "current_status", "supported" %}
{% assign emerging_signals = site.data.signals | where: "current_status", "emerging" %}
{% assign disputed_signals = site.data.signals | where: "current_status", "disputed" %}

<div class="signals-hub-header">
  <p class="signals-hub-desc">A living tracker of high-impact claims in localization and AI, with linked evidence from published coverage. Click any signal to explore its evidence base.</p>
  <div class="signals-hub-stats">
    <div class="signals-hub-stat">
      <span class="signals-hub-stat__num">{{ site.data.signals.size }}</span>
      <span class="signals-hub-stat__label">Active Signals</span>
    </div>
    <div class="signals-hub-stat">
      <span class="signals-hub-stat__num signals-hub-stat__num--supported">{{ supported_signals.size }}</span>
      <span class="signals-hub-stat__label">Supported</span>
    </div>
    <div class="signals-hub-stat">
      <span class="signals-hub-stat__num signals-hub-stat__num--emerging">{{ emerging_signals.size }}</span>
      <span class="signals-hub-stat__label">Emerging</span>
    </div>
    <div class="signals-hub-stat">
      <span class="signals-hub-stat__num signals-hub-stat__num--disputed">{{ disputed_signals.size }}</span>
      <span class="signals-hub-stat__label">Disputed</span>
    </div>
  </div>
  <div class="signals-hub-share">
    {% include social-share.html as_dropdown=true title=page.title description=page.description %}
  </div>
</div>

<div class="signals-index-grid">
  {% for signal in site.data.signals %}
    {% assign evidence_posts = site.posts | where_exp: "post", "post.signal_ids contains signal.id" %}
    <a class="signals-index-card" href="{{ '/intelligence/signals/' | relative_url }}{{ signal.id }}/">
      <div class="signals-index-card__top">
        <div class="signals-index-card__category-row">
          <span class="signal-tile__category">{{ signal.category }}</span>
        </div>
        <div class="signals-index-card__badges">
          <span class="status-badge status-badge--{{ signal.current_status }}">{{ signal.current_status }}</span>
          {% if signal.momentum == "rising" %}
            <span class="momentum-badge momentum-badge--pill momentum-badge--rising" title="Evidence momentum: rising">↑ rising</span>
          {% elsif signal.momentum == "declining" %}
            <span class="momentum-badge momentum-badge--pill momentum-badge--declining" title="Evidence momentum: declining">↓ declining</span>
          {% else %}
            <span class="momentum-badge momentum-badge--pill momentum-badge--stable" title="Evidence momentum: stable">→ stable</span>
          {% endif %}
        </div>
      </div>
      <h2 class="signals-index-card__title">{{ signal.title }}</h2>
      <p class="signals-index-card__desc">{{ signal.description }}</p>
      <div class="signals-index-card__bottom">
        <span class="signal-tile__count">{{ evidence_posts.size }} article{% if evidence_posts.size != 1 %}s{% endif %}</span>
        <span class="signals-index-card__cta">View signal →</span>
      </div>
    </a>
  {% endfor %}
</div>
