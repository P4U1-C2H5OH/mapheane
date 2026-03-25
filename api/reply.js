const { Resend }  = require('resend');
const { esc }     = require('./_lib/escape');
const { contactLimit, getIp } = require('./_lib/ratelimit');

const STUDIO_EMAIL   = 'spiritp83@gmail.com';
const FROM_ADDRESS   = 'Mapheane Studio <onboarding@resend.dev>';
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
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  const { to, toName, subject, body } = req.body ?? {};

  if (!to || !body?.trim()) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (body.length > 6000)    return res.status(400).json({ error: 'Reply too long' });
  if (!to.includes('@'))     return res.status(400).json({ error: 'Invalid recipient email' });

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from:    FROM_ADDRESS,
    to:      to,
    replyTo: STUDIO_EMAIL,
    subject: subject ?? `From Mapheane Studio`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;color:#2D2A26;line-height:1.75">
        <p>Dear ${esc(toName ?? 'there')},</p>
        ${esc(body).replace(/\n/g, '<br/>')}
        <p style="margin-top:2em;color:#9E9890;font-size:13px">—<br/>Mapheane<br/>Maseru, Kingdom of Lesotho<br/><a href="mailto:hello@mapheane.art" style="color:#A0522D">hello@mapheane.art</a></p>
      </div>
    `,
  });

  res.status(200).json({ ok: true });
}

module.exports = handler;
