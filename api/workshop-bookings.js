const { Resend } = require('resend');
const { createAdminClient } = require('./_lib/auth');
const { esc } = require('./_lib/escape');
const { contactLimit, getIp } = require('./_lib/ratelimit');
const { loadEmailSettings } = require('./_lib/settings');

const FROM_ADDRESS = 'Mapheane Studio <onboarding@resend.dev>';
const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN ?? 'https://mapheane.art').trim();

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
  const { success } = await contactLimit.limit(ip);
  if (!success) {
    res.setHeader('Retry-After', '3600');
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const { workshopId, name, email, phone, message, trap } = req.body ?? {};
  if (trap) return res.status(200).json({ ok: true });

  if (!workshopId || typeof workshopId !== 'string') {
    return res.status(400).json({ error: 'Workshop is required' });
  }
  if (!name || typeof name !== 'string' || name.length > 120) {
    return res.status(400).json({ error: 'Valid name required' });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  if (phone && (typeof phone !== 'string' || phone.length > 30)) {
    return res.status(400).json({ error: 'Invalid phone' });
  }
  if (message && (typeof message !== 'string' || message.length > 2000)) {
    return res.status(400).json({ error: 'Message too long' });
  }

  try {
    const supabase = createAdminClient();
    const resend = new Resend(process.env.RESEND_API_KEY);
    const emailSettings = await loadEmailSettings(supabase);

    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('id, title, date, time, location, capacity')
      .eq('id', workshopId)
      .maybeSingle();

    if (workshopError || !workshop) return res.status(404).json({ error: 'Workshop not found' });

    const { error: insertError } = await supabase.from('workshop_bookings').insert({
      workshop_id: workshop.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      message: message?.trim() || null,
      status: 'pending',
    });

    if (insertError) {
      console.error('Workshop booking insert error:', insertError);
      return res.status(500).json({ error: 'Failed to save booking. Please email hello@mapheane.art directly.' });
    }

    const details = [
      workshop.date && `<p><strong>Date:</strong> ${esc(workshop.date)}</p>`,
      workshop.time && `<p><strong>Time:</strong> ${esc(workshop.time)}</p>`,
      workshop.location && `<p><strong>Location:</strong> ${esc(workshop.location)}</p>`,
    ].filter(Boolean).join('');

    try {
      await Promise.all([
        resend.emails.send({
          from: FROM_ADDRESS,
          to: email,
          subject: `Workshop inquiry received — ${esc(workshop.title)}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;color:#2D2A26;line-height:1.7">
              <p>Dear ${esc(name)},</p>
              <p>Thank you for your workshop inquiry for <strong>${esc(workshop.title)}</strong>.</p>
              ${details}
              <p>Mapheane will confirm availability and payment details within 48 hours during studio hours.</p>
              <p>Warm regards,<br/>Mapheane Studio</p>
            </div>
          `,
        }),
        resend.emails.send({
          from: FROM_ADDRESS,
          to: emailSettings.studioEmail,
          replyTo: email,
          subject: `Workshop booking inquiry — ${esc(workshop.title)}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;color:#2D2A26">
              <h2 style="font-size:18px">Workshop booking inquiry</h2>
              <p><strong>Workshop:</strong> ${esc(workshop.title)}</p>
              <p><strong>Name:</strong> ${esc(name)}</p>
              <p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
              ${phone ? `<p><strong>Phone:</strong> ${esc(phone)}</p>` : ''}
              ${message ? `<p style="white-space:pre-wrap"><strong>Message:</strong><br/>${esc(message)}</p>` : ''}
            </div>
          `,
        }),
      ]);
    } catch (emailError) {
      console.error('Workshop booking email error:', emailError);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Workshop booking error:', err);
    return res.status(500).json({ error: 'Booking failed. Please try again.' });
  }
}

module.exports = handler;
