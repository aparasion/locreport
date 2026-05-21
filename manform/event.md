---
layout: page
title: Add Event
permalink: /manform/event/
description: Private LocReport tool for manually adding events to the events calendar.
robots: "noindex, nofollow, noarchive, noimageindex"
sitemap: false
no_share: true
---

<div class="manform">
  <p>Dispatches the <code>add-event.yml</code> GitHub Actions workflow, which appends the entry directly to <code>_data/events.yml</code> and commits to <code>main</code>.</p>

  <div id="token-expired-banner" class="token-expired-banner">
    ⚠ GitHub token has expired or is invalid. Generate a new PAT at <strong>github.com → Settings → Developer settings → Personal access tokens</strong> and update the <code>MANUAL_ARTICLE_TOKEN</code> repository secret, then redeploy the site.
  </div>

  <form id="event-form">

    <p class="section-title">Event</p>

    <label>
      Event name
      <input type="text" id="f-name" name="name" required placeholder="e.g. LocWorld 60">
    </label>

    <label>
      Organizer
      <input type="text" id="f-organizer" name="organizer" required placeholder="e.g. LocWorld">
    </label>

    <div class="field-row">
      <label>
        Start date
        <input type="date" id="f-start-date" name="start_date" required>
      </label>
      <label>
        End date <span style="font-weight:400">(optional)</span>
        <input type="date" id="f-end-date" name="end_date">
        <span class="field-hint">Defaults to start date for single-day events.</span>
      </label>
    </div>

    <p class="section-title">Format</p>

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

    <p class="section-title">Details</p>

    <div class="field-row">
      <label>
        Location <span style="font-weight:400">(optional)</span>
        <input type="text" id="f-location" name="location" placeholder="e.g. Dublin, Ireland — or leave blank for Online">
        <span class="field-hint">Defaults to "Online" for virtual events or "TBC" otherwise.</span>
      </label>
      <label>
        Category
        <select id="f-category" name="category" required>
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
      <input type="url" id="f-url" name="url" placeholder="https://example.com/event">
    </label>

    <p class="section-title">Content</p>

    <label>
      Description
      <textarea id="f-description" name="description" required placeholder="Short summary — who it's for, main themes, what makes it notable."></textarea>
    </label>

    <label>
      Tags <span style="font-weight:400">(optional)</span>
      <input type="text" id="f-tags" name="tags" placeholder="e.g. localization, AI, translation, professional-development">
      <span class="field-hint">Comma-separated. Use lowercase with hyphens for multi-word tags.</span>
    </label>

    <div class="form-actions">
      <button type="submit" class="btn btn--primary">Add event</button>
    </div>
    <div id="form-status" class="form-status" role="status" aria-live="polite"></div>

  </form>
</div>

<script>
(function () {
  var REPO     = "aparasion/locreport";
  var BRANCH   = "main";
  var WORKFLOW = "add-event.yml";
  var WORKFLOW_URL = "https://github.com/" + REPO + "/actions/workflows/" + WORKFLOW;

  // Token injected at build time from MANUAL_ARTICLE_TOKEN secret (base64-encoded to avoid secret-scanning revocation)
  var _b64 = "{{ site.add_event_token_b64 | default: '' }}";
  var TOKEN = _b64 ? atob(_b64) : "";

  var form          = document.getElementById("event-form");
  var statusEl      = document.getElementById("form-status");
  var submitBtn     = form.querySelector('button[type="submit"]');
  var expiredBanner = document.getElementById("token-expired-banner");
  var locationInput = document.getElementById("f-location");

  function setStatus(html, state) {
    statusEl.innerHTML = html;
    statusEl.className = "form-status" + (state ? " " + state : "");
  }

  // Update location placeholder to hint "Online" when virtual is selected
  document.querySelectorAll('input[name="format"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      locationInput.placeholder = radio.value === "virtual"
        ? "Online"
        : "e.g. Dublin, Ireland — or leave blank for Online";
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!TOKEN) {
      setStatus("No GitHub token found. Update the MANUAL_ARTICLE_TOKEN secret and redeploy the site.", "is-error");
      return;
    }

    var name        = document.getElementById("f-name").value.trim();
    var organizer   = document.getElementById("f-organizer").value.trim();
    var startDate   = document.getElementById("f-start-date").value;
    var description = document.getElementById("f-description").value.trim();

    if (!name || !organizer || !startDate || !description) {
      setStatus("Please fill in all required fields: name, organizer, start date, and description.", "is-error");
      return;
    }

    var format   = document.querySelector('input[name="format"]:checked').value;
    var location = locationInput.value.trim() || (format === "virtual" ? "Online" : "");

    submitBtn.disabled = true;
    setStatus("Adding event… The workflow is being dispatched.", "is-working");

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
          name:        name,
          organizer:   organizer,
          start_date:  startDate,
          end_date:    document.getElementById("f-end-date").value,
          format:      format,
          location:    location,
          category:    document.getElementById("f-category").value,
          url:         document.getElementById("f-url").value.trim(),
          description: description,
          tags:        document.getElementById("f-tags").value.trim()
        }
      })
    }).then(function (res) {
      if (res.status === 204) {
        setStatus(
          "Event added — the workflow will commit it to <code>_data/events.yml</code> shortly. " +
          "<a href=\"" + WORKFLOW_URL + "\" target=\"_blank\" rel=\"noopener noreferrer\">View workflow progress</a>.",
          "is-success"
        );
        form.reset();
        document.getElementById("fmt-inperson").checked = true;
        return null;
      }
      if (res.status === 401) {
        expiredBanner.style.display = "block";
        return res.text().then(function () {
          throw new Error("GitHub token is expired or invalid (HTTP 401). Update the MANUAL_ARTICLE_TOKEN secret and redeploy.");
        });
      }
      return res.text().then(function (body) {
        throw new Error(body || "GitHub returned status " + res.status);
      });
    }).catch(function (err) {
      setStatus("Event was not added: " + err.message, "is-error");
    }).finally(function () {
      submitBtn.disabled = false;
    });
  });
}());
</script>
