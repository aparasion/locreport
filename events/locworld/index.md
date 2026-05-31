---
layout: page
title: "LocWorld Coverage"
permalink: /events/locworld/
topic: events
description: "All LocReport coverage of LocWorld — the global forum for the language services industry."
---

Coverage of LocWorld conferences, the premier gathering for localization professionals worldwide. Includes event announcements, session highlights, industry reactions, and market analysis.

{% assign lw_keywords = "locworld" | split: "," %}

<section class="post-list">
{% for post in site.posts %}
  {% assign source_text = post.title | append: ' ' | append: post.excerpt | downcase %}
  {% assign matched = false %}
  {% for kw in lw_keywords %}
    {% if source_text contains kw %}
      {% assign matched = true %}
    {% endif %}
  {% endfor %}
  {% if matched %}
  <article class="post-preview">
    <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
    <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}</p>
    <p>{{ post.excerpt }}</p>
  </article>
  {% endif %}
{% endfor %}
</section>

[View all events &rarr;](/events/)
