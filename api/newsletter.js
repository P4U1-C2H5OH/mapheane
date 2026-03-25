const { esc } = require('./_lib/escape');
const { newsletterLimit, getIp } = require('./_lib/ratelimit');

const RESEND_API_KEY     = process.env.RESEND_API_KEY;
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;
const FROM_ADDRESS       = 'Mapheane Studio <onboarding@resend.dev>';
const ALLOWED_ORIGIN     = (process.env.ALLOWED_ORIGIN ?? 'https://mapheane.art').trim();

async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const origin = req.headers.origin;
  if (origin && origin !== ALLOWED_ORIGIN && !origin.includes('localhost')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit per IP
  const ip = getIp(req);
  const { success } = await newsletterLimit.limit(ip);
  if (!success) {
    res.setHeader('Retry-After', '3600');
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const { email, name, trap } = req.body ?? {};

  // Honeypot
  if (trap) return res.status(200).json({ ok: true });

  // Validation
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  if (name && (typeof name !== 'string' || name.length > 120)) {
    return res.status(400).json({ error: 'Invalid name' });
  }

  const safeName = name ? esc(name) : '';

  try {
    // Add to Resend Audience
    if (RESEND_AUDIENCE_ID) {
      const audienceRes = await fetch(
        `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, first_name: safeName, unsubscribed: false }),
        }
      );
      if (!audienceRes.ok) {
        console.error('Resend Audiences error:', await audienceRes.text());
      }
    }

    // Email 1: Welcome (Day 0)
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: email,
        subject: "You're in — and here's where we begin",
        html: `
          <div style="font-family:sans-serif;max-width:600px;color:#2D2A26;line-height:1.7">
            <p>Dear ${safeName || 'friend'},</p>
            <p>Welcome to the studio. This is not a catalogue — every note I send is something I would genuinely write to a collector friend.</p>
            <p>I work from Maseru, in the Kingdom of Lesotho, with resin on canvas, charcoal and graphite on paper, and glazed stoneware. The visual language of where I grew up — litema wall painting, seanamarena blanket patterns, highland clay — is the foundation of everything I make.</p>
            <p>I have one question for you, and I read every reply: <em>How did you discover the work?</em> Instagram, a gallery, a friend — I am genuinely curious.</p>
            <p>The studio is at <a href="https://mapheane.art/gallery" style="color:#A0522D">mapheane.art</a> whenever you are ready to look.</p>
            <p>Warm regards,<br/>Mapheane</p>
            <hr style="margin:32px 0;border:none;border-top:1px solid #EDE8E0"/>
            <p style="font-size:12px;color:#9E9890">You subscribed at mapheane.art. To unsubscribe, reply with "unsubscribe".</p>
          </div>
        `,
      }),
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Newsletter error:', err);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
}

module.exports = handler;
