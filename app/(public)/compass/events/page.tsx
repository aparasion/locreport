import type { Metadata } from 'next'
import { EVENTS } from '@/lib/data/events'
import { EventsClient } from './EventsClient'

export const metadata: Metadata = {
  title: 'Industry Events 2026 | LocReport Compass',
  description: 'Upcoming localization, machine translation, and AI language conferences — from SlatorCon and LocWorld to ACL and NeurIPS.',
}

export default function EventsPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <h1>Industry Events 2026</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-6)' }}>
        Upcoming localization, machine translation, and AI language conferences.
      </p>
      <EventsClient events={EVENTS} today="2026-06-04" />
    </div>
  )
}
