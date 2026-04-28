const { createClient } = require('@supabase/supabase-js');
const { trackLimit, getIp } = require('./_lib/ratelimit');

const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN ?? 'https://mapheane.art').trim();

function formatDate(iso) {
  if (!iso) return 'Confirmed';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PIPELINE = ['pending', 'verified', 'dispatched', 'delivered'];

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const origin = req.headers.origin;
  if (origin && origin !== ALLOWED_ORIGIN && !origin.includes('localhost')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ref = typeof req.query.ref === 'string' ? req.query.ref.trim().toUpperCase() : '';
  if (!ref || !/^MAP-[A-Z0-9]{6}$/.test(ref)) {
    return res.status(400).json({ error: 'Invalid reference format' });
  }

  const ip = getIp(req);
  const { success } = await trackLimit.limit(ip);
  if (!success) {
    res.setHeader('Retry-After', '3600');
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.VITE_SUPABASE_SERVICE_KEY
  );

  const { data: row, error } = await supabase
    .from('orders')
    .select('ref, status, customer, cart_items, total_zar, fulfilment, pickup_point, tracking, created_at, updated_at')
    .eq('ref', ref)
    .single();

  if (error || !row) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const statusIdx  = PIPELINE.indexOf(row.status);
  const cancelled  = row.status === 'cancelled';

  const timeline = [
    { status: 'pending',    label: 'Order received',   date: formatDate(row.created_at),                              done: true },
    { status: 'verified',   label: 'Payment verified', date: statusIdx >= 1 ? formatDate(row.updated_at) : 'Pending', done: statusIdx >= 1 && !cancelled },
    { status: 'dispatched', label: 'Dispatched',        date: statusIdx >= 2 ? formatDate(row.updated_at) : 'Pending', done: statusIdx >= 2 },
    { status: 'delivered',  label: 'Delivered',         date: statusIdx >= 3 ? formatDate(row.updated_at) : 'Est. 3–7 days', done: statusIdx >= 3 },
  ];

  const estimatedDelivery =
    row.fulfilment === 'delivery' && !['delivered', 'cancelled'].includes(row.status)
      ? 'Within 3–7 working days'
      : undefined;

  res.status(200).json({
    ref:              row.ref,
    status:           row.status,
    customer:         row.customer?.name ?? '—',
    items:            (row.cart_items ?? []).map(i => ({
      title: i.edition ? `${i.edition.title} · ${i.edition.size}` : i.title,
      medium: i.artwork?.medium ?? i.medium ?? '',
    })),
    total:            row.total_zar,
    fulfilment:       row.fulfilment,
    pickupPoint:      row.pickup_point ?? undefined,
    tracking:         row.tracking    ?? undefined,
    timeline,
    estimatedDelivery,
  });
}

module.exports = handler;
