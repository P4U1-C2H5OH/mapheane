import { supabase } from './supabase';

type InteractionAction =
  | 'artwork_view'
  | 'event_view'
  | 'moment_view'
  | 'quick_view'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'moment_like'
  | 'moment_unlike'
  | 'cart_add'
  | 'share'
  | 'calendar_add'
  | 'ticket_click'
  | 'rsvp'
  | 'notify_request'
  | 'newsletter_signup';

type InteractionTarget = 'artwork' | 'edition' | 'moment' | 'event' | 'shop' | 'gallery' | 'newsletter';

interface TrackInteractionInput {
  action: InteractionAction;
  targetType: InteractionTarget;
  targetId?: string | null;
  targetTitle?: string | null;
  source?: string;
  metadata?: Record<string, unknown>;
}

const VISITOR_KEY = 'mapheane_visitor_id';

function payloadFor(input: TrackInteractionInput) {
  return {
    ...input,
    visitorId: visitorId(),
    page: `${window.location.pathname}${window.location.search}`,
  };
}

function rowFor(payload: ReturnType<typeof payloadFor>) {
  return {
    action:       payload.action,
    target_type:  payload.targetType,
    target_id:    payload.targetId ?? null,
    target_title: payload.targetTitle ?? null,
    source:       payload.source ?? null,
    visitor_id:   payload.visitorId ?? null,
    page:         payload.page,
    metadata:     payload.metadata ?? {},
  };
}

function visitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return undefined;
  }
}

async function insertDirect(payload: ReturnType<typeof payloadFor>) {
  await supabase.from('public_interactions').insert(rowFor(payload));
}

export function trackInteraction(input: TrackInteractionInput) {
  if (typeof window === 'undefined') return;

  const payload = payloadFor(input);
  const body = JSON.stringify(payload);

  if (import.meta.env.DEV) {
    insertDirect(payload).catch(() => {
      // Interaction capture should never interrupt the public experience.
    });
    return;
  }

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/interactions', blob);
      return;
    }
  } catch {
    // Fall through to fetch.
  }

  fetch('/api/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  })
    .then(res => {
      if (!res.ok) return insertDirect(payload);
      return undefined;
    })
    .catch(() => insertDirect(payload).catch(() => undefined));
}
