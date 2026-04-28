const { createClient } = require('@supabase/supabase-js');

function createAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.VITE_SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('Supabase service credentials are not configured');
  }
  return createClient(url, key);
}

function getBearerToken(req) {
  const header = req.headers.authorization ?? req.headers.Authorization ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1] ?? null;
}

async function requireAdmin(req) {
  const token = getBearerToken(req);
  if (!token) return { error: 'Unauthorized', status: 401 };

  const supabase = createAdminClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) return { error: 'Unauthorized', status: 401 };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError) return { error: 'Unable to verify admin access', status: 500 };
  if (profile?.role !== 'admin') return { error: 'Forbidden', status: 403 };

  return { supabase, user: userData.user, profile };
}

module.exports = { createAdminClient, requireAdmin };
