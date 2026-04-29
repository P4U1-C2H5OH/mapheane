const { contactLimit, getIp } = require('./_lib/ratelimit');
const { createAdminClient } = require('./_lib/auth');
const { loadSettings } = require('./_lib/settings');

const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN ?? 'https://mapheane.art').trim();

const TIERS = {
  news:      { name: 'Studio News',         monthly: 0,    annual: 0 },
  circle:    { name: 'Studio Circle',       monthly: 320,  annual: 3200 },
  collector: { name: "Collector's Circle",  monthly: 800,  annual: 8000 },
  patron:    { name: 'Founding Patron',     monthly: 2000, annual: 20000 },
};

function makeRef(tier) {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MEM-${tier.toUpperCase().slice(0, 3)}-${code}`;
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200;
}

function paymentSummary(settings) {
  const payment = settings.payment ?? {};
  return {
    mpesaName: payment.mpesaName ?? 'Mapheane',
    mpesaNumber: payment.mpesaNumber ?? '',
    ecocashName: payment.ecocashName ?? 'Mapheane',
    ecocashNumber: payment.ecocashNumber ?? '',
    wireAccountName: payment.wireAccountName ?? 'Mapheane',
    wireBankName: payment.wireBankName ?? '',
    wireAccountNumber: payment.wireAccountNumber ?? '',
    wireSwift: payment.wireSwift ?? '',
    wireBranch: payment.wireBranch ?? '',
  };
}

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const origin = req.headers.origin;
    if (origin && origin !== ALLOWED_ORIGIN && !origin.includes('localhost')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const ip = getIp(req);
    try {
      const { success } = await contactLimit.limit(ip);
      if (!success) {
        res.setHeader('Retry-After', '3600');
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }
    } catch (limitError) {
      console.error('Membership rate limit error:', limitError);
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
    const tierId = typeof body.tier === 'string' ? body.tier.trim().toLowerCase() : '';
    const billing = body.billing === 'monthly' ? 'monthly' : 'annual';
    const tier = TIERS[tierId];
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phone = typeof body.phone === 'string' && body.phone.length <= 80 ? body.phone.trim() : '';
    const note = typeof body.note === 'string' && body.note.length <= 1000 ? body.note.trim() : '';
    const trap = body.trap;

    if (trap) return res.status(200).json({ ok: true });
    if (!tier) return res.status(400).json({ error: 'Invalid membership tier' });
    if (!name || name.length > 120) return res.status(400).json({ error: 'Valid name required' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Valid email required' });
    if (phone && !/^[+\d\s().-]{6,80}$/.test(phone)) return res.status(400).json({ error: 'Invalid phone' });

    const amountZar = tier[billing];
    const isFree = amountZar === 0;
    const paymentRef = isFree ? null : makeRef(tierId);
    const status = isFree ? 'active' : 'pending_payment';
    const supabase = createAdminClient();
    const settings = await loadSettings(supabase).catch(() => ({}));

    const existing = await supabase
      .from('collectors')
      .select('*')
      .ilike('email', email)
      .limit(1)
      .maybeSingle();
    if (existing.error) {
      console.error('Membership collector lookup error:', existing.error);
      return res.status(500).json({ error: 'Unable to create membership. Please try again.' });
    }

    const collectorPayload = {
      name,
      email,
      phone: phone || existing.data?.phone || null,
      country: existing.data?.country ?? '—',
      location: existing.data?.location ?? '—',
      tier: isFree ? (existing.data?.tier ?? 'Prospect') : 'Collector',
      source: existing.data?.source ?? 'Collector Circle',
      notes: [existing.data?.notes, note, `${tier.name} ${billing} membership ${status}`].filter(Boolean).join('\n'),
      tags: Array.from(new Set([...(Array.isArray(existing.data?.tags) ? existing.data.tags : []), 'membership', tierId])),
      last_contact: 'Membership signup',
    };

    let collector = existing.data;
    if (collector) {
      const update = await supabase
        .from('collectors')
        .update(collectorPayload)
        .eq('id', collector.id)
        .select()
        .single();
      if (update.error) {
        console.error('Membership collector update error:', update.error);
        return res.status(500).json({ error: 'Unable to update collector profile.' });
      }
      collector = update.data;
    } else {
      const insert = await supabase
        .from('collectors')
        .insert({
          ...collectorPayload,
          ltv_zar: 0,
          total_spend: 0,
          purchase_count: 0,
          wishlist_count: 0,
          medium_pref: [],
        })
        .select()
        .single();
      if (insert.error) {
        console.error('Membership collector insert error:', insert.error);
        return res.status(500).json({ error: 'Unable to create collector profile.' });
      }
      collector = insert.data;
    }

    const membership = await supabase
      .from('memberships')
      .insert({
        collector_id: collector.id,
        tier: tierId,
        tier_name: tier.name,
        status,
        billing,
        amount_zar: amountZar,
        payment_ref: paymentRef,
        metadata: { source: 'collector_circle', note, ip, user_agent: req.headers['user-agent'] ?? null },
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (membership.error) {
      console.error('Membership insert error:', membership.error);
      return res.status(500).json({ error: 'Unable to create membership.' });
    }

    const newsletter = await supabase.from('newsletter_subscribers').upsert({
      email,
      name,
      source: 'collector_circle',
      status: 'subscribed',
      segments: ['newsletter', 'collector_circle'],
      metadata: { tier: tierId, membership_id: membership.data.id },
      unsubscribed_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });
    if (newsletter.error) {
      console.error('Membership newsletter upsert error:', newsletter.error);
    }

    const message = [
      `Collector Circle signup: ${tier.name}`,
      `Billing: ${billing}`,
      `Status: ${status}`,
      isFree ? null : `Payment ref: ${paymentRef}`,
      isFree ? null : `Amount due: R${amountZar}`,
      note ? `Note: ${note}` : null,
    ].filter(Boolean).join('\n');

    const messageInsert = await supabase.from('messages').insert({
      name,
      email,
      phone: phone || null,
      type: 'General',
      subject: `Membership signup — ${tier.name}`,
      message,
      status: 'unread',
      metadata: { membership_id: membership.data.id, collector_id: collector.id, tier: tierId, billing },
    });
    if (messageInsert.error) {
      console.error('Membership message insert error:', messageInsert.error);
    }

    res.status(200).json({
      ok: true,
      status,
      tier: tier.name,
      billing,
      amountZar,
      paymentRef,
      payment: paymentSummary(settings),
      message: isFree
        ? `You're on the ${tier.name} list.`
        : `Use ${paymentRef} as your payment reference. Membership activates after payment confirmation.`,
    });
  } catch (err) {
    console.error('Membership error:', err);
    res.status(500).json({ error: 'Membership signup failed. Please try again.' });
  }
}

module.exports = handler;
