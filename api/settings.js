const { createAdminClient } = require('./_lib/auth');
const { mergeDefaults } = require('./_lib/settings');

const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN ?? 'https://mapheane.art').trim();

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const origin = req.headers.origin;
  if (origin && origin !== ALLOWED_ORIGIN && !origin.includes('localhost')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('studio_settings')
      .select('key, value')
      .in('key', ['studio', 'payment', 'shipping', 'commission', 'email']);

    if (error) throw error;

    return res.status(200).json(mergeDefaults(data));
  } catch (err) {
    console.error('Settings load error:', err);
    return res.status(200).json(mergeDefaults([]));
  }
}

module.exports = handler;
