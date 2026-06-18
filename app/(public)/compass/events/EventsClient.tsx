'use client'
import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import type { Event } from '@/lib/data/events'

interface Props {
  events: Event[]
  today: string
}

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T12:00:00Z')
  const e = new Date(end + 'T12:00:00Z')
  const sm = MONTHS_SHORT[s.getUTCMonth()]
  const sd = s.getUTCDate()
  const sy = s.getUTCFullYear()
  if (start === end) return `${sm} ${sd}, ${sy}`
  const em = MONTHS_SHORT[e.getUTCMonth()]
  const ed = e.getUTCDate()
  if (sm === em) return `${sm} ${sd}–${ed}, ${sy}`
  return `${sm} ${sd} – ${em} ${ed}, ${sy}`
}

function isEventOnDay(ev: Event, year: number, month: number, day: number): boolean {
  const d = new Date(year, month, day)
  const start = new Date(ev.start_date + 'T12:00:00')
  const end = new Date(ev.end_date + 'T12:00:00')
  return d >= start && d <= end
}

// All months that contain at least one event across all events
function getEventMonths(events: Event[]): { year: number; month: number }[] {
  const set = new Set<string>()
  events.forEach(ev => {
    const s = new Date(ev.start_date + 'T12:00:00')
    const e = new Date(ev.end_date + 'T12:00:00')
    const cur = new Date(s.getFullYear(), s.getMonth(), 1)
    while (cur <= e) {
      set.add(`${cur.getFullYear()}-${String(cur.getMonth()).padStart(2, '0')}`)
      cur.setMonth(cur.getMonth() + 1)
    }
  })
  return Array.from(set).sort().map(k => {
    const [y, m] = k.split('-').map(Number)
    return { year: y, month: m }
  })
}

function EventCard({ ev, isPast }: { ev: Event; isPast: boolean }) {
  return (
    <div className={`event-card${isPast ? ' is-past' : ''}`}>
      <div className="event-card-top">
        <span className="event-date">{formatDateRange(ev.start_date, ev.end_date)}</span>
        <span className={`event-badge event-badge--${ev.category}`}>{ev.category}</span>
      </div>
      <h3 className="event-name">
        <Link href={`/compass/events/${ev.slug ?? ev.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {ev.name}
        </Link>
      </h3>
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
        {ev.tags.map(tag => <span key={tag} className="event-tag">{tag}</span>)}
      </div>
      <a href={ev.url} target="_blank" rel="noopener" className="event-link">Learn more →</a>
    </div>
  )
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'conference', label: 'Conferences' },
  { value: 'summit', label: 'Summits' },
]

export function EventsClient({ events, today }: Props) {
  const [filter, setFilter] = useState<string>('all')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    let list = filter === 'all' ? events : events.filter(e => e.category === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [events, filter, query])

  const upcomingEvents = useMemo(
    () => filtered.filter(e => e.end_date >= today).sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [filtered, today]
  )
  const pastEvents = useMemo(
    () => filtered.filter(e => e.end_date < today).sort((a, b) => b.start_date.localeCompare(a.start_date)),
    [filtered, today]
  )

  // All months with events (across unfiltered set so navigation is stable)
  const allMonths = useMemo(() => getEventMonths(events), [events])

  // Default to current month if it has events, else first upcoming
  const todayDate = new Date(today + 'T12:00:00')
  const defaultMonthIdx = useMemo(() => {
    const cur = allMonths.findIndex(m => m.year === todayDate.getFullYear() && m.month === todayDate.getMonth())
    if (cur !== -1) return cur
    const future = allMonths.findIndex(m => new Date(m.year, m.month + 1, 0) >= todayDate)
    return future !== -1 ? future : 0
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMonths])

  const [monthIdx, setMonthIdx] = useState(defaultMonthIdx)
  const { year, month } = allMonths[monthIdx] ?? { year: todayDate.getFullYear(), month: todayDate.getMonth() }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDow = new Date(year, month, 1).getDay()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  // pad to full 6-row grid
  while (cells.length < 42) cells.push(null)

  // Events in current view month (filtered)
  const monthEvents = filtered.filter(ev => {
    const s = new Date(ev.start_date + 'T12:00:00')
    const e = new Date(ev.end_date + 'T12:00:00')
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    return s <= monthEnd && e >= monthStart
  })

  // Deselect if selected event not in this month
  const activeSelected = selectedEvent && monthEvents.some(e => e.id === selectedEvent.id) ? selectedEvent : null

  return (
    <>
      {/* Search */}
      <div className="events-search-wrap">
        <span className="events-search-icon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          ref={searchRef}
          className="events-search-input"
          type="search"
          placeholder="Search events by name, location, or keyword…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search events"
        />
        {query && (
          <button className="events-search-clear" onClick={() => { setQuery(''); searchRef.current?.focus() }} aria-label="Clear search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      <div className="events-toolbar">
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
        <div className="events-view-toggle">
          <button
            className={`events-view-btn${view === 'list' ? ' active' : ''}`}
            onClick={() => setView('list')}
            aria-label="List view"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            List
          </button>
          <button
            className={`events-view-btn${view === 'calendar' ? ' active' : ''}`}
            onClick={() => setView('calendar')}
            aria-label="Calendar view"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Calendar
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div>
          {filtered.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 'var(--space-6)' }}>No events match your search.</p>
          )}

          {upcomingEvents.length > 0 && (
            <div className="events-grid">
              {upcomingEvents.map(ev => (
                <EventCard key={ev.id} ev={ev} isPast={false} />
              ))}
            </div>
          )}

          {pastEvents.length > 0 && (
            <div className="events-past-section">
              <div className="events-past-heading">
                <span>Past Events</span>
              </div>
              <div className="events-grid">
                {pastEvents.map(ev => (
                  <EventCard key={ev.id} ev={ev} isPast={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="cal-view">
          {/* Month navigation header */}
          <div className="cal-header">
            <button
              className="cal-nav-btn"
              onClick={() => { setMonthIdx(i => Math.max(0, i - 1)); setSelectedEvent(null) }}
              disabled={monthIdx === 0}
              aria-label="Previous month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            <div className="cal-header-center">
              <span className="cal-month-label">{MONTHS_FULL[month]} {year}</span>
              <div className="cal-month-pills">
                {allMonths.map((m, i) => (
                  <button
                    key={`${m.year}-${m.month}`}
                    className={`cal-month-pill${i === monthIdx ? ' active' : ''}`}
                    onClick={() => { setMonthIdx(i); setSelectedEvent(null) }}
                  >
                    {MONTHS_SHORT[m.month]}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="cal-nav-btn"
              onClick={() => { setMonthIdx(i => Math.min(allMonths.length - 1, i + 1)); setSelectedEvent(null) }}
              disabled={monthIdx === allMonths.length - 1}
              aria-label="Next month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {/* Calendar grid */}
          <div className="cal-board">
            <div className="cal-dow-row">
              {DOW.map(d => <div key={d} className="cal-dow">{d}</div>)}
            </div>
            <div className="cal-cells">
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} className="cal-cell cal-cell--filler" />
                const cellDate = new Date(year, month, day)
                const isToday = cellDate.toDateString() === todayDate.toDateString()
                const isPast = cellDate < todayDate && !isToday
                const eventsOnDay = filtered.filter(ev => isEventOnDay(ev, year, month, day))
                const hasEvent = eventsOnDay.length > 0
                const isSelected = activeSelected ? eventsOnDay.some(ev => ev.id === activeSelected.id) : false
                return (
                  <div
                    key={day}
                    className={[
                      'cal-cell',
                      isToday ? 'cal-cell--today' : '',
                      isPast ? 'cal-cell--past' : '',
                      hasEvent ? 'cal-cell--has-event' : '',
                      isSelected ? 'cal-cell--selected' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => hasEvent && setSelectedEvent(eventsOnDay[0])}
                  >
                    <span className="cal-day-num">{day}</span>
                    {hasEvent && (
                      <div className="cal-event-pills">
                        {eventsOnDay.map(ev => (
                          <span key={ev.id} className={`cal-event-pill cal-event-pill--${ev.category}`}>
                            {ev.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected event detail */}
          {activeSelected && (
            <div className="cal-detail">
              <button className="cal-detail-close" onClick={() => setSelectedEvent(null)} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <div className="cal-detail-meta">
                <span className={`event-badge event-badge--${activeSelected.category}`}>{activeSelected.category}</span>
                <span className="cal-detail-date">{formatDateRange(activeSelected.start_date, activeSelected.end_date)}</span>
              </div>
              <h3 className="cal-detail-name">
                <Link href={`/compass/events/${activeSelected.slug ?? activeSelected.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {activeSelected.name}
                </Link>
              </h3>
              <p className="cal-detail-organizer">{activeSelected.organizer}</p>
              <div className="cal-detail-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {activeSelected.location}
                <span className="event-format-chip">{activeSelected.format}</span>
              </div>
              <p className="cal-detail-desc">{activeSelected.description}</p>
              <div className="event-tags" style={{ marginTop: 10 }}>
                {activeSelected.tags.map(tag => <span key={tag} className="event-tag">{tag}</span>)}
              </div>
              <a href={activeSelected.url} target="_blank" rel="noopener" className="event-link" style={{ marginTop: 14, display: 'inline-block' }}>
                Learn more →
              </a>
            </div>
          )}

          <div className="cal-legend">
            <span className="cal-legend-item"><span className="cal-legend-swatch cal-legend-swatch--conference" />Conference</span>
            <span className="cal-legend-item"><span className="cal-legend-swatch cal-legend-swatch--summit" />Summit</span>
            <span className="cal-legend-item"><span className="cal-legend-swatch cal-legend-swatch--today" />Today</span>
          </div>
        </div>
      )}
    </>
  )
}
