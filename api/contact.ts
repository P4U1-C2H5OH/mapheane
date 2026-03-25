import { Resend } from 'resend';
import { esc } from './_lib/escape';
import { contactLimit, getIp } from './_lib/ratelimit';

const resend = new Resend(process.env.RESEND_API_KEY);

const STUDIO_EMAIL  = 'hello@mapheane.art';
const FROM_ADDRESS  = 'Mapheane Studio <noreply@mapheane.art>';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'https://mapheane.art';

const VALID_TYPES = ['Purchase', 'Commission', 'Workshop', 'Press', 'General', 'Workshop-Booking'];

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const origin = req.headers.origin as string | undefined;
  if (origin && origin !== ALLOWED_ORIGIN && !origin.includes('localhost')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit per IP
  const ip = getIp(req);
  const { success } = await contactLimit.limit(ip);
  if (!success) {
    res.setHeader('Retry-After', '3600');
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const { name, email, type, message, phone, budget, medium, workshop, trap } = req.body ?? {};

  // Honeypot — bots fill hidden fields
  if (trap) return res.status(200).json({ ok: true });

  // Input validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  if (typeof name !== 'string' || name.length > 120) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  if (typeof message !== 'string' || message.length > 4000) {
    return res.status(400).json({ error: 'Message too long (max 4000 characters)' });
  }
  if (phone && (typeof phone !== 'string' || phone.length > 30)) {
    return res.status(400).json({ error: 'Invalid phone' });
  }
  if (type && !VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid inquiry type' });
  }

  const subject = type
    ? `[${esc(type)}] Inquiry from ${esc(name)}`
    : `Studio inquiry from ${esc(name)}`;

  const extras = [
    phone    && `<p><strong>Phone:</strong> ${esc(phone)}</p>`,
    budget   && `<p><strong>Budget:</strong> ${esc(budget)}</p>`,
    medium   && `<p><strong>Medium:</strong> ${esc(medium)}</p>`,
    workshop && `<p><strong>Workshop:</strong> ${esc(workshop)}</p>`,
  ].filter(Boolean).join('');

  const notificationHtml = `
    <div style="font-family:sans-serif;max-width:600px;color:#2D2A26">
      <h2 style="font-size:18px;margin-bottom:16px">${esc(subject)}</h2>
      <p><strong>Name:</strong> ${esc(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
      ${extras}
      <hr style="margin:20px 0;border:none;border-top:1px solid #EDE8E0"/>
      <p style="white-space:pre-wrap">${esc(message)}</p>
    </div>
  `;

  const autoReplyHtml = `
    <div style="font-family:sans-serif;max-width:600px;color:#2D2A26;line-height:1.7">
      <p>Dear ${esc(name)},</p>
      <p>Thank you for reaching out to the studio. I have received your message and will respond within 48 hours during studio hours (Mon–Sat, 9am–5pm SAST).</p>
      <p style="font-style:italic;color:#9E9890">Your message:</p>
      <blockquote style="border-left:3px solid #A0522D;padding-left:16px;margin:16px 0;color:#9E9890;white-space:pre-wrap">${esc(message)}</blockquote>
      <p>Warm regards,<br/>Mapheane<br/><a href="mailto:hello@mapheane.art">hello@mapheane.art</a></p>
    </div>
  `;

  try {
    await Promise.all([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: STUDIO_EMAIL,
        replyTo: email,
        subject,
        html: notificationHtml,
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject: 'Your message to Mapheane Studio',
        html: autoReplyHtml,
      }),
    ]);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Failed to send. Please try emailing hello@mapheane.art directly.' });
  }
}
