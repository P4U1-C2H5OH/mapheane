const { createClient } = require('@supabase/supabase-js');
const { trackLimit, getIp } = require('./_lib/ratelimit');

const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN ?? 'https://mapheane.art').trim();

function setCors(req, res) {
  const origin = req.headers.origin;
  const allowed =
    !origin ||
    origin === ALLOWED_ORIGIN ||
    origin.includes('localhost') ||
    /^https:\/\/mapheane(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);

  res.setHeader('Access-Control-Allow-Origin', origin && allowed ? origin : ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return allowed;
}

function formatIssueDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function joinParts(parts) {
  return parts.filter(Boolean).join(' · ');
}

async function handler(req, res) {
  if (!setCors(req, res)) return res.status(403).json({ error: 'Forbidden' });
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const ref = typeof req.query.ref === 'string' ? req.query.ref.trim().toUpperCase() : '';
    if (!ref || !/^MAP-[A-Z0-9]{6}$/.test(ref)) {
      return res.status(400).json({ error: 'Invalid reference format' });
    }

    const ip = getIp(req);
    try {
      const { success } = await trackLimit.limit(ip);
      if (!success) {
        res.setHeader('Retry-After', '3600');
        return res.status(429).json({ error: 'Too many requests. Try again later.' });
      }
    } catch (limitError) {
      console.error('Certificate rate limit error:', limitError);
    }

    const supabase = createClient(
      process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY ?? process.env.VITE_SUPABASE_SERVICE_KEY
    );

    const { data: row, error } = await supabase
      .from('orders')
      .select('ref, status, customer, cart_items, created_at')
      .eq('ref', ref)
      .single();

    if (error || !row) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (row.status === 'cancelled' || row.status === 'pending') {
      return res.status(404).json({ error: 'Certificate not available for this order' });
    }

    const first = (row.cart_items ?? [])[0];
    let artwork = first?.artwork ?? {};
    const edition = first?.edition;
    const artworkId = artwork.id ?? edition?.artworkId ?? edition?.artwork_id;

    if (artworkId && (!artwork.dimensions || !artwork.year || (!artwork.technique && !artwork.medium))) {
      const { data: fallbackArtwork, error: fallbackError } = await supabase
        .from('artworks')
        .select('id, title, medium, technique, dimensions, year')
        .eq('id', artworkId)
        .maybeSingle();
      if (!fallbackError && fallbackArtwork) {
        artwork = { ...fallbackArtwork, ...artwork };
      }
    }

    const editionLabel = edition
      ? joinParts([edition.type, edition.size, edition.paper])
      : 'Original · One of a kind';
    const medium = edition?.medium ?? artwork.technique ?? artwork.medium ?? first?.medium ?? '—';
    const dimensions = edition?.size ?? artwork.dimensions ?? '—';
    const year = edition?.year ?? artwork.year ?? new Date(row.created_at).getFullYear();

    res.status(200).json({
      title:         edition?.title        ?? artwork.title ?? first?.title ?? 'Untitled',
      medium,
      dimensions,
      year:          String(year),
      edition:       editionLabel,
      classification: edition ? 'Print Edition' : 'Original Artwork',
      ref:           `COA-${row.ref.replace('MAP-', '')}`,
      orderRef:      row.ref,
      collectorName: row.customer?.name    ?? '—',
      date:          formatIssueDate(row.created_at),
    });
  } catch (err) {
    console.error('Certificate error:', err);
    res.status(500).json({ error: 'Unable to load certificate. Please try again.' });
  }
}

module.exports = handler;
