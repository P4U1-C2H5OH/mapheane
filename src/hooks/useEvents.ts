import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { EventType } from '../data/events';

const EVENTS_CACHE_KEY = 'mapheane_events_cache';
let cachedEvents: DbEvent[] | null = null;
let inFlight: Promise<DbEvent[]> | null = null;

export interface DbEventLocation {
  venue: string;
  address: string;
  city: string;
  country: string;
}

export interface DbEventSchedule {
  startDate: string;
  endDate: string;
  openingReception?: string;
  hours: Record<string, string>;
}

export interface DbEvent {
  id: string;
  title: string;
  subtitle?: string;
  type: EventType;
  status: 'upcoming' | 'ongoing' | 'past';
  description: string;
  theme?: string;
  location: DbEventLocation;
  schedule: DbEventSchedule;
  featured: boolean;
  images: string[];
  highlights: string[];
  tags: string[];
  ticketInfo?: { price: string; required: boolean; url?: string };
  contact?: { email?: string; phone?: string; website?: string };
}

function mapRow(row: Record<string, unknown>): DbEvent {
  // EventsManager stores location as location_data, schedule as schedule_data, contact as contact_data
  // Fall back to older column names for backwards compatibility
  const loc = (row.location_data as DbEventLocation | null)
    ?? { venue: (row.venue as string) ?? '', address: '', city: '', country: '' };
  const sched = (row.schedule_data as DbEventSchedule | null)
    ?? (row.schedule as DbEventSchedule | null)
    ?? { startDate: '', endDate: '', hours: {} };
  const contact = (row.contact_data as DbEvent['contact'] | null)
    ?? (row.contact as DbEvent['contact'] | null)
    ?? undefined;

  return {
    id:          row.id as string,
    title:       (row.title       as string) ?? '',
    subtitle:    (row.subtitle    as string | undefined) ?? undefined,
    type:        ((row.type       ?? 'exhibition') as EventType),
    status:      ((row.status     ?? 'upcoming')   as DbEvent['status']),
    description: (row.description as string) ?? '',
    theme:       (row.theme       as string | undefined) ?? undefined,
    featured:    !!(row.featured  as boolean | undefined),
    images:      Array.isArray(row.images)     ? (row.images     as string[])  : [],
    highlights:  Array.isArray(row.highlights) ? (row.highlights as string[])  : [],
    tags:        Array.isArray(row.tags)        ? (row.tags       as string[])  : [],
    ticketInfo:  (row.ticket_info as DbEvent['ticketInfo'] | null) ?? undefined,
    contact,
    location: loc,
    schedule: sched,
  };
}

function readCache(): DbEvent[] {
  if (cachedEvents) return cachedEvents;
  try {
    const saved = localStorage.getItem(EVENTS_CACHE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    cachedEvents = parsed.filter((event: any) => typeof event?.id === 'string');
    return cachedEvents;
  } catch {
    return [];
  }
}

function writeCache(events: DbEvent[]) {
  cachedEvents = events;
  try {
    localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(events));
  } catch {
    // Best-effort resilience only; Supabase remains the source of truth.
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchEventsWithRetry() {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      const next = (data ?? []).map(mapRow);
      writeCache(next);
      return next;
    }

    lastError = error;
    await delay(350 * (attempt + 1));
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to load events from Supabase.');
}

export function useEvents() {
  const [events, setEvents] = useState<DbEvent[]>(() => readCache());
  const [loading, setLoading] = useState(() => readCache().length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!inFlight) {
      inFlight = fetchEventsWithRetry().finally(() => {
        inFlight = null;
      });
    }

    inFlight
      .then(next => {
        if (!active) return;
        setEvents(next);
        setError(null);
        setLoading(false);
      }).catch(err => {
        if (!active) return;
        const fallback = readCache();
        setEvents(fallback);
        setError(err instanceof Error ? err.message : 'Failed to load events.');
        setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return { events, loading, error };
}
