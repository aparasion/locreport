---
layout: auth
title: My Dashboard
permalink: /dashboard/
description: "Your LocReport dashboard — watched signals, bookmarks, and preferences."
robots: noindex, nofollow
nav: false
no_share: true
---

<div class="dashboard-page">
  <div class="dashboard-header">
    <h1>My Dashboard</h1>
    <p id="dashboard-greeting" class="dashboard-greeting"></p>
  </div>

  <div id="dashboard-upgrade-banner" class="dashboard-upgrade-banner" style="display:none">
    <p>Upgrade to <strong>Premium</strong> to unlock monthly intelligence reports and full signal analytics.</p>
    <a href="/account/" class="btn btn--primary btn--sm">View plans</a>
  </div>

  <section class="dashboard-section">
    <h2 class="dashboard-section__title">Watched Signals</h2>
    <p class="dashboard-section__desc">Signals you're tracking. <a href="/intelligence/signals/">Browse all signals →</a></p>
    <div id="dashboard-signals" class="dashboard-list">Loading&hellip;</div>
  </section>

  <section class="dashboard-section">
    <h2 class="dashboard-section__title">Bookmarks</h2>
    <p class="dashboard-section__desc">Articles you've saved. <a href="/all-articles/">Browse all articles →</a></p>
    <div id="dashboard-bookmarks" class="dashboard-list">Loading&hellip;</div>
  </section>
</div>

<script>
(function () {
  var sb = window._supabase;

  function waitForAuth(cb) {
    if (window.LocAuth && window.LocAuth.ready) { cb(window.LocAuth.user, window.LocAuth.plan); return; }
    var t = setInterval(function () {
      if (window.LocAuth && window.LocAuth.ready) {
        clearInterval(t);
        cb(window.LocAuth.user, window.LocAuth.plan);
      }
    }, 50);
  }

  function renderEmpty(el, msg) {
    el.innerHTML = '<p class="dashboard-empty">' + msg + '</p>';
  }

  waitForAuth(function (user, plan) {
    if (!user) {
      window.location.href = '/login/?next=/dashboard/';
      return;
    }

    var greeting = document.getElementById('dashboard-greeting');
    if (greeting) greeting.textContent = user.email;

    var upgradeBanner = document.getElementById('dashboard-upgrade-banner');
    if (upgradeBanner && plan !== 'premium') upgradeBanner.style.display = '';

    // Load watched signals
    var signalsEl = document.getElementById('dashboard-signals');
    sb.from('watched_signals')
      .select('signal_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(function (result) {
        if (!result.data || result.data.length === 0) {
          renderEmpty(signalsEl, 'No watched signals yet. Visit a signal page and click "Watch this signal".');
          return;
        }
        signalsEl.innerHTML = result.data.map(function (row) {
          var label = row.signal_id.replace(/-/g, ' ');
          return '<a class="dashboard-list-item" href="/intelligence/signals/' + row.signal_id + '/">' + label + '</a>';
        }).join('');
      });

    // Load bookmarks
    var bookmarksEl = document.getElementById('dashboard-bookmarks');
    sb.from('bookmarks')
      .select('article_url, article_title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(function (result) {
        if (!result.data || result.data.length === 0) {
          renderEmpty(bookmarksEl, 'No bookmarks yet. Click the bookmark button on any article to save it here.');
          return;
        }
        bookmarksEl.innerHTML = result.data.map(function (row) {
          var label = row.article_title || row.article_url;
          return '<a class="dashboard-list-item" href="' + row.article_url + '">' + label + '</a>';
        }).join('');
      });
  });
})();
</script>
