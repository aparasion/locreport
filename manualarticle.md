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
  max-width: 820px;
  margin: 0 auto 3rem;
}
.manual-article-tool form {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}
.manual-article-tool label {
  display: grid;
  gap: 0.35rem;
  font-weight: 700;
}
.manual-article-tool input,
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
.manual-article-tool textarea {
  min-height: 320px;
  resize: vertical;
}
.manual-article-tool textarea.manual-article-prompt {
  min-height: 140px;
}
.manual-article-tool .field-hint {
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.72;
}
.manual-article-tool .manual-article-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
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
</style>

<div class="manual-article-tool">
  <p>This unlinked, noindex page triggers the private <code>Manual Article</code> GitHub Actions workflow. Paste the article details, click <strong>Create post</strong>, and the workflow will generate and commit the post using the same LocReport prompt as RSS-sourced articles.</p>

  <div id="token-missing-banner" class="token-banner" style="display:none">
    <strong>GitHub token required</strong>
    A fine-grained or classic GitHub PAT with <code>workflow</code> scope is needed to dispatch the workflow. The token is stored only in your browser's <code>localStorage</code> and never sent anywhere except the GitHub API.
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
    <label>
      Article URL
      <input type="url" id="manual-article-url" name="url" required placeholder="https://example.com/article">
    </label>

    <label>
      Article date
      <input type="date" id="manual-article-date" name="article_date" required>
    </label>

    <label>
      Source name
      <input type="text" id="manual-article-source-name" name="source_name" required placeholder="Example News">
      <span class="field-hint">This text is used for the final source link.</span>
    </label>

    <label>
      Article content
      <textarea id="manual-article-content" name="content" required placeholder="Paste the source article text here..."></textarea>
    </label>

    <label>
      Prompt addition
      <textarea class="manual-article-prompt" id="manual-article-prompt-addition" name="prompt_addition" placeholder="Optional: add editorial instructions, angle, facts to emphasize, tone requests, or details to avoid..."></textarea>
      <span class="field-hint">Optional instructions are appended to the standard LocReport generation prompt for this article only.</span>
    </label>

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

  var form = document.getElementById("manual-article-form");
  var statusEl = document.getElementById("manual-article-status");
  var submitButton = form.querySelector('button[type="submit"]');
  var missingBanner = document.getElementById("token-missing-banner");
  var okBanner = document.getElementById("token-ok-banner");
  var tokenInput = document.getElementById("token-input");
  var saveBtn = document.getElementById("token-save-btn");
  var clearBtn = document.getElementById("token-clear-btn");

  function getToken() {
    return window.LOCREPORT_MANUAL_ARTICLE_TOKEN || localStorage.getItem(LS_KEY) || "";
  }

  function refreshTokenUI() {
    if (getToken()) {
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

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var token = getToken();
    if (!token) {
      setStatus("No GitHub token found. Use the token field above to save your PAT.", "is-error");
      return;
    }

    var url = document.getElementById("manual-article-url").value.trim();
    var articleDate = document.getElementById("manual-article-date").value;
    var sourceName = document.getElementById("manual-article-source-name").value.trim();
    var content = document.getElementById("manual-article-content").value.trim();
    var promptAddition = document.getElementById("manual-article-prompt-addition").value.trim();

    if (!url || !articleDate || !sourceName || !content) {
      setStatus("Please complete the URL, date, source name, and article content fields.", "is-error");
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
          content: content,
          prompt_addition: promptAddition
        }
      })
    }).then(function (response) {
      if (response.status === 204) {
        setStatus("Confirmed: your article is being created. The workflow will generate, commit, and publish the post shortly. <a href=\"" + WORKFLOW_URL + "\" target=\"_blank\" rel=\"noopener noreferrer\">View workflow progress</a>.", "is-success");
        form.reset();
        return null;
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
