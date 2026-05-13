---
layout: page
title: Contact
permalink: /contact/
description: "Contact LocReport with tips, corrections, or contribution ideas for localization industry coverage."
nav: false
nav_order: 6
no_share: true
---

<form action="https://api.web3forms.com/submit"
      method="POST"
      class="contact-form">

  <input type="hidden" name="access_key" value="3682508f-78d3-479e-a85c-14b2082ca963">
  <input type="hidden" name="redirect" value="https://locreport.com/thank-you/">

  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" name="name" id="name" required>
  </div>

  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" name="email" id="email">
  </div>

  <div class="form-group">
    <label for="subject">Subject</label>
    <textarea name="subject" id="subject" rows="2" required></textarea>
  </div>

  <div class="form-group">
    <label for="message">Message</label>
    <textarea name="message" id="message" rows="6" required></textarea>
  </div>

  <button type="submit" class="btn-submit">
    Send Message
  </button>
</form>

