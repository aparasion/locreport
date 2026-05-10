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
.manual-article-tool details {
  border: 1px solid var(--border-color, #d0d7de);
  border-radius: 12px;
  padding: 1rem;
}
.manual-article-tool summary {
  cursor: pointer;
  font-weight: 800;
}
.manual-article-tool .manual-article-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}
.manual-article-tool .manual-article-status {
  min-height: 1.5rem;
  font-weight: 700;
}
.manual-article-tool .manual-article-status.is-error {
  color: #b42318;
}
.manual-article-tool .manual-article-status.is-success {
  color: #027a48;
}
</style>

<div class="manual-article-tool">
  <p>This unlinked, noindex page triggers the private <code>Manual Article</code> GitHub Actions workflow. The workflow uses the same LocReport generation prompt as RSS-sourced articles, commits the generated post, and lets the normal Pages deployment publish it.</p>

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
      Article content
      <textarea id="manual-article-content" name="content" required placeholder="Paste the source article text here..."></textarea>
    </label>

    <details>
      <summary>Publishing access</summary>
      <p>Use a GitHub token that can dispatch workflows for this repository. The token is sent directly to GitHub from your browser and is not stored by this page.</p>
      <label>
        GitHub token
        <input type="password" id="manual-article-token" autocomplete="off" required placeholder="github_pat_...">
      </label>
      <label>
        Repository
        <input type="text" id="manual-article-repo" value="aparasion/locreport" required>
      </label>
      <label>
        Branch
        <input type="text" id="manual-article-ref" value="main" required>
      </label>
    </details>

    <div class="manual-article-actions">
      <button type="submit" class="btn btn--primary">Create post</button>
      <span id="manual-article-status" class="manual-article-status" role="status" aria-live="polite"></span>
    </div>
  </form>
</div>

<script>
(function () {
  var form = document.getElementById("manual-article-form");
  var statusEl = document.getElementById("manual-article-status");
  var repoEl = document.getElementById("manual-article-repo");
  var refEl = document.getElementById("manual-article-ref");

  function setStatus(message, state) {
    statusEl.textContent = message;
    statusEl.classList.remove("is-error", "is-success");
    if (state) {
      statusEl.classList.add(state);
    }
  }

  repoEl.value = localStorage.getItem("manualArticleRepo") || repoEl.value;
  refEl.value = localStorage.getItem("manualArticleRef") || refEl.value;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var token = document.getElementById("manual-article-token").value.trim();
    var repo = repoEl.value.trim();
    var ref = refEl.value.trim() || "main";
    var url = document.getElementById("manual-article-url").value.trim();
    var articleDate = document.getElementById("manual-article-date").value;
    var content = document.getElementById("manual-article-content").value.trim();

    if (!token || !repo || !url || !articleDate || !content) {
      setStatus("Please complete every required field.", "is-error");
      return;
    }

    localStorage.setItem("manualArticleRepo", repo);
    localStorage.setItem("manualArticleRef", ref);
    setStatus("Dispatching workflow...", "");

    fetch("https://api.github.com/repos/" + encodeURIComponent(repo).replace("%2F", "/") + "/actions/workflows/manual-article.yml/dispatches", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({
        ref: ref,
        inputs: {
          url: url,
          article_date: articleDate,
          content: content
        }
      })
    }).then(function (response) {
      if (response.status === 204) {
        setStatus("Workflow dispatched. Check GitHub Actions for progress.", "is-success");
        form.reset();
        repoEl.value = repo;
        refEl.value = ref;
        return null;
      }
      return response.text().then(function (body) {
        throw new Error(body || "GitHub returned status " + response.status);
      });
    }).catch(function (error) {
      setStatus("Dispatch failed: " + error.message, "is-error");
    });
  });
}());
</script>
