import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { EventType } from '../data/events';

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

export function useEvents() {
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEvents(data.map(mapRow));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { events, loading };
}
