import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { EVENTS, type Event } from '@/lib/data/events'
import { EventsClient } from './EventsClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Industry Events 2026 | LocReport Compass',
  description: 'Upcoming localization, machine translation, and AI language conferences — from SlatorCon and LocWorld to ACL and NeurIPS.',
}

async function getEvents(): Promise<Event[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true })

    if (error || !data || data.length === 0) return EVENTS
    // Merge DB events with static events, DB takes precedence for same id
    const dbIds = new Set(data.map((e: Event) => e.id))
    const merged = [...data, ...EVENTS.filter(e => !dbIds.has(e.id))]
    merged.sort((a, b) => a.start_date.localeCompare(b.start_date))
    return merged as Event[]
  } catch {
    return EVENTS
  }
}

export default async function EventsPage() {
  const events = await getEvents()
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <h1>Industry Events 2026</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-6)' }}>
        Upcoming localization, machine translation, and AI language conferences.
      </p>
      <EventsClient events={events} today={new Date().toISOString().slice(0, 10)} />
    </div>
  )
}
