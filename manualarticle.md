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
.manual-article-tool .signal-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.4rem 1rem;
  margin-top: 0.35rem;
}
.manual-article-tool .signal-checkboxes label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
}
.manual-article-tool .signal-checkboxes input[type="checkbox"] {
  width: auto;
  flex-shrink: 0;
  margin-top: 0.15rem;
  padding: 0;
  border-radius: 4px;
}
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
.manual-article-tool .token-banner {
  margin-bottom: 1.25rem;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}
.manual-article-tool .token-banner strong {
  display: block;
  margin-bottom: 0.4rem;
}
.manual-article-tool .token-banner .token-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
}
.manual-article-tool .token-banner input[type="password"] {
  flex: 1 1 260px;
  border: 1px solid #fbbf24;
  border-radius: 10px;
  padding: 0.55rem 0.85rem;
  font: inherit;
  background: #fff;
  color: #111827;
  min-width: 0;
}
.manual-article-tool .token-ok-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  border-radius: 14px;
  padding: 0.75rem 1.25rem;
  background: #ecfdf3;
  border: 1px solid #abefc6;
  color: #027a48;
  font-weight: 700;
  font-size: 0.95rem;
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
    ⚠ GitHub token has expired or is invalid. Please generate a new PAT at <strong>github.com → Settings → Developer settings → Personal access tokens</strong> and update the <code>MANUAL_ARTICLE_TOKEN</code> repository secret, then redeploy the site.
  </div>

  <div id="token-missing-banner" class="token-banner" style="display:none">
    <strong>GitHub token required</strong>
    A classic GitHub PAT with the <code>workflow</code> scope is needed to dispatch the workflow. The token is stored only in your browser's <code>localStorage</code> and never sent anywhere except the GitHub API.<br>
    <small>Create one at <strong>github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)</strong> → Generate new token → tick <code>workflow</code>.</small>
    <div class="token-row">
      <input type="password" id="token-input" placeholder="ghp_…" autocomplete="off" spellcheck="false">
      <button type="button" class="btn btn--primary" id="token-save-btn">Save token</button>
    </div>
  </div>
  <div id="token-ok-banner" class="token-ok-banner" style="display:none">
    <span>&#10003; GitHub token configured.</span>
    <button type="button" class="btn btn--secondary" id="token-clear-btn" style="margin-left:auto;font-size:0.85rem">Clear token</button>
  </div>

  <form id="manual-article-form">

    <!-- ── Core fields ───────────────────────────────── -->
    <p class="form-section-title">Source</p>

    <label>
      Article URL
      <input type="url" id="manual-article-url" name="url" required placeholder="https://example.com/article">
    </label>

    <label>
      Additional source URL 1 <span style="font-weight:400">(optional)</span>
      <input type="url" id="manual-article-extra-url-1" name="extra_url_1" placeholder="https://…">
    </label>

    <label>
      Additional source URL 2 <span style="font-weight:400">(optional)</span>
      <input type="url" id="manual-article-extra-url-2" name="extra_url_2" placeholder="https://…">
    </label>

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

    <div>
      <span class="form-section-title" style="border-top:none;padding-top:0">Signal tags <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional — overrides AI inference)</span></span>
      <div class="signal-checkboxes" id="signal-checkboxes">
        {% for signal in site.data.signals %}
        <label>
          <input type="checkbox" class="signal-checkbox" value="{{ signal.id }}">
          <span>{{ signal.title | truncate: 60 }}</span>
        </label>
        {% endfor %}
      </div>
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
  var REPOSITORY = "aparasion/locreport";
  var BRANCH = "main";
  var WORKFLOW_FILE = "manual-article.yml";
  var WORKFLOW_URL = "https://github.com/" + REPOSITORY + "/actions/workflows/" + WORKFLOW_FILE;
  var LS_KEY = "manualArticleToken";

  // Token injected at build time from MANUAL_ARTICLE_TOKEN GitHub secret
  var BUILD_TOKEN = "{{ site.manual_article_token | default: '' }}";

  var form = document.getElementById("manual-article-form");
  var statusEl = document.getElementById("manual-article-status");
  var submitButton = form.querySelector('button[type="submit"]');
  var missingBanner = document.getElementById("token-missing-banner");
  var okBanner = document.getElementById("token-ok-banner");
  var expiredBanner = document.getElementById("token-expired-banner");
  var tokenInput = document.getElementById("token-input");
  var saveBtn = document.getElementById("token-save-btn");
  var clearBtn = document.getElementById("token-clear-btn");

  function getToken() {
    return BUILD_TOKEN || window.LOCREPORT_MANUAL_ARTICLE_TOKEN || localStorage.getItem(LS_KEY) || "";
  }

  function refreshTokenUI() {
    var token = getToken();
    if (token) {
      missingBanner.style.display = "none";
      okBanner.style.display = "flex";
    } else {
      missingBanner.style.display = "block";
      okBanner.style.display = "none";
    }
  }

  saveBtn.addEventListener("click", function () {
    var val = tokenInput.value.trim();
    if (!val) return;
    localStorage.setItem(LS_KEY, val);
    tokenInput.value = "";
    expiredBanner.style.display = "none";
    refreshTokenUI();
  });

  tokenInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); saveBtn.click(); }
  });

  clearBtn.addEventListener("click", function () {
    localStorage.removeItem(LS_KEY);
    refreshTokenUI();
  });

  refreshTokenUI();

  function setStatus(message, state) {
    statusEl.innerHTML = message;
    statusEl.classList.remove("is-error", "is-success", "is-working");
    if (state) statusEl.classList.add(state);
  }

  function getSelectedSignalIds() {
    var checked = document.querySelectorAll(".signal-checkbox:checked");
    return Array.from(checked).map(function (cb) { return cb.value; }).join(",");
  }

  // Format datetime-local value to ISO 8601 UTC string
  function toISOString(datetimeLocalValue) {
    if (!datetimeLocalValue) return "";
    // datetime-local returns "YYYY-MM-DDTHH:MM" — treat as UTC
    return datetimeLocalValue.replace("T", "T") + ":00Z";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var token = getToken();
    if (!token) {
      setStatus("No GitHub token found. Use the token field above to save your PAT.", "is-error");
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
    var extraUrl2 = document.getElementById("manual-article-extra-url-2").value.trim();
    var contentType = document.getElementById("manual-article-content-type").value;
    var impactScore = document.getElementById("manual-article-impact-score").value;
    var timeHorizon = document.getElementById("manual-article-time-horizon").value;
    var signalIds = getSelectedSignalIds();

    if (!url || !articleDate || !sourceName || !content) {
      setStatus("Please complete the URL, date/time, source name, and article content fields.", "is-error");
      return;
    }

    submitButton.disabled = true;
    setStatus("Creating article… The GitHub Actions workflow is being dispatched and will commit the post when generation finishes.", "is-working");

    fetch("https://api.github.com/repos/" + REPOSITORY + "/actions/workflows/" + WORKFLOW_FILE + "/dispatches", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({
        ref: BRANCH,
        inputs: {
          url: url,
          article_date: articleDate,
          source_name: sourceName,
          title: title,
          content: content,
          prompt_addition: promptAddition,
          extra_url_1: extraUrl1,
          extra_url_2: extraUrl2,
          content_type: contentType,
          signal_ids: signalIds,
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
      if (response.status === 401) {
        expiredBanner.style.display = "block";
        return response.text().then(function () {
          throw new Error("GitHub token is expired or invalid (HTTP 401). Update the MANUAL_ARTICLE_TOKEN secret and redeploy the site.");
        });
      }
      return response.text().then(function (body) {
        throw new Error(body || "GitHub returned status " + response.status);
      });
    }).catch(function (error) {
      setStatus("Article creation did not start: " + error.message, "is-error");
    }).finally(function () {
      submitButton.disabled = false;
    });
  });
}());
</script>
