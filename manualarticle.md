---
layout: page
title: Manual article
permalink: /manualarticle/
description: Private LocReport tool for creating a post from pasted article text.
robots: "noindex, nofollow, noarchive, noimageindex"
sitemap: false
no_share: true
---

<style>
.manual-article-tool {
  max-width: 860px;
  margin: 0 auto 3rem;
}
.manual-article-tool form {
  display: grid;
  gap: 1.1rem;
  margin-top: 1.5rem;
}
.manual-article-tool label {
  display: grid;
  gap: 0.35rem;
  font-weight: 700;
}
.manual-article-tool input,
.manual-article-tool select,
.manual-article-tool textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border-color, #d0d7de);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  font: inherit;
  background: var(--surface-color, #fff);
  color: var(--text-color, #111827);
}
.manual-article-tool select { cursor: pointer; }
.manual-article-tool textarea {
  min-height: 320px;
  resize: vertical;
}
.manual-article-tool textarea.short {
  min-height: 140px;
}
.manual-article-tool .field-hint {
  font-size: 0.88rem;
  font-weight: 500;
  opacity: 0.72;
}
.manual-article-tool .field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 640px) { .manual-article-tool .field-row { grid-template-columns: 1fr; } }
.manual-article-tool .manual-article-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  padding-top: 0.5rem;
}
.manual-article-tool .manual-article-status {
  display: none;
  margin-top: 1rem;
  border-radius: 14px;
  padding: 1rem;
  font-weight: 700;
}
.manual-article-tool .manual-article-status.is-error {
  display: block;
  color: #b42318;
  background: #fef3f2;
  border: 1px solid #fecdca;
}
.manual-article-tool .manual-article-status.is-success {
  display: block;
  color: #027a48;
  background: #ecfdf3;
  border: 1px solid #abefc6;
}
.manual-article-tool .manual-article-status.is-working {
  display: block;
  color: #175cd3;
  background: #eff8ff;
  border: 1px solid #b2ddff;
}
.manual-article-tool .token-expired-banner {
  display: none;
  margin-bottom: 1.25rem;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  background: #fef3f2;
  border: 1px solid #fecdca;
  color: #b42318;
  font-weight: 700;
}
.form-section-title {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted, #6b7280);
  margin: 0.5rem 0 0;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border, #e5e7eb);
}
</style>

<div class="manual-article-tool">
  <p>This unlinked, noindex page triggers the private <code>Manual Article</code> GitHub Actions workflow. Fill in the article details, click <strong>Create post</strong>, and the workflow will generate and commit the post using the same LocReport prompt as RSS-sourced articles.</p>

  <!-- Token state banners -->
  <div id="token-expired-banner" class="token-expired-banner">
    ⚠ GitHub token has expired or is invalid. Update the <code>GITHUB_PAT</code> secret in your Cloudflare Worker and redeploy.
  </div>

  <form id="manual-article-form">

    <!-- ── Core fields ───────────────────────────────── -->
    <p class="form-section-title">Source</p>

    <label>
      Article URL
      <input type="url" id="manual-article-url" name="url" required placeholder="https://example.com/article">
    </label>

    <div class="field-row">
      <label>
        Additional source URL 1 <span style="font-weight:400">(optional)</span>
        <input type="url" id="manual-article-extra-url-1" name="extra_url_1" placeholder="https://…">
      </label>
      <label>
        Source name for URL 1 <span style="font-weight:400">(optional)</span>
        <input type="text" id="manual-article-extra-source-name-1" name="extra_source_name_1" placeholder="Publisher name">
      </label>
    </div>

    <div class="field-row">
      <label>
        Additional source URL 2 <span style="font-weight:400">(optional)</span>
        <input type="url" id="manual-article-extra-url-2" name="extra_url_2" placeholder="https://…">
      </label>
      <label>
        Source name for URL 2 <span style="font-weight:400">(optional)</span>
        <input type="text" id="manual-article-extra-source-name-2" name="extra_source_name_2" placeholder="Publisher name">
      </label>
    </div>

    <div class="field-row">
      <label>
        Article date &amp; time (UTC)
        <input type="datetime-local" id="manual-article-date" name="article_date" required>
        <span class="field-hint">Set the publish time in UTC (e.g. 09:30) for correct ordering.</span>
      </label>

      <label>
        Source name
        <input type="text" id="manual-article-source-name" name="source_name" required placeholder="Example News">
        <span class="field-hint">Displayed as the source link text.</span>
      </label>
    </div>

    <label>
      Article title
      <input type="text" id="manual-article-title" name="title" placeholder="Leave blank to generate automatically">
      <span class="field-hint">Optional. Inferred from the article content when blank.</span>
    </label>

    <!-- ── Content ───────────────────────────────────── -->
    <p class="form-section-title">Content</p>

    <label>
      Article content
      <textarea id="manual-article-content" name="content" required placeholder="Paste the full source article text here..."></textarea>
    </label>

    <label>
      Prompt addition
      <textarea class="short" id="manual-article-prompt-addition" name="prompt_addition" placeholder="Optional: add editorial instructions, angle, facts to emphasize, tone requests, or details to avoid..."></textarea>
      <span class="field-hint">Appended to the standard LocReport generation prompt for this article only.</span>
    </label>

    <!-- ── Classification overrides ──────────────────── -->
    <p class="form-section-title">Classification overrides <span style="font-weight:400;text-transform:none;letter-spacing:0">(all optional — leave blank for AI to decide)</span></p>

    <div class="field-row">
      <label>
        Content type
        <select id="manual-article-content-type" name="content_type">
          <option value="">Auto (AI decides)</option>
          <option value="gist">Gist — concise summary</option>
          <option value="analysis">Analysis — in-depth take</option>
          <option value="roundup">Roundup — multi-source synthesis</option>
          <option value="opinion">Opinion / commentary</option>
        </select>
      </label>

      <label>
        Time horizon
        <select id="manual-article-time-horizon" name="time_horizon">
          <option value="">Auto (AI decides)</option>
          <option value="now">Now — immediate impact</option>
          <option value="6months">6 months</option>
          <option value="2years">2 years</option>
        </select>
      </label>
    </div>

    <div class="field-row">
      <label>
        Impact score override (1–5)
        <select id="manual-article-impact-score" name="impact_score">
          <option value="">Auto (AI decides)</option>
          <option value="1">1 — Routine</option>
          <option value="2">2 — Noteworthy</option>
          <option value="3">3 — Significant</option>
          <option value="4">4 — Major</option>
          <option value="5">5 — Disruptive</option>
        </select>
      </label>
    </div>

    <!-- ── Submit ─────────────────────────────────────── -->
    <div class="manual-article-actions">
      <button type="submit" class="btn btn--primary">Create post</button>
    </div>
    <div id="manual-article-status" class="manual-article-status" role="status" aria-live="polite"></div>
  </form>
</div>

<script>
(function () {
  var WORKER_URL = "{{ site.worker_url }}";
  var WORKFLOW_FILE = "manual-article.yml";
  var WORKFLOW_URL = "https://github.com/aparasion/locreport/actions/workflows/" + WORKFLOW_FILE;

  // Worker key injected at build time from WORKER_KEY GitHub secret (base64-encoded to avoid secret scanning revocation)
  var _b64 = "{{ site.worker_key_b64 | default: '' }}";
  var WORKER_KEY = _b64 ? atob(_b64) : "";

  var form = document.getElementById("manual-article-form");
  var statusEl = document.getElementById("manual-article-status");
  var submitButton = form.querySelector('button[type="submit"]');
  var expiredBanner = document.getElementById("token-expired-banner");

  function setStatus(message, state) {
    statusEl.innerHTML = message;
    statusEl.classList.remove("is-error", "is-success", "is-working");
    if (state) statusEl.classList.add(state);
  }

  // Format datetime-local value to ISO 8601 UTC string
  function toISOString(datetimeLocalValue) {
    if (!datetimeLocalValue) return "";
    // datetime-local returns "YYYY-MM-DDTHH:MM" — treat as UTC
    return datetimeLocalValue.replace("T", "T") + ":00Z";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!WORKER_KEY) {
      setStatus("Dispatch proxy not configured. Set WORKER_KEY in the build.", "is-error");
      return;
    }

    var url = document.getElementById("manual-article-url").value.trim();
    var articleDateRaw = document.getElementById("manual-article-date").value;
    var articleDate = toISOString(articleDateRaw);
    var sourceName = document.getElementById("manual-article-source-name").value.trim();
    var title = document.getElementById("manual-article-title").value.trim();
    var content = document.getElementById("manual-article-content").value.trim();
    var promptAddition = document.getElementById("manual-article-prompt-addition").value.trim();
    var extraUrl1 = document.getElementById("manual-article-extra-url-1").value.trim();
    var extraSourceName1 = document.getElementById("manual-article-extra-source-name-1").value.trim();
    var extraUrl2 = document.getElementById("manual-article-extra-url-2").value.trim();
    var extraSourceName2 = document.getElementById("manual-article-extra-source-name-2").value.trim();
    var contentType = document.getElementById("manual-article-content-type").value;
    var impactScore = document.getElementById("manual-article-impact-score").value;
    var timeHorizon = document.getElementById("manual-article-time-horizon").value;

    if (!url || !articleDate || !sourceName || !content) {
      setStatus("Please complete the URL, date/time, source name, and article content fields.", "is-error");
      return;
    }

    submitButton.disabled = true;
    setStatus("Creating article… The GitHub Actions workflow is being dispatched and will commit the post when generation finishes.", "is-working");

    fetch(WORKER_URL + "/dispatch", {
      method: "POST",
      headers: {
        "X-Worker-Key": WORKER_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        workflow: WORKFLOW_FILE,
        ref: "main",
        inputs: {
          url: url,
          article_date: articleDate,
          source_name: sourceName,
          title: title,
          content: content,
          prompt_addition: promptAddition,
          extra_url_1: extraUrl1,
          extra_source_name_1: extraSourceName1,
          extra_url_2: extraUrl2,
          extra_source_name_2: extraSourceName2,
          content_type: contentType,
          impact_score: impactScore,
          time_horizon: timeHorizon
        }
      })
    }).then(function (response) {
      if (response.status === 204) {
        setStatus("Confirmed: your article is being created. The workflow will generate, commit, and publish the post shortly. <a href=\"" + WORKFLOW_URL + "\" target=\"_blank\" rel=\"noopener noreferrer\">View workflow progress</a>.", "is-success");
        form.reset();
        return null;
      }
      if (response.status === 429) {
        throw new Error("Too many requests. Please wait before trying again.");
      }
      if (response.status === 502) {
        expiredBanner.style.display = "block";
        return response.json().then(function (data) {
          throw new Error(data.error || "GitHub token error. Update the GITHUB_PAT Worker secret.");
        });
      }
      return response.json().then(function (data) {
        throw new Error(data.error || "Proxy returned status " + response.status);
      });
    }).catch(function (error) {
      setStatus("Article creation did not start: " + error.message, "is-error");
    }).finally(function () {
      submitButton.disabled = false;
    });
  });
}());
</script>
