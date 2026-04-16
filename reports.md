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

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); margin: var(--space-6) 0;">
  <a href="/reports/annual/" style="display: block; padding: var(--space-5); background: var(--surface); border: 1px solid var(--border); border-top: 3px solid var(--accent); border-radius: var(--radius-md); text-decoration: none; color: inherit;">
    <h2 style="margin: 0 0 var(--space-2); font-size: 1.2rem; color: var(--text);">Annual Report</h2>
    <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">The Global Language Services Market Report — a comprehensive annual analysis of industry trends, market data, and strategic outlook.</p>
    <p style="margin: var(--space-3) 0 0; font-size: 0.875rem; color: var(--accent); font-weight: 600;">View annual report →</p>
  </a>
  <a href="/monthly-reports/" style="display: block; padding: var(--space-5); background: var(--surface); border: 1px solid var(--border); border-top: 3px solid var(--accent); border-radius: var(--radius-md); text-decoration: none; color: inherit;">
    <h2 style="margin: 0 0 var(--space-2); font-size: 1.2rem; color: var(--text);">Monthly Reports</h2>
    <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">Curated monthly roundups of the biggest developments across translation, localization, and language technology.</p>
    <p style="margin: var(--space-3) 0 0; font-size: 0.875rem; color: var(--accent); font-weight: 600;">Browse monthly reports →</p>
  </a>
</div>

{% assign monthly_posts = site.posts | where_exp: "post", "post.categories contains 'monthly-summary'" %}
{% if monthly_posts.size > 0 %}
<h2 style="margin-top: var(--space-8); margin-bottom: var(--space-4);">Recent monthly reports</h2>
<section class="post-list">
{% for post in monthly_posts limit: 6 %}
  <article class="post-preview">
    <h3 style="font-size: 1.1rem; margin-bottom: var(--space-1);">
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </h3>
    <p class="post-meta">{{ post.date | date: "%B %Y" }}</p>
    <p>{{ post.excerpt }}</p>
  </article>
{% endfor %}
{% if monthly_posts.size > 6 %}
<p style="margin-top: var(--space-4);"><a href="/monthly-reports/" style="color: var(--accent);">View all {{ monthly_posts.size }} monthly reports →</a></p>
{% endif %}
</section>
{% endif %}
