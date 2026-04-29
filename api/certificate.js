const { createClient } = require('@supabase/supabase-js');
const { trackLimit, getIp } = require('./_lib/ratelimit');
const { loadCertificate } = require('./_lib/certificate');

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

    const result = await loadCertificate(supabase, ref);
    if (result.error) return res.status(result.status ?? 500).json({ error: result.error });

    res.status(200).json(result.certificate);
  } catch (err) {
    console.error('Certificate error:', err);
    res.status(500).json({ error: 'Unable to load certificate. Please try again.' });
  }
}

module.exports = handler;
