'use client'
import { useState } from 'react'
import type { Event } from '@/lib/data/events'

interface Props {
  events: Event[]
  today: string
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T12:00:00Z')
  const e = new Date(end + 'T12:00:00Z')
  const sm = MONTHS[s.getUTCMonth()]
  const sd = s.getUTCDate()
  const sy = s.getUTCFullYear()
  if (start === end) return `${sm} ${sd}, ${sy}`
  const em = MONTHS[e.getUTCMonth()]
  const ed = e.getUTCDate()
  if (sm === em) return `${sm} ${sd}–${ed}, ${sy}`
  return `${sm} ${sd} – ${em} ${ed}, ${sy}`
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'conference', label: 'Conferences' },
  { value: 'summit', label: 'Summits' },
]

export function EventsClient({ events, today }: Props) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter)

  return (
    <>
      <div className="events-filter-bar">
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`events-filter-btn${filter === f.value ? ' active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="events-grid">
        {filtered.map(ev => {
          const isPast = ev.end_date < today
          return (
            <div key={ev.id} className={`event-card${isPast ? ' is-past' : ''}`}>
              <div className="event-card-top">
                <span className="event-date">{formatDateRange(ev.start_date, ev.end_date)}</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span className={`event-badge event-badge--${ev.category}`}>{ev.category}</span>
                  {isPast && <span className="event-badge event-badge--past">Past</span>}
                </div>
              </div>
              <h3 className="event-name">{ev.name}</h3>
              <p className="event-organizer">{ev.organizer}</p>
              <div className="event-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {ev.location}
                <span style={{ marginLeft: 6, fontSize: '0.72rem', fontWeight: 600, padding: '1px 6px', background: 'var(--bg-secondary)', borderRadius: '100px', color: 'var(--muted)' }}>
                  {ev.format}
                </span>
              </div>
              <p className="event-desc">
                {ev.description.length > 220 ? ev.description.slice(0, 220) + '…' : ev.description}
              </p>
              <div className="event-tags">
                {ev.tags.map(tag => (
                  <span key={tag} className="event-tag">{tag}</span>
                ))}
              </div>
              <a href={ev.url} target="_blank" rel="noopener" className="event-link">
                Learn more →
              </a>
            </div>
          )
        })}
      </div>
    </>
  )
}
