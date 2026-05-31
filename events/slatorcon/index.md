---
layout: page
title: "SlatorCon Coverage"
permalink: /events/slatorcon/
topic: events
description: "All LocReport coverage of SlatorCon — the leading conference series for language industry professionals."
---

Coverage of SlatorCon events, Slator's flagship conference series connecting buyers and sellers of language services and technology.

{% assign sc_keywords = "slatorcon" | split: "," %}

<section class="post-list">
{% for post in site.posts %}
  {% assign source_text = post.title | append: ' ' | append: post.excerpt | downcase %}
  {% assign matched = false %}
  {% for kw in sc_keywords %}
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
