'use client'

import { useState } from 'react'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [emailError, setEmailError] = useState('')

  function handleEmailBlur(e: React.FocusEvent<HTMLInputElement>) {
    const val = e.target.value
    if (val && !emailPattern.test(val)) {
      setEmailError('Please enter a valid email address.')
    } else {
      setEmailError('')
    }
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (emailError && emailPattern.test(e.target.value)) {
      setEmailError('')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value

    if (email && !emailPattern.test(email)) {
      setEmailError('Please enter a valid email address.')
      setStatus('idle')
      return
    }

    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email,
      subject: (form.elements.namedItem('subject') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Something went wrong')
      }

      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <article className="page-prose">
        <h1>Contact</h1>
        <p>Have a tip, correction, or want to contribute? Use the form below to get in touch.</p>

        {status === 'success' ? (
          <p style={{ color: 'var(--accent)', fontWeight: 600, marginTop: 'var(--space-6)' }}>
            Message sent — thanks for reaching out!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" name="name" id="name" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                onBlur={handleEmailBlur}
                onChange={handleEmailChange}
              />
              {emailError && (
                <span style={{ color: 'red', fontSize: '0.8rem' }}>{emailError}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input type="text" name="subject" id="subject" required />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea name="message" id="message" rows={6} required />
            </div>

            {status === 'error' && (
              <p style={{ color: 'red', fontSize: '0.9rem' }}>{errorMsg}</p>
            )}

            <button type="submit" className="btn-submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </article>
    </div>
  )
}
