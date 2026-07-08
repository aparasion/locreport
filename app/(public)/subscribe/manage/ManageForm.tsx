'use client'

import { useState } from 'react'
import { SIGNALS } from '@/lib/signals'

interface Prefs {
  signal_prefs: string[]
  min_impact: number
  frequency: string
}

export default function ManageForm({ token, initial }: { token: string; initial: Prefs }) {
  const [signalPrefs, setSignalPrefs] = useState<string[]>(initial.signal_prefs)
  const [minImpact, setMinImpact] = useState(initial.min_impact)
  const [frequency, setFrequency] = useState(initial.frequency)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'unsubscribed' | 'error'>('idle')

  function toggleSignal(id: string) {
    setSignalPrefs(prev => (prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]))
    setStatus('idle')
  }

  async function save() {
    setStatus('saving')
    try {
      const res = await fetch('/api/subscribe/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, signal_prefs: signalPrefs, min_impact: minImpact, frequency }),
      })
      setStatus(res.ok ? 'saved' : 'error')
    } catch {
      setStatus('error')
    }
  }

  async function unsubscribe() {
    setStatus('saving')
    try {
      const res = await fetch('/api/subscribe/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, unsubscribe: true }),
      })
      setStatus(res.ok ? 'unsubscribed' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'unsubscribed') {
    return (
      <p className="subscribe-status__text">
        You’ve been unsubscribed. You can re-activate anytime by saving
        preferences from this page or subscribing again.
      </p>
    )
  }

  return (
    <div className="manage-form">
      <section className="manage-form__section">
        <h2 className="manage-form__heading">Signals</h2>
        <p className="manage-form__hint">
          Pick the trends you want covered. Leave everything unchecked to receive all signals.
        </p>
        <div className="manage-form__signals">
          {SIGNALS.map(s => (
            <label key={s.id} className="manage-form__signal">
              <input
                type="checkbox"
                checked={signalPrefs.includes(s.id)}
                onChange={() => toggleSignal(s.id)}
              />
              <span>
                <span className="manage-form__signal-title">{s.title}</span>
                <span className="manage-form__signal-cat">{s.category}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="manage-form__section">
        <h2 className="manage-form__heading">Minimum impact</h2>
        <p className="manage-form__hint">Only include stories at or above this impact level.</p>
        <select
          className="filter-select"
          value={minImpact}
          onChange={e => { setMinImpact(parseInt(e.target.value, 10)); setStatus('idle') }}
        >
          <option value={1}>All stories</option>
          <option value={2}>Notable and above</option>
          <option value={3}>Significant and above</option>
          <option value={4}>Major and above</option>
          <option value={5}>Disruptive only</option>
        </select>
      </section>

      <section className="manage-form__section">
        <h2 className="manage-form__heading">Frequency</h2>
        <select
          className="filter-select"
          value={frequency}
          onChange={e => { setFrequency(e.target.value); setStatus('idle') }}
        >
          <option value="weekly">Weekly (Mondays)</option>
          <option value="daily">Daily</option>
        </select>
      </section>

      <div className="manage-form__actions">
        <button className="btn btn--primary" onClick={save} disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save preferences'}
        </button>
        <button className="btn btn--ghost manage-form__unsub" onClick={unsubscribe} disabled={status === 'saving'}>
          Unsubscribe
        </button>
      </div>
      {status === 'saved' && <p className="manage-form__status" role="status">Preferences saved.</p>}
      {status === 'error' && <p className="manage-form__status manage-form__status--error" role="alert">Something went wrong — please try again.</p>}
    </div>
  )
}
