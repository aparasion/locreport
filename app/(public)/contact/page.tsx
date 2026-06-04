import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — LocReport',
  description: 'Contact LocReport with tips, corrections, or contribution ideas for localization industry coverage.',
}

export default function ContactPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <article className="page-prose">
        <h1>Contact</h1>
        <p>Have a tip, correction, or want to contribute? Use the form below to get in touch.</p>

        <form
          action="https://api.web3forms.com/submit"
          method="POST"
          className="contact-form"
        >
          <input type="hidden" name="access_key" value="3682508f-78d3-479e-a85c-14b2082ca963" />
          <input type="hidden" name="redirect" value="https://locreport.com/thank-you/" />

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" name="name" id="name" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <textarea name="subject" id="subject" rows={2} required />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea name="message" id="message" rows={6} required />
          </div>

          <button type="submit" className="btn-submit">
            Send Message
          </button>
        </form>
      </article>
    </div>
  )
}
