---
layout: page
title: Signal Tracker
permalink: /signals/
description: "Track high-impact localization industry signals with linked evidence from published coverage on LocReport."
nav: false
nav_order: 2
no_share: true
---

A living tracker of high-impact claims in localization and AI, with linked evidence from published coverage. Click any signal to open its dedicated page.

<div class="signals-page-share">
  {% include social-share.html as_dropdown=true title=page.title description=page.description %}
</div>

<div class="signals-index-grid">
  {% for signal in site.data.signals %}
    {% assign evidence_posts = site.posts | where_exp: "post", "post.signal_ids contains signal.id" %}
    <a class="signals-index-card" href="{{ '/signals/' | relative_url }}{{ signal.id }}/">
      <div class="signals-index-card__top">
        <span class="signal-tile__category">{{ signal.category }}</span>
        <span class="status-badge status-badge--{{ signal.current_status }}">{{ signal.current_status }}</span>
        {% if signal.momentum == "rising" %}
          <span class="momentum-badge momentum-badge--rising" title="Evidence momentum: rising">↑</span>
        {% elsif signal.momentum == "declining" %}
          <span class="momentum-badge momentum-badge--declining" title="Evidence momentum: declining">↓</span>
        {% else %}
          <span class="momentum-badge momentum-badge--stable" title="Evidence momentum: stable">→</span>
        {% endif %}
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
