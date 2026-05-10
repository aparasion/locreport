---
layout: default
title: High Impact Articles
permalink: /intelligence/high-impact/
description: "Recent high-impact localization industry articles scoring 3 or above on the Localization Impact Scale."
---

<section class="intel-hero">
  <div class="intel-hero__share">
    {% include social-share.html as_dropdown=true title=page.title description=page.description %}
  </div>
  <h1>High Impact Articles</h1>
  <p class="intel-subtitle">Recent articles scoring 3+ on the Localization Impact Scale.</p>
  <p class="intel-subtitle-sub"><a href="{{ '/intelligence/' | relative_url }}">← Back to Intelligence</a></p>
</section>

<section class="intel-section" id="high-impact-section">
  {% comment %} Impact legend {% endcomment %}
  <div class="intel-legend">
    <div class="intel-legend-group">
      <span class="intel-legend-label">Impact</span>
      <span class="impact-badge impact-badge--3 impact-badge--sm" title="Notable shift requiring attention">Significant</span>
      <span class="impact-badge impact-badge--4 impact-badge--sm" title="Major change requiring strategic adaptation">Major</span>
      <span class="impact-badge impact-badge--5 impact-badge--sm" title="Fundamentally reshapes the industry">Disruptive</span>
    </div>
    <div class="intel-legend-sep"></div>
    <div class="intel-legend-group">
      <span class="intel-legend-label">Time horizon</span>
      <span class="time-horizon-badge time-horizon-badge--now time-horizon-badge--sm" title="Immediate impact">Now — Immediate</span>
      <span class="time-horizon-badge time-horizon-badge--6months time-horizon-badge--sm" title="Impact expected within 6 months">6mo — Near-term</span>
      <span class="time-horizon-badge time-horizon-badge--2years time-horizon-badge--sm" title="Long-term impact over 2 years">2yr — Long-term</span>
    </div>
  </div>

  <div class="intel-high-impact-list" id="intel-high-impact-list">
    {% assign high_impact_posts = site.posts | where_exp: "post", "post.article_type != 'theory'" | where_exp: "post", "post.impact_score >= 3" | sort: "impact_score" | reverse %}
    {% assign impact_count = 0 %}
    {% for post in high_impact_posts %}
      {% if impact_count >= 12 %}{% break %}{% endif %}
      {% assign impact_count = impact_count | plus: 1 %}
        <a href="{{ post.url | relative_url }}" class="intel-impact-item" data-segments="{{ post.affected_segments | join: '|' }}" data-impact="{{ post.impact_score }}">
          <div class="intel-impact-item-top">
            <span class="impact-badge impact-badge--{{ post.impact_score }} impact-badge--sm">
              {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}
            </span>
            {% if post.time_horizon %}
            <span class="time-horizon-badge time-horizon-badge--{{ post.time_horizon }} time-horizon-badge--sm">
              {% if post.time_horizon == "now" %}Now{% elsif post.time_horizon == "6months" %}6mo{% elsif post.time_horizon == "2years" %}2yr{% endif %}
            </span>
            {% endif %}
            <span class="intel-impact-date">{{ post.date | date: "%b %d" }}</span>
          </div>
          <h2 class="intel-impact-title">{{ post.title }}</h2>
          {% if post.business_implications and post.business_implications.size > 0 %}
          <p class="intel-impact-implication">{{ post.business_implications.first }}</p>
          {% endif %}
          {% if post.affected_segments and post.affected_segments.size > 0 %}
          <div class="intel-impact-segments">
            {% for seg in post.affected_segments %}
            <span class="segment-tag segment-tag--sm">{{ seg }}</span>
            {% endfor %}
          </div>
          {% endif %}
        </a>
    {% endfor %}
    {% if impact_count == 0 %}
    <p class="intel-empty">No high-impact articles yet. Intelligence scoring applies to new articles as they are published.</p>
    {% endif %}
  </div>
</section>
