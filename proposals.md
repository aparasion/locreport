---
layout: page
title: Signal Proposals
permalink: /proposals/
description: "Propose a new localization signal, vote on community ideas, and help decide what LocReport tracks next."
nav: true
nav_order: 6
---

<div class="proposal-intro">
  <p>Submit a signal hypothesis you want tracked. After a quick editorial verification, your proposal is published publicly with your name and open to voting.</p>
  <ul>
    <li>✅ Human verification before publication</li>
    <li>✅ Community ranking with thumbs up/down</li>
    <li>✅ Automatic promotion when a proposal reaches <strong>10+ upvotes</strong> and strong score</li>
    <li>✅ Original proposer attribution is preserved on promoted signals</li>
  </ul>
</div>

<section class="proposal-section">
  <h2>Propose a Signal</h2>
  <form id="proposal-form" class="proposal-form">
    <div class="form-group">
      <label for="proposal-name">Your name</label>
      <input id="proposal-name" name="submitted_by_name" maxlength="120" required placeholder="Jane Doe">
    </div>
    <div class="form-group">
      <label for="proposal-email">Email (optional, private)</label>
      <input id="proposal-email" type="email" name="submitted_by_email" maxlength="200" placeholder="jane@example.com">
    </div>
    <div class="form-group">
      <label for="proposal-title">Signal title</label>
      <input id="proposal-title" name="title" maxlength="200" required placeholder="Example: AI quality benchmarking will become procurement standard">
    </div>
    <div class="form-group">
      <label for="proposal-category">Category</label>
      <select id="proposal-category" name="category" required>
        <option value="quality">Quality</option>
        <option value="operations">Operations</option>
        <option value="governance">Governance</option>
        <option value="market">Market</option>
        <option value="strategy">Strategy</option>
      </select>
    </div>
    <div class="form-group">
      <label for="proposal-hypothesis">Hypothesis (what should be tracked?)</label>
      <textarea id="proposal-hypothesis" name="hypothesis" maxlength="500" rows="4" required placeholder="Tracks whether..."></textarea>
    </div>
    <div class="form-group">
      <label for="proposal-links">Evidence links (optional, up to 3, one per line)</label>
      <textarea id="proposal-links" name="evidence_links" rows="3" placeholder="https://..."></textarea>
    </div>
    <button class="btn-submit" type="submit">Submit for verification</button>
    <p id="proposal-submit-message" class="proposal-message" role="status" aria-live="polite"></p>
  </form>
</section>

<section class="proposal-section">
  <div class="proposal-section-head">
    <h2>Community Ranking</h2>
    <button id="proposal-refresh" type="button" class="proposal-refresh">Refresh</button>
  </div>
  <p class="proposal-muted">Ranked by score, then upvotes. Voting is one vote per person per proposal (latest vote wins).</p>
  <div id="proposal-list" class="proposal-list"></div>
</section>

<section class="proposal-section proposal-admin">
  <h2>Moderator Review</h2>
  <p class="proposal-muted">For editors: set your admin token to review pending submissions.</p>
  <div class="proposal-admin-controls">
    <input id="proposal-admin-token" type="password" placeholder="Admin token">
    <button id="proposal-load-pending" type="button">Load pending</button>
  </div>
  <div id="proposal-pending" class="proposal-list"></div>
</section>

<script>
(function () {
  var API_BASE = window.LOCREPORT_PROPOSAL_API || "http://127.0.0.1:8787";
  var form = document.getElementById("proposal-form");
  var messageEl = document.getElementById("proposal-submit-message");
  var listEl = document.getElementById("proposal-list");
  var refreshBtn = document.getElementById("proposal-refresh");
  var adminTokenEl = document.getElementById("proposal-admin-token");
  var loadPendingBtn = document.getElementById("proposal-load-pending");
  var pendingEl = document.getElementById("proposal-pending");

  function escapeHtml(str) {
    return (str || "").replace(/[&<>\"']/g, function (s) {
      return ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[s];
    });
  }

  function api(path, opts) {
    return fetch(API_BASE + path, Object.assign({
      headers: {"Content-Type": "application/json"}
    }, opts || {})).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          throw new Error(data.error || "Request failed");
        }
        return data;
      });
    });
  }

  function voteButton(proposalId, voteType, label) {
    return '<button class="proposal-vote" data-proposal-id="' + proposalId + '" data-vote="' + voteType + '">' + label + '</button>';
  }

  function renderProposalCard(p, showModeration) {
    var links = (p.evidence_links || []).map(function (url) {
      return '<li><a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(url) + '</a></li>';
    }).join("");

    var moderation = "";
    if (showModeration) {
      moderation = '<div class="proposal-moderation">' +
        '<button data-moderate="approve" data-proposal-id="' + p.id + '">Approve</button>' +
        '<button data-moderate="reject" data-proposal-id="' + p.id + '">Reject</button>' +
      '</div>';
    }

    var promotion = p.promoted_signal_id
      ? '<div class="proposal-promotion">Promoted to signal: <code>' + escapeHtml(p.promoted_signal_id) + '</code></div>'
      : "";

    return '<article class="proposal-card" data-proposal-id="' + p.id + '">' +
      '<header class="proposal-card-head">' +
        '<h3>' + escapeHtml(p.title) + '</h3>' +
        '<span class="proposal-status proposal-status--' + escapeHtml(p.status) + '">' + escapeHtml(p.status) + '</span>' +
      '</header>' +
      '<p class="proposal-meta">By <strong>' + escapeHtml(p.submitted_by_name) + '</strong> · Category: ' + escapeHtml(p.category) + '</p>' +
      '<p>' + escapeHtml(p.hypothesis) + '</p>' +
      (links ? '<ul class="proposal-links">' + links + '</ul>' : '') +
      '<div class="proposal-votes">' +
        '<span class="proposal-score">Score: <strong>' + p.score + '</strong> (👍 ' + p.upvotes + ' / 👎 ' + p.downvotes + ')</span>' +
        voteButton(p.id, 'up', '👍 Upvote') +
        voteButton(p.id, 'down', '👎 Downvote') +
      '</div>' +
      promotion + moderation +
    '</article>';
  }

  function loadPublished() {
    listEl.innerHTML = '<p class="proposal-muted">Loading proposals…</p>';
    api('/api/proposals?status=published&limit=200').then(function (data) {
      var promoted = api('/api/proposals?status=promoted&limit=200');
      return Promise.all([Promise.resolve(data), promoted]);
    }).then(function (results) {
      var published = results[0].proposals || [];
      var promoted = results[1].proposals || [];
      var all = published.concat(promoted);
      if (!all.length) {
        listEl.innerHTML = '<p class="proposal-muted">No verified proposals published yet.</p>';
        return;
      }
      listEl.innerHTML = all.map(function (p) { return renderProposalCard(p, false); }).join('');
    }).catch(function (err) {
      listEl.innerHTML = '<p class="proposal-error">Could not load proposals: ' + escapeHtml(err.message) + '</p>';
    });
  }

  function vote(proposalId, vote) {
    var voterId = localStorage.getItem('locreport_proposal_voter_id');
    if (!voterId) {
      voterId = 'v-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('locreport_proposal_voter_id', voterId);
    }

    api('/api/proposals/' + proposalId + '/vote', {
      method: 'POST',
      body: JSON.stringify({ vote: vote, voter_id: voterId })
    }).then(function (data) {
      if (data.promotion && data.promotion.signal_id) {
        alert('This proposal was promoted to signal: ' + data.promotion.signal_id);
      }
      loadPublished();
    }).catch(function (err) {
      alert('Vote failed: ' + err.message);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    messageEl.textContent = 'Submitting…';
    var payload = {
      submitted_by_name: form.submitted_by_name.value,
      submitted_by_email: form.submitted_by_email.value,
      title: form.title.value,
      category: form.category.value,
      hypothesis: form.hypothesis.value,
      evidence_links: form.evidence_links.value
    };

    api('/api/proposals', {
      method: 'POST',
      body: JSON.stringify(payload)
    }).then(function () {
      form.reset();
      messageEl.textContent = 'Submitted. Your proposal is now pending editorial verification.';
      loadPublished();
    }).catch(function (err) {
      messageEl.textContent = 'Submission failed: ' + err.message;
    });
  });

  listEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.proposal-vote');
    if (!btn) return;
    vote(btn.getAttribute('data-proposal-id'), btn.getAttribute('data-vote'));
  });

  function loadPending() {
    var token = adminTokenEl.value.trim();
    if (!token) {
      alert('Admin token is required.');
      return;
    }

    api('/api/proposals/pending', {
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token
      }
    }).then(function (data) {
      if (!(data.proposals || []).length) {
        pendingEl.innerHTML = '<p class="proposal-muted">No pending proposals.</p>';
        return;
      }
      pendingEl.innerHTML = data.proposals.map(function (p) { return renderProposalCard(p, true); }).join('');
    }).catch(function (err) {
      pendingEl.innerHTML = '<p class="proposal-error">Failed to load pending list: ' + escapeHtml(err.message) + '</p>';
    });
  }

  function moderate(proposalId, action) {
    var token = adminTokenEl.value.trim();
    if (!token) {
      alert('Admin token is required.');
      return;
    }
    api('/api/proposals/' + proposalId + '/moderate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token
      },
      body: JSON.stringify({ action: action })
    }).then(function () {
      loadPending();
      loadPublished();
    }).catch(function (err) {
      alert('Moderation failed: ' + err.message);
    });
  }

  pendingEl.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-moderate]');
    if (!btn) return;
    moderate(btn.getAttribute('data-proposal-id'), btn.getAttribute('data-moderate'));
  });

  refreshBtn.addEventListener('click', loadPublished);
  loadPendingBtn.addEventListener('click', loadPending);
  loadPublished();
})();
</script>
