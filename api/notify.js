const { Resend } = require('resend');
const { esc } = require('./_lib/escape');
const { requireAdmin } = require('./_lib/auth');
const { formatZar } = require('./_lib/pricing');

const STUDIO_EMAIL   = 'spiritp83@gmail.com';
const FROM_ADDRESS   = 'Mapheane Studio <onboarding@resend.dev>';
const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN ?? 'https://mapheane.art').trim();

const SUBJECTS = {
  verified:   'Payment confirmed — your order is being prepared',
  dispatched: 'Your order is on its way',
  delivered:  'Delivered — enjoy your artwork',
  cancelled:  'Order cancelled — Mapheane Studio',
};

function buildHtml(status, { customerName, ref, items, total, tracking }) {
  const name = esc(customerName ?? 'Collector');
  const itemRows = (items ?? [])
    .map(i => `<tr><td style="padding:6px 0;color:#2D2A26;">${esc(i.title)}</td><td style="padding:6px 0;text-align:right;color:#2D2A26;">${formatZar(Number(i.price))}</td></tr>`)
    .join('');

  const bodies = {
    verified: `
      <p>Dear ${name},</p>
      <p>We have received and verified your payment for order <strong>${esc(ref)}</strong>. Your artwork is now being carefully prepared for fulfilment.</p>
      <p>You will receive another update once your order has been dispatched.</p>
    `,
    dispatched: `
      <p>Dear ${name},</p>
      <p>Great news — order <strong>${esc(ref)}</strong> has been dispatched.</p>
      ${tracking ? `<p><strong>Tracking number:</strong> ${esc(tracking)}</p>` : ''}
      <p>Please allow 3–7 business days for delivery within Southern Africa, or up to 14 days for international orders.</p>
    `,
    delivered: `
      <p>Dear ${name},</p>
      <p>Order <strong>${esc(ref)}</strong> has been marked as delivered. We hope your artwork has arrived safely and that you love it.</p>
      <p>If you have any concerns about the condition of your piece, please reply to this email within 48 hours.</p>
    `,
    cancelled: `
      <p>Dear ${name},</p>
      <p>Order <strong>${esc(ref)}</strong> has been cancelled. If you believe this is an error or would like to place a new order, please reply to this email or contact the studio directly.</p>
    `,
  };

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#FAF7F2;font-family:'DM Sans',system-ui,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 20px;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#FAF7F2;max-width:560px;width:100%;">
            <!-- Header -->
            <tr><td style="padding-bottom:32px;border-bottom:1px solid #EDE8E0;">
              <p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#2D2A26;letter-spacing:-0.01em;">Mapheane Studio</p>
              <p style="margin:4px 0 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9E9890;">Contemporary Art · Kingdom of Lesotho</p>
            </td></tr>
            <!-- Body -->
            <tr><td style="padding:32px 0;font-size:15px;line-height:1.7;color:#4A4640;">
              ${bodies[status] ?? ''}
              ${itemRows ? `
              <table width="100%" style="margin-top:24px;border-top:1px solid #EDE8E0;border-bottom:1px solid #EDE8E0;padding:12px 0;">
                ${itemRows}
                <tr>
                  <td style="padding-top:8px;font-weight:600;color:#2D2A26;border-top:1px solid #EDE8E0;">Total</td>
                  <td style="padding-top:8px;font-weight:600;text-align:right;color:#2D2A26;border-top:1px solid #EDE8E0;">${formatZar(Number(total))}</td>
                </tr>
              </table>` : ''}
              <p style="margin-top:32px;">With gratitude,<br><em style="font-family:Georgia,serif;">Mapheane</em></p>
            </td></tr>
            <!-- Footer -->
            <tr><td style="padding-top:24px;border-top:1px solid #EDE8E0;font-size:11px;color:#9E9890;letter-spacing:0.1em;">
              <p style="margin:0;">MAPHEANE STUDIO · MASERU, KINGDOM OF LESOTHO</p>
              <p style="margin:4px 0 0;"><a href="mailto:hello@mapheane.art" style="color:#A0522D;text-decoration:none;">hello@mapheane.art</a></p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const origin = req.headers.origin;
  if (origin && origin !== ALLOWED_ORIGIN && !origin.includes('localhost')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (admin.error) return res.status(admin.status).json({ error: admin.error });

  const { status, customerEmail, customerName, ref, items, total, tracking } = req.body ?? {};

  if (!status || !customerEmail || !ref) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!SUBJECTS[status]) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from:    FROM_ADDRESS,
      to:      customerEmail,
      replyTo: STUDIO_EMAIL,
      subject: SUBJECTS[status],
      html:    buildHtml(status, { customerName, ref, items, total, tracking }),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('notify error', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}

module.exports = handler;
