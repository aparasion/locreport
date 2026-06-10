'use client'
import { useState } from 'react'
import type { Event } from '@/lib/data/events'

interface Props {
  events: Event[]
  today: string
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DOW = ['Su','Mo','Tu','We','Th','Fr','Sa']

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

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function isEventOnDay(ev: Event, year: number, month: number, day: number): boolean {
  const d = new Date(year, month, day)
  const start = new Date(ev.start_date + 'T12:00:00')
  const end = new Date(ev.end_date + 'T12:00:00')
  return d >= start && d <= end
}

interface MonthCalendarProps {
  year: number
  month: number
  events: Event[]
  today: string
  onSelectEvent: (ev: Event) => void
  selectedEvent: Event | null
}

function MonthCalendar({ year, month, events, today, onSelectEvent, selectedEvent }: MonthCalendarProps) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfWeek(year, month)
  const todayDate = new Date(today + 'T12:00:00')

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="cal-month">
      <div className="cal-month-title">{FULL_MONTHS[month]} {year}</div>
      <div className="cal-grid">
        {DOW.map(d => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />
          const cellDate = new Date(year, month, day)
          const isToday = cellDate.toDateString() === todayDate.toDateString()
          const isPast = cellDate < todayDate && !isToday
          const eventsOnDay = events.filter(ev => isEventOnDay(ev, year, month, day))
          const hasEvent = eventsOnDay.length > 0
          const isSelected = selectedEvent ? eventsOnDay.some(ev => ev.id === selectedEvent.id) : false
          return (
            <div
              key={day}
              className={`cal-cell${isToday ? ' cal-cell--today' : ''}${isPast ? ' cal-cell--past' : ''}${hasEvent ? ' cal-cell--has-event' : ''}${isSelected ? ' cal-cell--selected' : ''}`}
              onClick={() => hasEvent && onSelectEvent(eventsOnDay[0])}
              title={eventsOnDay.map(e => e.name).join(', ')}
            >
              <span className="cal-day-num">{day}</span>
              {hasEvent && (
                <span className="cal-dots">
                  {eventsOnDay.slice(0, 3).map(ev => (
                    <span key={ev.id} className={`cal-dot cal-dot--${ev.category}`} />
                  ))}
                </span>
              )}
            </div>
          )
        })}
      </div>
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

  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter)

  // Gather unique year-month combos that have events
  const monthSet = new Set<string>()
  filtered.forEach(ev => {
    const s = new Date(ev.start_date + 'T12:00:00')
    const e = new Date(ev.end_date + 'T12:00:00')
    const cur = new Date(s.getFullYear(), s.getMonth(), 1)
    while (cur <= e) {
      monthSet.add(`${cur.getFullYear()}-${cur.getMonth()}`)
      cur.setMonth(cur.getMonth() + 1)
    }
  })
  const months = Array.from(monthSet).sort().map(key => {
    const [y, m] = key.split('-').map(Number)
    return { year: y, month: m }
  })

  return (
    <>
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
            title="List view"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            List
          </button>
          <button
            className={`events-view-btn${view === 'calendar' ? ' active' : ''}`}
            onClick={() => setView('calendar')}
            aria-label="Calendar view"
            title="Calendar view"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Calendar
          </button>
        </div>
      </div>

      {view === 'list' ? (
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
      ) : (
        <div className="cal-view">
          <div className="cal-months">
            {months.map(({ year, month }) => (
              <MonthCalendar
                key={`${year}-${month}`}
                year={year}
                month={month}
                events={filtered}
                today={today}
                onSelectEvent={setSelectedEvent}
                selectedEvent={selectedEvent}
              />
            ))}
          </div>

          {selectedEvent && (
            <div className="cal-detail">
              <button className="cal-detail-close" onClick={() => setSelectedEvent(null)} aria-label="Close">✕</button>
              <div className="cal-detail-date">{formatDateRange(selectedEvent.start_date, selectedEvent.end_date)}</div>
              <h3 className="cal-detail-name">{selectedEvent.name}</h3>
              <p className="cal-detail-organizer">{selectedEvent.organizer}</p>
              <div className="cal-detail-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {selectedEvent.location}
                <span style={{ marginLeft: 6, fontSize: '0.72rem', fontWeight: 600, padding: '1px 6px', background: 'var(--bg-secondary)', borderRadius: '100px', color: 'var(--muted)' }}>
                  {selectedEvent.format}
                </span>
              </div>
              <p className="cal-detail-desc">{selectedEvent.description}</p>
              <div className="event-tags" style={{ marginTop: 8 }}>
                {selectedEvent.tags.map(tag => <span key={tag} className="event-tag">{tag}</span>)}
              </div>
              <a href={selectedEvent.url} target="_blank" rel="noopener" className="event-link" style={{ marginTop: 12, display: 'inline-block' }}>
                Learn more →
              </a>
            </div>
          )}

          <div className="cal-legend">
            <span className="cal-legend-item"><span className="cal-dot cal-dot--conference" />Conference</span>
            <span className="cal-legend-item"><span className="cal-dot cal-dot--summit" />Summit</span>
            <span className="cal-legend-item"><span className="cal-cell--today-swatch" />Today</span>
          </div>
        </div>
      )}
    </>
  )
}
