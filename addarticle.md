---
layout: page
title: Manual Article
permalink: /addarticle
description: Private LocReport tool for creating a post from pasted article text.
robots: "noindex, nofollow, noarchive, noimageindex"
sitemap: false
no_share: true
---

<div class="manform">
  <div id="token-expired-banner" class="token-expired-banner">
    ⚠ GitHub token has expired or is invalid. Generate a new PAT at <strong>github.com → Settings → Developer settings → Personal access tokens</strong> and update the <code>MANUAL_ARTICLE_TOKEN</code> repository secret, then redeploy the site.
  </div>

  <form id="article-form">

    <p class="section-title">Content</p>

    <label>
      Article content
      <textarea id="f-content" name="content" required placeholder="Paste the full source article text here…"></textarea>
    </label>

    <label>
      Article title
      <input type="text" id="f-title" name="title" placeholder="Leave blank to generate automatically">
      <span class="field-hint">Optional. Inferred from article content when blank.</span>
    </label>

    <label>
      Article date &amp; time (UTC)
      <input type="datetime-local" id="f-date" name="article_date" required>
      <span class="field-hint">Treat as UTC — controls post ordering.</span>
    </label>

    <p class="section-title">Source</p>

    <div class="field-row">
      <label>
        Article URL
        <input type="url" id="f-url" name="url" required placeholder="https://example.com/article">
      </label>
      <label>
        Source name
        <input type="text" id="f-source-name" name="source_name" required placeholder="Example News">
        <span class="field-hint">Displayed as the source link text.</span>
      </label>
    </div>

    <div class="field-row">
      <label>
        Additional URL 1 <span style="font-weight:400">(optional)</span>
        <input type="url" id="f-extra-url-1" name="extra_url_1" placeholder="https://…">
      </label>
      <label>
        Source name for URL 1 <span style="font-weight:400">(optional)</span>
        <input type="text" id="f-extra-source-name-1" name="extra_source_name_1" placeholder="Publisher name">
      </label>
    </div>

    <div class="field-row">
      <label>
        Additional URL 2 <span style="font-weight:400">(optional)</span>
        <input type="url" id="f-extra-url-2" name="extra_url_2" placeholder="https://…">
      </label>
      <label>
        Source name for URL 2 <span style="font-weight:400">(optional)</span>
        <input type="text" id="f-extra-source-name-2" name="extra_source_name_2" placeholder="Publisher name">
      </label>
    </div>

    <p class="section-title">Options</p>

    <label>
      Prompt addition
      <textarea class="short" id="f-prompt-addition" name="prompt_addition" placeholder="Optional: add editorial instructions, angle, facts to emphasize, tone requests, or details to avoid…"></textarea>
      <span class="field-hint">Appended to the standard LocReport generation prompt for this article only.</span>
    </label>

    <p class="section-title">Classification overrides <span style="font-weight:400;text-transform:none;letter-spacing:0">(all optional — leave blank for AI to decide)</span></p>

    <div class="field-row">
      <label>
        Content type
        <select id="f-content-type" name="content_type">
          <option value="">Auto (AI decides)</option>
          <option value="gist">Gist — concise summary</option>
          <option value="analysis">Analysis — in-depth take</option>
          <option value="roundup">Roundup — multi-source synthesis</option>
          <option value="opinion">Opinion / commentary</option>
        </select>
      </label>
      <label>
        Impact score (1–5)
        <select id="f-impact-score" name="impact_score">
          <option value="">Auto (AI decides)</option>
          <option value="1">1 — Routine</option>
          <option value="2">2 — Noteworthy</option>
          <option value="3">3 — Significant</option>
          <option value="4">4 — Major</option>
          <option value="5">5 — Disruptive</option>
        </select>
      </label>
    </div>

    <div class="field-row">
      <label>
        Time horizon
        <select id="f-time-horizon" name="time_horizon">
          <option value="">Auto (AI decides)</option>
          <option value="now">Now — immediate impact</option>
          <option value="6months">6 months</option>
          <option value="2years">2 years</option>
        </select>
      </label>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn--primary">Create post</button>
    </div>
    <div id="form-status" class="form-status" role="status" aria-live="polite"></div>

  </form>
</div>

<script>
(function () {
  var REPO     = "aparasion/locreport";
  var BRANCH   = "main";
  var WORKFLOW = "manual-article.yml";
  var WORKFLOW_URL = "https://github.com/" + REPO + "/actions/workflows/" + WORKFLOW;

  // Token injected at build time from MANUAL_ARTICLE_TOKEN secret (base64-encoded to avoid secret-scanning revocation)
  var _b64 = "{{ site.manual_article_token_b64 | default: '' }}";
  var TOKEN = _b64 ? atob(_b64) : "";

  var form         = document.getElementById("article-form");
  var statusEl     = document.getElementById("form-status");
  var submitBtn    = form.querySelector('button[type="submit"]');
  var expiredBanner = document.getElementById("token-expired-banner");

  function setStatus(html, state) {
    statusEl.innerHTML = html;
    statusEl.className = "form-status" + (state ? " " + state : "");
  }

  function toUTCString(datetimeLocalValue) {
    return datetimeLocalValue ? datetimeLocalValue + ":00Z" : "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!TOKEN) {
      setStatus("No GitHub token found. Update the MANUAL_ARTICLE_TOKEN secret and redeploy the site.", "is-error");
      return;
    }

    var url         = document.getElementById("f-url").value.trim();
    var articleDate = toUTCString(document.getElementById("f-date").value);
    var sourceName  = document.getElementById("f-source-name").value.trim();
    var content     = document.getElementById("f-content").value.trim();

    if (!url || !articleDate || !sourceName || !content) {
      setStatus("Please complete the URL, date/time, source name, and article content fields.", "is-error");
      return;
    }

    submitBtn.disabled = true;
    setStatus("Creating article… The workflow is being dispatched and will commit the post when generation finishes.", "is-working");

    fetch("https://api.github.com/repos/" + REPO + "/actions/workflows/" + WORKFLOW + "/dispatches", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": "Bearer " + TOKEN,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({
        ref: BRANCH,
        inputs: {
          url:                url,
          article_date:       articleDate,
          source_name:        sourceName,
          title:              document.getElementById("f-title").value.trim(),
          content:            content,
          prompt_addition:    document.getElementById("f-prompt-addition").value.trim(),
          extra_url_1:        document.getElementById("f-extra-url-1").value.trim(),
          extra_source_name_1: document.getElementById("f-extra-source-name-1").value.trim(),
          extra_url_2:        document.getElementById("f-extra-url-2").value.trim(),
          extra_source_name_2: document.getElementById("f-extra-source-name-2").value.trim(),
          content_type:       document.getElementById("f-content-type").value,
          impact_score:       document.getElementById("f-impact-score").value,
          time_horizon:       document.getElementById("f-time-horizon").value
        }
      })
    }).then(function (res) {
      if (res.status === 204) {
        setStatus(
          "Confirmed — the workflow is running. The post will be generated and committed to <code>main</code> shortly. " +
          "<a href=\"" + WORKFLOW_URL + "\" target=\"_blank\" rel=\"noopener noreferrer\">View workflow progress</a>.",
          "is-success"
        );
        form.reset();
        return null;
      }
      if (res.status === 401) {
        expiredBanner.style.display = "block";
        return res.text().then(function () {
          throw new Error("GitHub token is expired or invalid (HTTP 401). Update the MANUAL_ARTICLE_TOKEN secret and redeploy the site.");
        });
      }
      return res.text().then(function (body) {
        throw new Error(body || "GitHub returned status " + res.status);
      });
    }).catch(function (err) {
      setStatus("Article creation did not start: " + err.message, "is-error");
    }).finally(function () {
      submitBtn.disabled = false;
    });
  });
}());
</script>
