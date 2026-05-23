---
layout: auth
title: Account
permalink: /account/
description: "Manage your LocReport account settings."
robots: noindex, nofollow
nav: false
no_share: true
---

<div class="auth-page">
  <div class="auth-card auth-card--wide">
    <h1 class="auth-card__title">Account</h1>

    <div id="account-loading" class="auth-card__subtitle">Loading&hellip;</div>

    <div id="account-content" style="display:none">
      <div class="account-field">
        <label class="auth-label">Email</label>
        <p id="account-email" class="account-value"></p>
      </div>

      <div class="account-field">
        <label class="auth-label">Plan</label>
        <p id="account-plan" class="account-value"></p>
      </div>

      <div class="account-field">
        <label class="auth-label">Member since</label>
        <p id="account-since" class="account-value"></p>
      </div>

      <hr class="account-divider">

      <div class="account-actions">
        <a href="/dashboard/" class="btn btn--secondary">Back to dashboard</a>
        <button id="account-signout-btn" class="btn btn--danger" type="button">Sign out</button>
      </div>
    </div>
  </div>
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

  waitForAuth(function (user, plan) {
    if (!user) {
      window.location.href = '/login/?next=/account/';
      return;
    }

    document.getElementById('account-loading').style.display = 'none';
    document.getElementById('account-content').style.display = '';

    document.getElementById('account-email').textContent = user.email;
    document.getElementById('account-plan').textContent = plan === 'premium' ? 'Premium' : 'Free';

    var created = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
    document.getElementById('account-since').textContent = created;

    var signOutBtn = document.getElementById('account-signout-btn');
    signOutBtn.addEventListener('click', function () {
      sb.auth.signOut().then(function () {
        window.location.href = '/';
      });
    });
  });
})();
</script>
