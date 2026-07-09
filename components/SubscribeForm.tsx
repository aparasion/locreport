'use client'

import { useState } from 'react'

// Inline email capture for the digest — homepage band, article footers,
// and the intelligence dashboard.
export function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error ?? 'Something went wrong — please try again.')
        setStatus('error')
        return
      }
      setMessage(data.message ?? 'Check your inbox to confirm your subscription.')
      setStatus('sent')
      setEmail('')
    } catch {
      setMessage('Something went wrong — please try again.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className={`subscribe-form${compact ? ' subscribe-form--compact' : ''}`}>
        <p className="subscribe-form__confirm" role="status">✓ {message}</p>
      </div>
    )
  }

  return (
    <form className={`subscribe-form${compact ? ' subscribe-form--compact' : ''}`} onSubmit={submit}>
      <div className="subscribe-form__row">
        <input
          type="email"
          className="subscribe-form__input"
          placeholder="you@company.com"
          aria-label="Email address"
          autoComplete="email"
          required
          value={email}
          onChange={e => { setEmail(e.target.value); setStatus('idle') }}
        />
        <button type="submit" className="btn btn--primary subscribe-form__btn" disabled={status === 'sending'}>
          {status === 'sending' ? 'Subscribing…' : 'Get the digest'}
        </button>
      </div>
      {status === 'error' && <p className="subscribe-form__error" role="alert">{message}</p>}
      {!compact && (
        <p className="subscribe-form__note">
          Weekly intelligence digest — impact-ranked stories mapped to the signals we track. Free, unsubscribe anytime.
        </p>
      )}
    </form>
  )
}
