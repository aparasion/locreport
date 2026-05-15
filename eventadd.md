---
layout: page
title: Add Event
permalink: /eventadd/
description: Private LocReport tool for manually adding events to the events calendar.
robots: "noindex, nofollow, noarchive, noimageindex"
sitemap: false
no_share: true
---

<style>
.event-add-tool {
  max-width: 860px;
  margin: 0 auto 3rem;
}
.event-add-tool form {
  display: grid;
  gap: 1.1rem;
  margin-top: 1.5rem;
}
.event-add-tool label {
  display: grid;
  gap: 0.35rem;
  font-weight: 700;
}
.event-add-tool input,
.event-add-tool select,
.event-add-tool textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border-color, #d0d7de);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  font: inherit;
  background: var(--surface-color, #fff);
  color: var(--text-color, #111827);
}
.event-add-tool select { cursor: pointer; }
.event-add-tool textarea {
  min-height: 140px;
  resize: vertical;
}
.event-add-tool .field-hint {
  font-size: 0.88rem;
  font-weight: 500;
  opacity: 0.72;
}
.event-add-tool .field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 640px) { .event-add-tool .field-row { grid-template-columns: 1fr; } }
.event-add-tool .event-add-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  padding-top: 0.5rem;
}
.event-add-tool .event-add-status {
  display: none;
  margin-top: 1rem;
  border-radius: 14px;
  padding: 1rem;
  font-weight: 700;
}
.event-add-tool .event-add-status.is-error {
  display: block;
  color: #b42318;
  background: #fef3f2;
  border: 1px solid #fecdca;
}
.event-add-tool .event-add-status.is-success {
  display: block;
  color: #027a48;
  background: #ecfdf3;
  border: 1px solid #abefc6;
}
.event-add-tool .event-add-status.is-working {
  display: block;
  color: #175cd3;
  background: #eff8ff;
  border: 1px solid #b2ddff;
}
.event-add-tool .token-expired-banner {
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
.format-toggle {
  display: flex;
  gap: 0;
  border: 1px solid var(--border-color, #d0d7de);
  border-radius: 12px;
  overflow: hidden;
}
.format-toggle input[type="radio"] {
  display: none;
}
.format-toggle label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  background: var(--surface-color, #fff);
  color: var(--text-color, #111827);
  border-right: 1px solid var(--border-color, #d0d7de);
  transition: background 0.15s, color 0.15s;
  gap: 0.4rem;
}
.format-toggle label:last-of-type {
  border-right: none;
}
.format-toggle input[type="radio"]:checked + label {
  background: #111827;
  color: #fff;
}
</style>

<div class="event-add-tool">
  <p>This unlinked, noindex page dispatches the <strong>Add Event</strong> GitHub Actions workflow, which appends the entry directly to <code>_data/events.yml</code> and commits to <code>main</code>.</p>

  <div id="token-expired-banner" class="token-expired-banner">
    ⚠ GitHub token has expired or is invalid. Please generate a new PAT at <strong>github.com → Settings → Developer settings → Personal access tokens</strong> and update the <code>MANUAL_ARTICLE_TOKEN</code> repository secret, then redeploy the site.
  </div>

  <form id="event-add-form">

    <!-- ── Event details ─────────────────────────────── -->
    <p class="form-section-title">Event</p>

    <label>
      Event name
      <input type="text" id="ea-name" name="name" required placeholder="e.g. LocWorld 60">
    </label>

    <label>
      Organizer
      <input type="text" id="ea-organizer" name="organizer" required placeholder="e.g. LocWorld">
    </label>

    <div class="field-row">
      <label>
        Start date
        <input type="date" id="ea-start-date" name="start_date" required>
      </label>
      <label>
        End date <span style="font-weight:400">(optional)</span>
        <input type="date" id="ea-end-date" name="end_date">
        <span class="field-hint">Defaults to start date for single-day events.</span>
      </label>
    </div>

    <!-- ── Format ────────────────────────────────────── -->
    <p class="form-section-title">Format</p>

    <div>
      <div class="format-toggle" role="radiogroup" aria-label="Event format">
        <input type="radio" name="format" id="fmt-inperson" value="in-person" checked>
        <label for="fmt-inperson">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          In-person
        </label>
        <input type="radio" name="format" id="fmt-virtual" value="virtual">
        <label for="fmt-virtual">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          Virtual
        </label>
        <input type="radio" name="format" id="fmt-hybrid" value="hybrid">
        <label for="fmt-hybrid">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Hybrid
        </label>
      </div>
    </div>

    <!-- ── Location & category ───────────────────────── -->
    <p class="form-section-title">Details</p>

    <div class="field-row">
      <label>
        Location <span style="font-weight:400">(optional)</span>
        <input type="text" id="ea-location" name="location" placeholder="e.g. Dublin, Ireland — or leave blank for Online">
        <span class="field-hint">Leave blank to default to "Online" for virtual events or "TBC" otherwise.</span>
      </label>

      <label>
        Category
        <select id="ea-category" name="category" required>
          <option value="conference">Conference</option>
          <option value="summit">Summit</option>
          <option value="forum">Forum</option>
          <option value="congress">Congress</option>
          <option value="webinar">Webinar</option>
          <option value="workshop">Workshop</option>
        </select>
      </label>
    </div>

    <label>
      Event website URL <span style="font-weight:400">(optional)</span>
      <input type="url" id="ea-url" name="url" placeholder="https://example.com/event">
    </label>

    <!-- ── Content ───────────────────────────────────── -->
    <p class="form-section-title">Content</p>

    <label>
      Description
      <textarea id="ea-description" name="description" required placeholder="Short summary of the event — who it's for, main themes, what makes it notable."></textarea>
    </label>

    <label>
      Tags <span style="font-weight:400">(optional)</span>
      <input type="text" id="ea-tags" name="tags" placeholder="e.g. localization, AI, translation, professional-development">
      <span class="field-hint">Comma-separated. Use lowercase with hyphens for multi-word tags.</span>
    </label>

    <!-- ── Submit ────────────────────────────────────── -->
    <div class="event-add-actions">
      <button type="submit" class="btn btn--primary">Add event</button>
    </div>
    <div id="event-add-status" class="event-add-status" role="status" aria-live="polite"></div>
  </form>
</div>

<script>
(function () {
  var REPOSITORY = "aparasion/locreport";
  var BRANCH = "main";
  var WORKFLOW_FILE = "add-event.yml";
  var WORKFLOW_URL = "https://github.com/" + REPOSITORY + "/actions/workflows/" + WORKFLOW_FILE;

  var _b64 = "{{ site.add_event_token_b64 | default: '' }}";
  var BUILD_TOKEN = _b64 ? atob(_b64) : "";

  var form = document.getElementById("event-add-form");
  var statusEl = document.getElementById("event-add-status");
  var submitButton = form.querySelector('button[type="submit"]');
  var expiredBanner = document.getElementById("token-expired-banner");

  function getToken() {
    return BUILD_TOKEN;
  }

  // Auto-set location hint based on format
  var locationInput = document.getElementById("ea-location");
  document.querySelectorAll('input[name="format"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      if (radio.value === "virtual" && !locationInput.value) {
        locationInput.placeholder = "Online";
      } else {
        locationInput.placeholder = "e.g. Dublin, Ireland — or leave blank for Online";
      }
    });
  });

  function setStatus(message, state) {
    statusEl.innerHTML = message;
    statusEl.className = "event-add-status" + (state ? " " + state : "");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var token = getToken();
    if (!token) {
      setStatus("No GitHub token found. Use the token field above to save your PAT.", "is-error");
      return;
    }

    var name = document.getElementById("ea-name").value.trim();
    var organizer = document.getElementById("ea-organizer").value.trim();
    var startDate = document.getElementById("ea-start-date").value;
    var endDate = document.getElementById("ea-end-date").value;
    var format = document.querySelector('input[name="format"]:checked').value;
    var location = document.getElementById("ea-location").value.trim();
    var category = document.getElementById("ea-category").value;
    var url = document.getElementById("ea-url").value.trim();
    var description = document.getElementById("ea-description").value.trim();
    var tags = document.getElementById("ea-tags").value.trim();

    if (!name || !organizer || !startDate || !description) {
      setStatus("Please fill in the required fields: name, organizer, start date, and description.", "is-error");
      return;
    }

    // Default location for virtual events
    if (!location && format === "virtual") {
      location = "Online";
    }

    submitButton.disabled = true;
    setStatus("Adding event… The GitHub Actions workflow is being dispatched.", "is-working");

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
          name: name,
          organizer: organizer,
          start_date: startDate,
          end_date: endDate,
          location: location,
          format: format,
          category: category,
          url: url,
          description: description,
          tags: tags
        }
      })
    }).then(function (response) {
      if (response.status === 204) {
        setStatus(
          "Event added. The workflow will commit it to <code>_data/events.yml</code> and publish shortly. " +
          "<a href=\"" + WORKFLOW_URL + "\" target=\"_blank\" rel=\"noopener noreferrer\">View workflow progress</a>.",
          "is-success"
        );
        form.reset();
        document.getElementById("fmt-inperson").checked = true;
        return null;
      }
      if (response.status === 401) {
        expiredBanner.style.display = "block";
        return response.text().then(function () {
          throw new Error("GitHub token is expired or invalid (HTTP 401). Update the MANUAL_ARTICLE_TOKEN secret and redeploy.");
        });
      }
      return response.text().then(function (body) {
        throw new Error(body || "GitHub returned status " + response.status);
      });
    }).catch(function (error) {
      setStatus("Event was not added: " + error.message, "is-error");
    }).finally(function () {
      submitButton.disabled = false;
    });
  });
}());
</script>
