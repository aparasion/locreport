---
layout: auth
title: Sign In
permalink: /login/
description: "Sign in to your LocReport account."
robots: noindex, nofollow
nav: false
no_share: true
---

<div class="auth-page">
  <div class="auth-card">
    <h1 class="auth-card__title">Sign in to LocReport</h1>
    <p class="auth-card__subtitle">Enter your email and we'll send you a magic link — no password needed.</p>

    <div id="auth-magic-form">
      <label class="auth-label" for="auth-email-input">Email address</label>
      <input type="email" id="auth-email-input" class="auth-input" placeholder="your@email.com" autocomplete="email" autofocus>
      <button id="auth-magic-btn" class="btn btn--primary auth-btn" type="button">Send magic link</button>
    </div>

    <div id="auth-magic-success" class="auth-success" style="display:none">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      <p>Check your inbox — a sign-in link is on its way.</p>
    </div>

    <div id="auth-message" class="auth-message" style="display:none"></div>

    <p class="auth-card__footer">
      By signing in you agree to our <a href="/privacy/">Privacy Policy</a>.
    </p>
  </div>
</div>

<script>
(function () {
  var sb = window._supabase;
  if (!sb) return;

  // Redirect if already signed in
  sb.auth.getSession().then(function (result) {
    var session = result.data && result.data.session;
    if (session) {
      var params = new URLSearchParams(window.location.search);
      var next = params.get('next') || '/dashboard/';
      window.location.href = next;
    }
  });

  var emailInput = document.getElementById('auth-email-input');
  var magicBtn   = document.getElementById('auth-magic-btn');
  var formEl     = document.getElementById('auth-magic-form');
  var successEl  = document.getElementById('auth-magic-success');
  var msgEl      = document.getElementById('auth-message');

  function showError(msg) {
    msgEl.textContent = msg;
    msgEl.style.display = '';
  }

  magicBtn.addEventListener('click', function () {
    var email = emailInput.value.trim();
    if (!email) { showError('Please enter your email address.'); return; }

    msgEl.style.display = 'none';
    magicBtn.disabled = true;
    magicBtn.textContent = 'Sending…';

    var params = new URLSearchParams(window.location.search);
    var next = params.get('next') || '/dashboard/';
    var redirectTo = window.location.origin + next;

    sb.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: redirectTo }
    }).then(function (result) {
      if (result.error) {
        showError(result.error.message);
        magicBtn.disabled = false;
        magicBtn.textContent = 'Send magic link';
      } else {
        formEl.style.display = 'none';
        successEl.style.display = '';
      }
    });
  });

  emailInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') magicBtn.click();
  });
})();
</script>
