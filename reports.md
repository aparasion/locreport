---
layout: page
title: Reports
permalink: /reports/
description: "Periodic synthesis reports on the language services industry — monthly roundups and annual global market analysis."
nav: true
nav_order: 3
nav_dropdown: true
---

Synthesis reports on the language services industry, published on a monthly and annual basis.

## Annual

<ul>
  <li><a href="/reports/2026-Annual-Global-Market-Report/">2026 Annual Global Market Report</a></li>
</ul>

## Monthly

{% assign monthly_posts = site.posts | where_exp: "post", "post.categories contains 'monthly-summary'" %}
{% if monthly_posts.size > 0 %}
<ul>
{% for post in monthly_posts %}
  <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a></li>
{% endfor %}
</ul>
{% else %}
<p>No monthly reports have been published yet.</p>
{% endif %}
