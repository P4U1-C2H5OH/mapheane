const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { esc } = require('./_lib/escape');
const { ordersLimit, getIp } = require('./_lib/ratelimit');

const STUDIO_EMAIL   = 'spiritp83@gmail.com';
const FROM_ADDRESS   = 'Mapheane Studio <onboarding@resend.dev>';
const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN ?? 'https://mapheane.art').trim();

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
  const { success } = await ordersLimit.limit(ip);
  if (!success) {
    res.setHeader('Retry-After', '3600');
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const {
    ref, contact, address, fulfilment,
    deliveryZone, pickupPoint, paymentMethod,
    proofPath, cartItems, totalZar, shippingZar,
  } = req.body ?? {};

  // Validate required fields
  if (!ref || !contact?.email || !contact?.name || !paymentMethod || !cartItems?.length) {
    return res.status(400).json({ error: 'Missing required order fields' });
  }
  if (typeof totalZar !== 'number' || totalZar <= 0 || totalZar > 1_000_000) {
    return res.status(400).json({ error: 'Invalid order total' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.VITE_SUPABASE_SERVICE_KEY
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Insert order into Supabase
  const { error: dbError } = await supabase.from('orders').insert({
    ref,
    status: 'pending',
    payment_method: paymentMethod,
    fulfilment,
    customer: contact,
    address: address ?? null,
    delivery_zone: deliveryZone ?? null,
    pickup_point: pickupPoint ?? null,
    cart_items: cartItems,
    total_zar: totalZar,
    shipping_zar: shippingZar ?? 0,
    proof_url: proofPath ?? null,
  });

  if (dbError) {
    console.error('Supabase insert error:', dbError);
    return res.status(500).json({ error: 'Failed to save order. Please contact hello@mapheane.art.' });
  }

  // Send emails in parallel — don't block order success if email fails
  try {
    const itemList = cartItems
      .map(i => `<li>${esc(i.title)} × ${i.quantity} — R${(i.priceZar * i.quantity).toLocaleString()}</li>`)
      .join('');

    await Promise.all([
      // Buyer confirmation
      resend.emails.send({
        from: FROM_ADDRESS,
        to: contact.email,
        subject: `Order received — ${esc(ref)}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;color:#2D2A26;line-height:1.7">
            <p>Dear ${esc(contact.name)},</p>
            <p>Thank you for your order. I have received your payment notification for <strong>${esc(ref)}</strong> and will confirm it within 2 hours during studio hours (Mon–Sat, 9am–5pm SAST).</p>
            <ul style="padding-left:20px">${itemList}</ul>
            <p><strong>Total: R${totalZar.toLocaleString()}</strong>${shippingZar > 0 ? ` (includes R${shippingZar.toLocaleString()} delivery)` : ' (free pickup)'}</p>
            <p>You will receive a follow-up email once your payment has been verified.</p>
            <p>Warm regards,<br/>Mapheane<br/><a href="mailto:hello@mapheane.art">hello@mapheane.art</a></p>
          </div>
        `,
      }),
      // Studio notification
      resend.emails.send({
        from: FROM_ADDRESS,
        to: STUDIO_EMAIL,
        replyTo: contact.email,
        subject: `New order: ${esc(ref)} — ${esc(paymentMethod.toUpperCase())} — R${totalZar.toLocaleString()}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;color:#2D2A26">
            <h2 style="font-size:18px">New order: ${esc(ref)}</h2>
            <p><strong>Customer:</strong> ${esc(contact.name)} · <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
            <p><strong>Phone:</strong> ${esc(contact.phone ?? '—')}</p>
            <p><strong>Payment:</strong> ${esc(paymentMethod.toUpperCase())}</p>
            <p><strong>Fulfilment:</strong> ${esc(fulfilment ?? '—')}${deliveryZone ? ` (${esc(deliveryZone)})` : ''}${pickupPoint ? ` — Pickup: ${esc(pickupPoint)}` : ''}</p>
            <ul style="padding-left:20px">${itemList}</ul>
            <p><strong>Total: R${totalZar.toLocaleString()}</strong></p>
            ${proofPath ? `<p><strong>Proof of payment:</strong> ${esc(proofPath)}</p>` : ''}
          </div>
        `,
      }),
    ]);
  } catch (emailErr) {
    console.error('Email send error (order saved):', emailErr);
    // Order is already saved — don't fail the response over email
  }

  res.status(200).json({ ok: true });
}

module.exports = handler;
