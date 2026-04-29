const crypto = require('crypto');
const { requireAdmin } = require('./_lib/auth');

const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN ?? 'https://mapheane.art').trim();

const CAMPAIGN_TYPES = new Set(['New Work', 'Studio Update', 'Collector Preview', 'Workshop', 'Events']);
const CAMPAIGN_STATUSES = new Set(['draft', 'queued', 'scheduled']);
const AUDIENCES = new Set([
  'All subscribers',
  'Collectors + VIP',
  'Workshop alumni',
  'Newsletter Only',
  'Gallery Contacts',
]);

function cors(req, res) {
  const origin = req.headers.origin;
  const allowed =
    !origin ||
    origin === ALLOWED_ORIGIN ||
    origin.includes('localhost') ||
    /^https:\/\/mapheane(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);

  res.setHeader('Access-Control-Allow-Origin', origin && allowed ? origin : ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return allowed;
}

function clean(value, max = 1000) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function pushRecipient(map, row) {
  const email = clean(row.email, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
  const existing = map.get(email) ?? {};
  map.set(email, {
    ...existing,
    ...row,
    email,
    name: clean(row.name ?? existing.name ?? '', 160) || null,
    source: clean(row.source ?? existing.source ?? 'newsletter', 80),
  });
}

async function getAudienceRecipients(supabase, audience) {
  const recipients = new Map();

  if (audience === 'All subscribers' || audience === 'Newsletter Only') {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id,email,name,segments,source')
      .eq('status', 'subscribed');
    if (error) throw error;

    let collectorEmails = new Set();
    if (audience === 'Newsletter Only') {
      const { data: collectors, error: collectorError } = await supabase
        .from('collectors')
        .select('email')
        .not('email', 'is', null);
      if (collectorError) throw collectorError;
      collectorEmails = new Set((collectors ?? []).map(c => clean(c.email, 200).toLowerCase()).filter(Boolean));
    }

    for (const sub of data ?? []) {
      const email = clean(sub.email, 200).toLowerCase();
      if (audience === 'Newsletter Only' && collectorEmails.has(email)) continue;
      pushRecipient(recipients, {
        email,
        name: sub.name,
        source: sub.source || 'newsletter',
        subscriber_id: sub.id,
        metadata: { segments: sub.segments ?? [] },
      });
    }
  }

  if (audience === 'Collectors + VIP') {
    const { data: collectors, error } = await supabase
      .from('collectors')
      .select('id,name,email,tier,total_spend,ltv_zar,purchase_count,tags')
      .not('email', 'is', null);
    if (error) throw error;

    for (const collector of collectors ?? []) {
      pushRecipient(recipients, {
        email: collector.email,
        name: collector.name,
        source: 'collector_crm',
        collector_id: collector.id,
        metadata: {
          tier: collector.tier,
          total_spend: collector.total_spend ?? collector.ltv_zar ?? 0,
          purchase_count: collector.purchase_count ?? 0,
          tags: collector.tags ?? [],
        },
      });
    }

    const { data: subs, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('id,email,name,segments,source')
      .contains('segments', ['collector_circle'])
      .eq('status', 'subscribed');
    if (subError) throw subError;
    for (const sub of subs ?? []) {
      pushRecipient(recipients, {
        email: sub.email,
        name: sub.name,
        source: sub.source || 'collector_circle',
        subscriber_id: sub.id,
        metadata: { segments: sub.segments ?? [] },
      });
    }
  }

  if (audience === 'Workshop alumni') {
    const { data, error } = await supabase
      .from('workshop_bookings')
      .select('id,name,email,status,workshop_id')
      .neq('status', 'cancelled');
    if (error) throw error;
    for (const booking of data ?? []) {
      pushRecipient(recipients, {
        email: booking.email,
        name: booking.name,
        source: 'workshop_booking',
        metadata: { booking_id: booking.id, workshop_id: booking.workshop_id, status: booking.status },
      });
    }
  }

  if (audience === 'Gallery Contacts') {
    const { data, error } = await supabase
      .from('messages')
      .select('id,name,email,type,subject')
      .eq('type', 'Press')
      .not('email', 'is', null);
    if (error) throw error;
    for (const message of data ?? []) {
      pushRecipient(recipients, {
        email: message.email,
        name: message.name,
        source: 'press_message',
        metadata: { message_id: message.id, subject: message.subject ?? null },
      });
    }
  }

  return [...recipients.values()];
}

async function loadCounts(supabase) {
  const [vip, collectors, workshops, subscribers, press] = await Promise.all([
    supabase.from('collectors').select('*', { count: 'exact', head: true }).gte('ltv_zar', 18000),
    supabase.from('collectors').select('*', { count: 'exact', head: true }).gt('ltv_zar', 0),
    supabase.from('workshop_bookings').select('*', { count: 'exact', head: true }).neq('status', 'cancelled'),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'subscribed'),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('type', 'Press'),
  ]);

  const collectorCount = collectors.count ?? 0;
  const subscriberCount = subscribers.count ?? 0;
  return {
    vip: vip.count ?? 0,
    collectors: collectorCount,
    workshops: workshops.count ?? 0,
    newsletter: Math.max(subscriberCount - collectorCount, 0),
    subscribers: subscriberCount,
    press: press.count ?? 0,
  };
}

async function handler(req, res) {
  if (!cors(req, res)) return res.status(403).json({ error: 'Forbidden' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (admin.error) return res.status(admin.status).json({ error: admin.error });
  const { supabase } = admin;

  try {
    if (req.method === 'GET') {
      const [campaignRows, counts] = await Promise.all([
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
        loadCounts(supabase),
      ]);
      if (campaignRows.error) throw campaignRows.error;
      return res.status(200).json({ ok: true, campaigns: campaignRows.data ?? [], counts });
    }

    const payload = req.body ?? {};
    const id = clean(payload.id, 80) || crypto.randomUUID();
    const subject = clean(payload.subject, 220) || 'Untitled draft';
    const body = clean(payload.body, 20000) || null;
    const previewText = clean(payload.previewText, 220) || null;
    const type = CAMPAIGN_TYPES.has(payload.type) ? payload.type : 'Studio Update';
    const audience = AUDIENCES.has(payload.audience) ? payload.audience : 'All subscribers';
    const status = CAMPAIGN_STATUSES.has(payload.status) ? payload.status : 'draft';
    const scheduledFor = status === 'scheduled' ? clean(payload.scheduledFor, 120) || null : null;

    const recipients = await getAudienceRecipients(supabase, audience);
    const now = new Date().toISOString();

    const { error: campaignError } = await supabase.from('campaigns').upsert({
      id,
      subject,
      type,
      status,
      audience,
      body,
      preview_text: previewText,
      sent_to: recipients.length,
      recipient_count: recipients.length,
      scheduled_for: scheduledFor,
      queued_at: status === 'queued' || status === 'scheduled' ? now : null,
      send_provider: 'pending_resend_domain',
      metadata: {
        prepared_by: admin.user.email,
        sending_enabled: false,
        note: 'Recipient snapshot prepared. Resend delivery is intentionally disabled until domain verification is complete.',
      },
      updated_at: now,
    }, { onConflict: 'id' });
    if (campaignError) throw campaignError;

    const { error: deleteError } = await supabase
      .from('campaign_recipients')
      .delete()
      .eq('campaign_id', id);
    if (deleteError) throw deleteError;

    if (recipients.length) {
      const rows = recipients.map(r => ({
        campaign_id: id,
        email: r.email,
        name: r.name ?? null,
        source: r.source ?? audience,
        subscriber_id: r.subscriber_id ?? null,
        collector_id: r.collector_id ?? null,
        metadata: r.metadata ?? {},
        status: status === 'draft' ? 'draft' : 'queued',
      }));

      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase.from('campaign_recipients').insert(rows.slice(i, i + 500));
        if (error) throw error;
      }
    }

    return res.status(200).json({
      ok: true,
      campaign: { id, subject, type, status, audience, body, preview_text: previewText, recipient_count: recipients.length },
    });
  } catch (err) {
    console.error('Campaign API error:', err);
    return res.status(500).json({ error: 'Campaign operation failed. Please try again.' });
  }
}

module.exports = handler;
