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

function setCors(req, res) {
  const origin = req.headers.origin;
  const allowed =
    !origin ||
    origin === ALLOWED_ORIGIN ||
    origin.includes('localhost') ||
    /^https:\/\/mapheane(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);

  res.setHeader('Access-Control-Allow-Origin', origin && allowed ? origin : ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return allowed;
}

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

async function upsertAvailabilityRequest(supabase, body, metadata, req) {
  const email = cleanString(metadata.email, 200)?.toLowerCase();
  const artworkId = cleanString(body.targetId, 120);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !artworkId) return null;

  const { data: artwork, error: artworkError } = await supabase
    .from('artworks')
    .select('id,title,status,medium,price_eur')
    .eq('id', artworkId)
    .maybeSingle();
  if (artworkError || !artwork) {
    if (artworkError) console.error('Availability artwork lookup error:', artworkError);
    return null;
  }

  let collectorId = null;
  const { data: collector } = await supabase
    .from('collectors')
    .select('id,tags,notes')
    .ilike('email', email)
    .limit(1)
    .maybeSingle();

  if (collector?.id) {
    collectorId = collector.id;
    const tags = Array.isArray(collector.tags) ? collector.tags : [];
    const noteLine = `Availability request for "${artwork.title}" on ${new Date().toLocaleDateString('en-ZA')}`;
    await supabase
      .from('collectors')
      .update({
        tags: [...new Set([...tags, 'availability_request'])],
        last_contact: 'Availability request',
        notes: collector.notes ? `${collector.notes}\n${noteLine}` : noteLine,
      })
      .eq('id', collector.id);
  } else {
    const { data: insertedCollector, error: insertCollectorError } = await supabase
      .from('collectors')
      .insert({
        name: email.split('@')[0],
        email,
        tier: 'Prospect',
        location: '—',
        country: '—',
        source: 'Availability request',
        last_contact: 'Availability request',
        tags: ['availability_request'],
        notes: `Availability request for "${artwork.title}"`,
      })
      .select('id')
      .single();
    if (!insertCollectorError) collectorId = insertedCollector?.id ?? null;
  }

  const { data: request, error } = await supabase
    .from('availability_requests')
    .upsert({
      artwork_id: artwork.id,
      artwork_title: artwork.title,
      email,
      source: cleanString(body.source, 120),
      status: 'new',
      collector_id: collectorId,
      metadata: {
        artworkStatus: artwork.status,
        artworkMedium: artwork.medium,
        artworkPriceEur: artwork.price_eur,
        page: cleanString(body.page, 500),
        visitorId: cleanString(body.visitorId, 120),
        userAgent: cleanString(req.headers['user-agent'], 500),
      },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'artwork_id,email' })
    .select('id')
    .single();

  if (error) {
    console.error('Availability request upsert error:', error);
    return null;
  }
  return request?.id ?? null;
}

async function handler(req, res) {
  if (!setCors(req, res)) return res.status(403).json({ error: 'Forbidden' });
  if (req.method === 'OPTIONS') return res.status(204).end();

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
    const metadata = cleanMetadata(body.metadata);
    const availabilityRequestId = action === 'notify_request' && targetType === 'artwork'
      ? await upsertAvailabilityRequest(supabase, body, metadata, req)
      : null;
    const { error } = await supabase.from('public_interactions').insert({
      action,
      target_type:  targetType,
      target_id:    cleanString(body.targetId, 120),
      target_title: cleanString(body.targetTitle, 300),
      source:       cleanString(body.source, 120),
      visitor_id:   cleanString(body.visitorId, 120),
      page:         cleanString(body.page, 500),
      metadata:     availabilityRequestId ? { ...metadata, availability_request_id: availabilityRequestId } : metadata,
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
