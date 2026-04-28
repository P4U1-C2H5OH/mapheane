const { createAdminClient } = require('./_lib/auth');
const { interactionsLimit, getIp } = require('./_lib/ratelimit');

const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN ?? 'https://mapheane.art').trim();

const ACTIONS = new Set([
  'artwork_view',
  'event_view',
  'moment_view',
  'quick_view',
  'wishlist_add',
  'wishlist_remove',
  'moment_like',
  'moment_unlike',
  'cart_add',
  'share',
  'calendar_add',
  'ticket_click',
  'rsvp',
  'notify_request',
  'newsletter_signup',
]);

const TARGET_TYPES = new Set(['artwork', 'edition', 'moment', 'event', 'shop', 'gallery', 'newsletter']);

function cleanString(value, max = 300) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function cleanMetadata(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => typeof key === 'string' && key.length <= 80)
      .slice(0, 20)
      .map(([key, val]) => {
        if (typeof val === 'string') return [key, val.slice(0, 500)];
        if (typeof val === 'number' || typeof val === 'boolean' || val == null) return [key, val];
        return [key, JSON.stringify(val).slice(0, 500)];
      })
  );
}

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const origin = req.headers.origin;
  if (origin && origin !== ALLOWED_ORIGIN && !origin.includes('localhost')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = getIp(req);
  const { success } = await interactionsLimit.limit(ip);
  if (!success) {
    res.setHeader('Retry-After', '3600');
    return res.status(429).json({ error: 'Too many interaction events. Try again later.' });
  }

  const body = req.body ?? {};
  const action = cleanString(body.action, 80);
  const targetType = cleanString(body.targetType, 80);

  if (!action || !ACTIONS.has(action)) return res.status(400).json({ error: 'Invalid action' });
  if (!targetType || !TARGET_TYPES.has(targetType)) return res.status(400).json({ error: 'Invalid target type' });

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('public_interactions').insert({
      action,
      target_type:  targetType,
      target_id:    cleanString(body.targetId, 120),
      target_title: cleanString(body.targetTitle, 300),
      source:       cleanString(body.source, 120),
      visitor_id:   cleanString(body.visitorId, 120),
      page:         cleanString(body.page, 500),
      metadata:     cleanMetadata(body.metadata),
      user_agent:   cleanString(req.headers['user-agent'], 500),
    });

    if (error) {
      console.error('Interaction insert error:', error);
      return res.status(500).json({ error: 'Failed to record interaction' });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Interaction error:', err);
    res.status(500).json({ error: 'Failed to record interaction' });
  }
}

module.exports = handler;
