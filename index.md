---
layout: default
title: "Localization & Translation Industry News"
nav: true
nav_order: 1
---

<section class="hero" id="hero-section">
  <div class="hero-slider-viewport">
  <div class="hero-slides-track" id="hero-track">
    <div class="hero-slide">
      <div class="hero-content">
        <h1>The pulse of the language<br>services industry</h1>
        <p class="hero-subtitle">Daily coverage of translation, localization, and AI &mdash; curated, analyzed, and tracked through the signals that matter.</p>
        <div class="hero-actions">
          <a href="/all-articles/" class="btn btn--hero-articles">Browse articles</a>
          <a href="/intelligence/" class="btn btn--hero-intel">Intelligence Dashboard</a>
          <a href="/research/" class="btn btn--hero-research">Language Science</a>
        </div>
      </div>
    </div>
    <div class="hero-slide">
      <div class="hero-content">
        <h1>No<span class="hero-comma" aria-hidden="true">,</span> AI has been used to build this service.</h1>
        <p class="hero-subtitle">Language matters&nbsp;&nbsp;as much as technology.</p>
        <div class="hero-actions">
          <a href="/all-articles/" class="btn btn--hero-articles">Browse articles</a>
          <a href="/intelligence/" class="btn btn--hero-intel">Intelligence Dashboard</a>
          <a href="/research/" class="btn btn--hero-research">Language Science</a>
        </div>
      </div>
    </div>
    <div class="hero-slide">
      <div class="hero-content">
        <h1>The 2026 Global Market Report is here</h1>
        <p class="hero-subtitle">Market sizing, segment-by-segment analysis, AI-era growth drivers, and strategic forecasts &mdash; the definitive view of the language services industry for the year ahead.</p>
        <div class="hero-actions">
          <a href="https://locreport.com/reports/2026-Annual-Global-Market-Report/" class="btn btn--hero-articles btn--lg">Read the 2026 report &rarr;</a>
        </div>
      </div>
    </div>
    <div class="hero-slide">
      <div class="hero-content">
        <h1>Track the forces reshaping the industry</h1>
        <p class="hero-subtitle">Enterprise buyers are consolidating up or going direct-to-AI. This signal tracks what that means for boutique and mid-tier LSPs — and whether their advantages still hold when AI delivers comparable output at a fraction of the cost.</p>
        <div class="hero-actions">
          <a href="/intelligence/#lsp-relevance-erosion" class="btn btn--hero-intel btn--lg">Explore this signal &rarr;</a>
        </div>
      </div>
    </div>
  </div>
  </div>
  <button class="hero-arrow hero-arrow--prev" id="hero-prev" aria-label="Previous slide">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
  </button>
  <button class="hero-arrow hero-arrow--next" id="hero-next" aria-label="Next slide">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
  </button>
  <div class="hero-dots" id="hero-dots" role="tablist" aria-label="Hero slides">
    <button class="hero-dot hero-dot--active" role="tab" aria-selected="true" aria-label="Slide 1" data-index="0"></button>
    <button class="hero-dot" role="tab" aria-selected="false" aria-label="Slide 2" data-index="1"></button>
    <button class="hero-dot" role="tab" aria-selected="false" aria-label="Slide 3" data-index="2"></button>
    <button class="hero-dot" role="tab" aria-selected="false" aria-label="Slide 4" data-index="3"></button>
  </div>
</section>

<script>
(function () {
  var hero    = document.getElementById('hero-section');
  var track   = document.getElementById('hero-track');
  var prevBtn = document.getElementById('hero-prev');
  var nextBtn = document.getElementById('hero-next');
  var dotsEl  = document.getElementById('hero-dots');

  if (!track || !hero) return;

  var slides = track.querySelectorAll('.hero-slide');
  var dots   = dotsEl ? dotsEl.querySelectorAll('.hero-dot') : [];
  var total  = slides.length;
  var cur    = 0;
  var AUTOPLAY_MS = 8000;
  var timer  = null;

  function sliderWidth() { return window.innerWidth; }

  function go(index, animate) {
    if (index < 0) index = 0;
    if (index >= total) index = total - 1;
    cur = index;
    if (animate === false) {
      track.classList.add('hero-slides-track--instant');
    } else {
      track.classList.remove('hero-slides-track--instant');
    }
    track.style.transform = 'translateX(-' + (cur * sliderWidth()) + 'px)';
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('hero-dot--active', i === cur);
      dots[i].setAttribute('aria-selected', i === cur ? 'true' : 'false');
    }
    if (prevBtn) prevBtn.disabled = (cur === 0);
    if (nextBtn) nextBtn.disabled = (cur === total - 1);
    /* restart comma animation from zero whenever slide 2 becomes active */
    var comma = track.querySelector('.hero-comma');
    if (comma && cur === 1) {
      comma.style.animation = 'none';
      comma.offsetWidth; /* force reflow */
      comma.style.animation = '';
    }
  }

  function next() { go(cur < total - 1 ? cur + 1 : 0); }
  function prev() { go(cur > 0 ? cur - 1 : total - 1); }

  function startTimer() { stopTimer(); timer = setInterval(next, AUTOPLAY_MS); }
  function stopTimer()  { if (timer) { clearInterval(timer); timer = null; } }
  function resetTimer() { stopTimer(); startTimer(); }

  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetTimer(); });

  for (var d = 0; d < dots.length; d++) {
    (function (idx) {
      dots[idx].addEventListener('click', function () { go(idx); resetTimer(); });
    })(d);
  }

  /* ── Touch swipe ─────────────────────────────────────── */
  var tStartX = 0, tStartY = 0, tDeltaX = 0;
  var touching = false, horizSwipe = false, dirLocked = false;

  track.addEventListener('touchstart', function (e) {
    tStartX = e.touches[0].clientX;
    tStartY = e.touches[0].clientY;
    tDeltaX = 0;
    touching = true; horizSwipe = false; dirLocked = false;
    track.classList.add('hero-slides-track--instant');
    stopTimer();
  }, { passive: true });

  track.addEventListener('touchmove', function (e) {
    if (!touching) return;
    var dx = e.touches[0].clientX - tStartX;
    var dy = e.touches[0].clientY - tStartY;
    if (!dirLocked) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5) {
        horizSwipe = true; dirLocked = true;
      } else if (Math.abs(dy) > 5) {
        touching = false;
        track.classList.remove('hero-slides-track--instant');
        go(cur);
        return;
      }
    }
    if (!horizSwipe) return;
    e.preventDefault();
    tDeltaX = dx;
    track.style.transform = 'translateX(-' + (cur * sliderWidth() - dx) + 'px)';
  }, { passive: false });

  track.addEventListener('touchend', function () {
    if (!touching || !horizSwipe) { touching = false; return; }
    touching = false;
    track.classList.remove('hero-slides-track--instant');
    var threshold = sliderWidth() * 0.25;
    if (tDeltaX > threshold) go(cur - 1);
    else if (tDeltaX < -threshold) go(cur + 1);
    else go(cur);
    startTimer();
  }, { passive: true });

  /* ── Mouse drag (desktop) ────────────────────────────── */
  var mStartX = 0, mDeltaX = 0, mouseDown = false;

  track.addEventListener('mousedown', function (e) {
    mStartX = e.clientX; mDeltaX = 0;
    mouseDown = true;
    track.classList.add('hero-slides-track--instant');
    track.style.cursor = 'grabbing';
    stopTimer();
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!mouseDown) return;
    mDeltaX = e.clientX - mStartX;
    track.style.transform = 'translateX(-' + (cur * sliderWidth() - mDeltaX) + 'px)';
  });

  document.addEventListener('mouseup', function () {
    if (!mouseDown) return;
    mouseDown = false;
    track.classList.remove('hero-slides-track--instant');
    track.style.cursor = '';
    var threshold = sliderWidth() * 0.15;
    if (mDeltaX > threshold) go(cur - 1);
    else if (mDeltaX < -threshold) go(cur + 1);
    else go(cur);
    startTimer();
  });

  /* ── Keyboard ────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.target && hero.contains(e.target)) {
      if (e.key === 'ArrowLeft')  { prev(); resetTimer(); }
      if (e.key === 'ArrowRight') { next(); resetTimer(); }
    }
  });

  /* ── Resize ──────────────────────────────────────────── */
  window.addEventListener('resize', function () { go(cur, false); });

  /* ── Pause on hover ──────────────────────────────────── */
  hero.addEventListener('mouseenter', stopTimer);
  hero.addEventListener('mouseleave', function () { if (!mouseDown) startTimer(); });

  go(0, false);
  startTimer();
}());
</script>

{% include sources-bar.html %}

<!-- Latest Articles -->
{% comment %}
  Collect all unique days with published content (newest-first).
  Days 0-2 are visible on load; days 3+ carry .day-hidden for bidirectional
  infinite scroll — the JS in default.html reveals/hides them via sentinels.
{% endcomment %}
{% assign _all_days = "" | split: "" %}
{% for post in site.posts %}
  {% unless post.article_type == "theory" %}
    {% assign _pd = post.date | date: "%Y-%m-%d" %}
    {% unless _all_days contains _pd %}
      {% assign _all_days = _all_days | push: _pd %}
    {% endunless %}
  {% endunless %}
{% endfor %}

<div id="feed-top-sentinel" class="autoload-sentinel"></div>
<div id="feed-top-loader" class="autoload-loader">Loading&hellip;</div>

{% for _day in _all_days %}
  {% assign _di = forloop.index0 %}

  {% comment %} Newsletter banner between day 0 and day 1 {% endcomment %}
  {% if _di == 1 %}
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
  {% endif %}

  <section class="day-section{% if _di >= 3 %} day-hidden{% endif %}" data-day-index="{{ _di }}">

  {% comment %} Resolve display date for this day {% endcomment %}
  {% assign _day_display = "" %}
  {% for post in site.posts %}
    {% if post.article_type == "theory" %}{% continue %}{% endif %}
    {% if post.date | date: "%Y-%m-%d" == _day %}
      {% assign _day_display = post.date | date: "%B %d, %Y" %}
      {% break %}
    {% endif %}
  {% endfor %}

  <h2 class="day-header">{{ _day_display }}</h2>

  {% if _di == 0 %}
    {% comment %} Day 0: featured article + grid of remaining {% endcomment %}
    {% assign _d0_first = true %}
    {% for post in site.posts %}
      {% if post.article_type == "theory" %}{% continue %}{% endif %}
      {% unless post.date | date: "%Y-%m-%d" == _day %}{% continue %}{% endunless %}
      {% if _d0_first %}
        {% assign _d0_first = false %}
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
  {% else %}
    {% comment %} Day 1+: grid only {% endcomment %}
    <div class="post-grid reveal-stagger">
      {% for post in site.posts %}
        {% if post.article_type == "theory" %}{% continue %}{% endif %}
        {% unless post.date | date: "%Y-%m-%d" == _day %}{% continue %}{% endunless %}
        <article class="post-card" {% if post.affected_segments %}data-segments="{{ post.affected_segments | join: '|' }}"{% endif %}>
          <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}{% if post.impact_score and post.impact_score >= 3 %}<span class="impact-dot impact-dot--{{ post.impact_score }}" title="Impact: {% if post.impact_score == 3 %}Significant{% elsif post.impact_score == 4 %}Major{% elsif post.impact_score == 5 %}Disruptive{% endif %}"></span>{% endif %}</p>
          <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
          <p>{{ post.excerpt | strip_html | truncate: 140 }}</p>
          <a class="read-more" href="{{ post.url | relative_url }}">Read more &rarr;</a>
        </article>
      {% endfor %}
    </div>
  {% endif %}

  </section>
{% endfor %}

<div id="feed-bottom-loader" class="autoload-loader">Loading more&hellip;</div>
<div id="feed-bottom-sentinel" class="autoload-sentinel"></div>

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
