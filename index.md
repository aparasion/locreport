---
layout: default
title: Home
---

{% for post in site.posts %}

## [{{ post.title }}]({{ post.url | relative_url }})

<small class="post-meta">
{{ post.date | date: "%B %d, %Y" }}
</small>

{{ post.excerpt }}

---

{% endfor %}
