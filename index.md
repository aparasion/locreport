---
layout: default
title: Home
---

<section class="hero">
  <h1>Modern insights on technology & design</h1>
  <p>Thoughtful writing on engineering, systems, and the future of digital craft.</p>
</section>

<section class="post-list">
{% for post in site.posts %}

  <article class="post-preview">
    <h2>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </h2>

    <p class="post-meta">
      {{ post.date | date: "%B %d, %Y" }}
    </p>

    <p>{{ post.excerpt }}</p>
  </article>

{% endfor %}
</section>
