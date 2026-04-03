---
layout: default
title: "Localization & Translation Industry News"
nav: true
nav_order: 1
---

<section class="hero">
  <div class="hero-content">
    <h1 id="hero-title">The pulse of the language<br>services industry</h1>
    <p class="hero-subtitle" id="hero-subtitle">Daily coverage of translation, localization, and AI — curated, analyzed, and tracked through the signals that matter.</p>
    <div class="hero-actions" id="hero-actions">
      <a href="/all-articles/" class="btn btn--primary">Browse articles</a>
      <a href="/intelligence/" class="btn btn--secondary">Intelligence Dashboard</a>
    </div>
  </div>
</section>

<script>
(function () {
  var INITIAL_WAIT    = 5000;
  var FADE_MS         = 1300;
  var TYPE_SPEED      = 55;
  var COMMA_DELAY     = 3000;
  var ALT_SHOW        = 10000;

  var ALT_H1_PRE      = 'No';
  var ALT_H1_POST     = ' AI has been used to build this service.';
  var ALT_SUBTITLE    = "Language matters </br>as much as technology.";

  var INIT_H1_HTML    = 'The pulse of the language<br>services industry';
  var INIT_SUBTITLE   = 'Daily coverage of translation, localization, and AI \u2014 curated, analyzed, and tracked through the signals that matter.';

  var h1   = document.getElementById('hero-title');
  var sub  = document.getElementById('hero-subtitle');
  var hero = document.querySelector('.hero');

  if (!h1 || !sub || !hero) return;

  // Lock hero height before any text changes so the section never jumps
  function lockHeroHeight() {
    var h = hero.offsetHeight;
    if (h > 0) {
      hero.style.minHeight = h + 'px';
      // Also fix h1 and sub heights so swapping text doesn't reflow the banner
      h1.style.minHeight  = h1.offsetHeight  + 'px';
      sub.style.minHeight = sub.offsetHeight + 'px';
    }
  }

  // Wait for fonts to settle (one rAF after load) then lock
  if (document.readyState === 'complete') {
    requestAnimationFrame(lockHeroHeight);
  } else {
    window.addEventListener('load', function () { requestAnimationFrame(lockHeroHeight); });
  }

  function setOpacity(el, val, ms, cb) {
    el.style.transition = 'opacity ' + ms + 'ms ease';
    el.style.opacity    = String(val);
    if (cb) setTimeout(cb, ms);
  }

  function typeInto(el, text, speed, done) {
    el.innerHTML = '<span class="hero-cursor" aria-hidden="true">\u2502</span>';
    var cursor = el.querySelector('.hero-cursor');
    var i = 0;
    function tick() {
      if (i < text.length) {
        cursor.insertAdjacentText('beforebegin', text[i]);
        i++;
        setTimeout(tick, speed);
      } else {
        cursor.remove();
        if (done) done();
      }
    }
    tick();
  }

  function loop() {
    // ── phase 1: show initial content for 5 s ────────────
    setTimeout(function () {

      // ── phase 2: fade out h1 and subtitle only ───────────
      setOpacity(h1,  0, FADE_MS);
      setOpacity(sub, 0, FADE_MS, function () {

        // ── phase 3: type alt h1 ─────────────────────────
        h1.style.transition = '';
        h1.style.opacity    = '1';
        typeInto(h1, ALT_H1_PRE + ALT_H1_POST, TYPE_SPEED, function () {

          // ── phase 4: insert glowing comma after 3 s ─────
          setTimeout(function () {
            h1.innerHTML =
              ALT_H1_PRE +
              '<span class="hero-comma" aria-hidden="true">,</span> ' +
              ALT_H1_POST;

            // ── phase 5: type alt subtitle ───────────────
            sub.style.transition = '';
            sub.style.opacity    = '1';
            typeInto(sub, ALT_SUBTITLE, TYPE_SPEED, function () {

              // ── phase 6: hold alt banner for 10 s ───────
              setTimeout(function () {

                // ── phase 7: fade out alt content ───────────
                setOpacity(h1,  0, FADE_MS);
                setOpacity(sub, 0, FADE_MS, function () {

                  // ── phase 8: restore initial content ────────
                  h1.style.transition  = '';
                  sub.style.transition = '';
                  h1.innerHTML         = INIT_H1_HTML;
                  sub.textContent      = INIT_SUBTITLE;

                  h1.style.opacity  = '0';
                  sub.style.opacity = '0';

                  // small rAF pause to let browser register opacity:0
                  requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                      setOpacity(h1,  1, FADE_MS);
                      setOpacity(sub, 1, FADE_MS, function () {
                        h1.style.transition  = '';
                        sub.style.transition = '';
                        loop(); // restart
                      });
                    });
                  });
                });
              }, ALT_SHOW);
            });
          }, COMMA_DELAY);
        });
      });
    }, INITIAL_WAIT);
  }

  loop();
}());
</script>

{% include sources-bar.html %}

<!-- Latest Articles -->
{% comment %}
  Collect the last 3 unique days that have published content.
  Posts are already sorted newest-first by Jekyll.
{% endcomment %}
{% assign day_count = 0 %}
{% assign current_day = "" %}
{% assign day1 = "" %}
{% assign day2 = "" %}
{% assign day3 = "" %}

{% for post in site.posts %}
  {% assign post_day = post.date | date: "%Y-%m-%d" %}
  {% if post_day != current_day %}
    {% assign current_day = post_day %}
    {% assign day_count = day_count | plus: 1 %}
    {% if day_count == 1 %}
      {% assign day1 = post_day %}
    {% elsif day_count == 2 %}
      {% assign day2 = post_day %}
    {% elsif day_count == 3 %}
      {% assign day3 = post_day %}
    {% endif %}
  {% endif %}
  {% if day_count > 3 %}{% break %}{% endif %}
{% endfor %}

{% comment %} Day 1: Most recent — featured first article + grid of remaining {% endcomment %}
{% assign day1_first = true %}
<section class="day-section">
  <h2 class="day-header">{{ site.posts.first.date | date: "%B %d, %Y" }}</h2>

  {% for post in site.posts %}
    {% assign post_day = post.date | date: "%Y-%m-%d" %}
    {% if post_day != day1 %}{% continue %}{% endif %}

    {% if day1_first %}
      {% assign day1_first = false %}
      <article class="featured-article reveal">
        <span class="featured-badge">Latest</span>
        {% if post.impact_score %}
        <span class="impact-badge impact-badge--{{ post.impact_score }} impact-badge--inline">
          {% if post.impact_score == 1 %}Routine{% elsif post.impact_score == 2 %}Notable{% elsif post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}
        </span>
        {% endif %}
        <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}</p>
        <p>{{ post.excerpt | strip_html | truncate: 200 }}</p>
      </article>

      <div class="post-grid reveal-stagger">
    {% else %}
      <article class="post-card" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
        <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}<span class="new-badge">NEW</span>{% if post.impact_score and post.impact_score >= 3 %}<span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}"></span>{% endif %}</p>
        <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        <p>{{ post.excerpt | strip_html | truncate: 140 }}</p>
        <a class="read-more" href="{{ post.url | relative_url }}">Read more &rarr;</a>
      </article>
    {% endif %}
  {% endfor %}
      </div>
</section>

{% comment %} Newsletter signup banner {% endcomment %}
<section class="newsletter-banner">
  <div class="newsletter-banner-inner">
    <div class="newsletter-banner-text">
      <div class="newsletter-banner-eyebrow">
        <span class="newsletter-banner-tag">Weekly · Every Friday</span>
      </div>
      <h3 class="newsletter-banner-title">Stay ahead of the signal</h3>
      <p class="newsletter-banner-desc">Localization news, market moves, and industry shifts — curated and delivered every Friday.</p>
    </div>
    <form action="https://buttondown.com/api/emails/embed-subscribe/locreport"
          method="post"
          class="newsletter-banner-form">
      <input type="email" name="email" required
             placeholder="your@email.com"
             class="newsletter-banner-input">
      <button type="submit" class="newsletter-banner-btn">Subscribe →</button>
    </form>
  </div>
</section>

{% comment %} Day 2 {% endcomment %}
{% if day2 != "" %}
<section class="day-section">
  {% for post in site.posts %}
    {% assign post_day = post.date | date: "%Y-%m-%d" %}
    {% if post_day == day2 %}
      {% assign day2_display = post.date | date: "%B %d, %Y" %}
      {% break %}
    {% endif %}
  {% endfor %}
  <h2 class="day-header">{{ day2_display }}</h2>
  <div class="post-grid reveal-stagger">
    {% for post in site.posts %}
      {% assign post_day = post.date | date: "%Y-%m-%d" %}
      {% if post_day != day2 %}{% continue %}{% endif %}
      <article class="post-card" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
        <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}{% if post.impact_score and post.impact_score >= 3 %}<span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}"></span>{% endif %}</p>
        <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        <p>{{ post.excerpt | strip_html | truncate: 140 }}</p>
        <a class="read-more" href="{{ post.url | relative_url }}">Read more &rarr;</a>
      </article>
    {% endfor %}
  </div>
</section>
{% endif %}

{% comment %} Day 3 {% endcomment %}
{% if day3 != "" %}
<section class="day-section">
  {% for post in site.posts %}
    {% assign post_day = post.date | date: "%Y-%m-%d" %}
    {% if post_day == day3 %}
      {% assign day3_display = post.date | date: "%B %d, %Y" %}
      {% break %}
    {% endif %}
  {% endfor %}
  <h2 class="day-header">{{ day3_display }}</h2>
  <div class="post-grid reveal-stagger">
    {% for post in site.posts %}
      {% assign post_day = post.date | date: "%Y-%m-%d" %}
      {% if post_day != day3 %}{% continue %}{% endif %}
      <article class="post-card" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
        <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}{% if post.impact_score and post.impact_score >= 3 %}<span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}"></span>{% endif %}</p>
        <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        <p>{{ post.excerpt | strip_html | truncate: 140 }}</p>
        <a class="read-more" href="{{ post.url | relative_url }}">Read more &rarr;</a>
      </article>
    {% endfor %}
  </div>
</section>
{% endif %}

<!-- CTA Section -->
<section class="cta-section">
  <div class="cta-inner">
    <h2>Ready to stay ahead?</h2>
    <p>Join localization professionals who rely on LocReport for daily industry intelligence.</p>
    <div class="cta-actions">
      <a href="/all-articles/" class="btn btn--primary btn--lg">View all articles</a>
      <a href="/intelligence/" class="btn btn--ghost btn--lg">Intelligence Dashboard</a>
    </div>
  </div>
</section>
