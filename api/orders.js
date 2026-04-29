const { Resend } = require('resend');
const { esc } = require('./_lib/escape');
const { ordersLimit, getIp } = require('./_lib/ratelimit');
const { createAdminClient } = require('./_lib/auth');
const { eurToZar, zarToEur, roundMoney, formatZar } = require('./_lib/pricing');
const { loadEmailSettings } = require('./_lib/settings');

const FROM_ADDRESS   = 'Mapheane Studio <onboarding@resend.dev>';
const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN ?? 'https://mapheane.art').trim();
const DEFAULT_DELIVERY_ZONES = {
  maseru: 150,
  lesotho: 280,
  southafrica: 450,
  international: 950,
};

function numberFromSetting(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

async function loadDeliveryZones(supabase) {
  const { data, error } = await supabase
    .from('studio_settings')
    .select('value')
    .eq('key', 'shipping')
    .maybeSingle();

  if (error || !data?.value) return DEFAULT_DELIVERY_ZONES;
  const shipping = data.value;
  return {
    maseru: numberFromSetting(shipping.maseru, DEFAULT_DELIVERY_ZONES.maseru),
    lesotho: numberFromSetting(shipping.lesotho, DEFAULT_DELIVERY_ZONES.lesotho),
    southafrica: numberFromSetting(shipping.southAfrica ?? shipping.southafrica, DEFAULT_DELIVERY_ZONES.southafrica),
    international: numberFromSetting(shipping.international, DEFAULT_DELIVERY_ZONES.international),
  };
}

function asQuantity(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 20) return null;
  return n;
}

function zarFromRow(row) {
  const zar = Number(row.price_zar);
  if (Number.isFinite(zar) && zar > 0) return roundMoney(zar);
  const eur = Number(row.price_eur);
  return Number.isFinite(eur) && eur > 0 ? eurToZar(eur) : 0;
}

async function normalizeCartItems(supabase, cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0 || cartItems.length > 20) {
    throw new Error('Invalid cart');
  }

  const editionIds = [...new Set(cartItems.map(i => i?.edition?.id).filter(Boolean))];
  const originalArtworkIds = [...new Set(
    cartItems
      .filter(i => !i?.edition?.id)
      .map(i => i?.artwork?.id)
      .filter(Boolean)
  )];

  const [editionsRes, artworksRes] = await Promise.all([
    editionIds.length
      ? supabase
        .from('editions')
        .select('id, artwork_id, title, medium, size, paper, type, price_zar, price_eur, image_url, available')
        .in('id', editionIds)
      : Promise.resolve({ data: [], error: null }),
    originalArtworkIds.length
      ? supabase
        .from('artworks')
        .select('id, title, medium, dimensions, price_eur, status, images, year')
        .in('id', originalArtworkIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (editionsRes.error) throw new Error('Unable to validate editions');
  if (artworksRes.error) throw new Error('Unable to validate artworks');

  const editions = new Map((editionsRes.data ?? []).map(row => [row.id, row]));
  const artworks = new Map((artworksRes.data ?? []).map(row => [row.id, row]));

  return cartItems.map(item => {
    const quantity = asQuantity(item?.quantity);
    if (!quantity) throw new Error('Invalid item quantity');

    if (item?.edition?.id) {
      const edition = editions.get(item.edition.id);
      if (!edition || edition.available === false) throw new Error('An edition in your cart is no longer available');

      const priceZar = zarFromRow(edition);
      if (priceZar <= 0) throw new Error('An edition in your cart has invalid pricing');

      return {
        artwork: item.artwork?.id ? { id: item.artwork.id, title: item.artwork.title ?? edition.title } : null,
        edition: {
          id: edition.id,
          artworkId: edition.artwork_id,
          title: edition.title,
          medium: edition.medium,
          size: edition.size,
          paper: edition.paper,
          type: edition.type,
          price: {
            zar: priceZar,
            eur: Number(edition.price_eur) || zarToEur(priceZar),
          },
          image: edition.image_url,
        },
        title: edition.title,
        medium: edition.medium,
        priceZar,
        quantity,
      };
    }

    const artworkId = item?.artwork?.id;
    const artwork = artworks.get(artworkId);
    if (!artwork || artwork.status !== 'Available') throw new Error('An artwork in your cart is no longer available');

    const eur = Number(artwork.price_eur);
    const priceZar = Number.isFinite(eur) && eur > 0 ? eurToZar(eur) : 0;
    if (priceZar <= 0) throw new Error('An artwork in your cart has invalid pricing');

    return {
      artwork: {
        id: artwork.id,
        title: artwork.title,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        price: eur,
        status: artwork.status,
        images: Array.isArray(artwork.images) ? artwork.images : [],
        year: artwork.year,
      },
      edition: null,
      title: artwork.title,
      medium: artwork.medium,
      priceZar,
      quantity,
    };
  });
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
      const { success } = await ordersLimit.limit(ip);
      if (!success) {
        res.setHeader('Retry-After', '3600');
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }
    } catch (limitError) {
      console.error('Order rate limit error:', limitError);
    }

    const body = typeof req.body === 'string'
      ? JSON.parse(req.body || '{}')
      : req.body ?? {};

    const {
      ref, contact, address, fulfilment,
      deliveryZone, pickupPoint, paymentMethod,
      proofPath, cartItems, totalZar,
    } = body;

    const orderRef = typeof ref === 'string' ? ref.trim().toUpperCase() : '';
    if (!orderRef || !contact?.email || !contact?.name || !paymentMethod || !cartItems?.length) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }
    if (!/^MAP-[A-Z0-9]{6}$/.test(orderRef)) {
      return res.status(400).json({ error: 'Invalid order reference' });
    }
    if (totalZar != null && (typeof totalZar !== 'number' || totalZar <= 0 || totalZar > 1_000_000)) {
      return res.status(400).json({ error: 'Invalid order total' });
    }

    const supabase = createAdminClient();
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    let emailSettings;
    try {
      emailSettings = await loadEmailSettings(supabase);
    } catch (err) {
      console.error('Email settings load error:', err);
      emailSettings = { studioEmail: 'hello@mapheane.art', orderSubject: 'New order - [REF]' };
    }

    let normalizedItems;
    let serverShippingZar;
    let serverTotalZar;
    try {
      normalizedItems = await normalizeCartItems(supabase, cartItems);
      const subtotalZar = roundMoney(normalizedItems.reduce((sum, item) => sum + item.priceZar * item.quantity, 0));
      const deliveryZones = await loadDeliveryZones(supabase);
      serverShippingZar = fulfilment === 'pickup' ? 0 : deliveryZones[deliveryZone] ?? null;
      if (serverShippingZar == null) return res.status(400).json({ error: 'Invalid delivery zone' });
      serverTotalZar = roundMoney(subtotalZar + serverShippingZar);
    } catch (err) {
      return res.status(400).json({ error: err.message ?? 'Invalid cart' });
    }

    const { error: dbError } = await supabase.from('orders').insert({
      ref: orderRef,
      status: 'pending',
      payment_method: paymentMethod,
      fulfilment,
      customer: contact,
      address: address ?? null,
      delivery_zone: deliveryZone ?? null,
      pickup_point: pickupPoint ?? null,
      cart_items: normalizedItems,
      total_zar: serverTotalZar,
      shipping_zar: serverShippingZar,
      proof_url: proofPath ?? null,
    });

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return res.status(500).json({ error: 'Failed to save order. Please contact hello@mapheane.art.' });
    }

    try {
      if (!resend) throw new Error('Resend API key is not configured');
      const itemList = normalizedItems
        .map(i => `<li>${esc(i.title)} × ${i.quantity} — ${formatZar(i.priceZar * i.quantity)}</li>`)
        .join('');

      await Promise.all([
        resend.emails.send({
          from: FROM_ADDRESS,
          to: contact.email,
          subject: `Order received — ${esc(orderRef)}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;color:#2D2A26;line-height:1.7">
              <p>Dear ${esc(contact.name)},</p>
              <p>Thank you for your order. I have received your payment notification for <strong>${esc(orderRef)}</strong> and will confirm it within 2 hours during studio hours (Mon–Sat, 9am–5pm SAST).</p>
              <ul style="padding-left:20px">${itemList}</ul>
              <p><strong>Total: ${formatZar(serverTotalZar)}</strong>${serverShippingZar > 0 ? ` (includes ${formatZar(serverShippingZar)} delivery)` : ' (free pickup)'}</p>
              <p>You will receive a follow-up email once your payment has been verified.</p>
              <p>Warm regards,<br/>Mapheane<br/><a href="mailto:hello@mapheane.art">hello@mapheane.art</a></p>
            </div>
          `,
        }),
        resend.emails.send({
          from: FROM_ADDRESS,
          to: emailSettings.studioEmail,
          replyTo: contact.email,
          subject: (emailSettings.orderSubject || 'New order - [REF]').replace('[REF]', esc(orderRef)),
          html: `
            <div style="font-family:sans-serif;max-width:600px;color:#2D2A26">
              <h2 style="font-size:18px">New order: ${esc(orderRef)}</h2>
              <p><strong>Customer:</strong> ${esc(contact.name)} · <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
              <p><strong>Phone:</strong> ${esc(contact.phone ?? '—')}</p>
              <p><strong>Payment:</strong> ${esc(paymentMethod.toUpperCase())}</p>
              <p><strong>Fulfilment:</strong> ${esc(fulfilment ?? '—')}${deliveryZone ? ` (${esc(deliveryZone)})` : ''}${pickupPoint ? ` — Pickup: ${esc(pickupPoint)}` : ''}</p>
              <ul style="padding-left:20px">${itemList}</ul>
              <p><strong>Total: ${formatZar(serverTotalZar)}</strong></p>
              ${proofPath ? `<p><strong>Proof of payment:</strong> ${esc(proofPath)}</p>` : ''}
            </div>
          `,
        }),
      ]);
    } catch (emailErr) {
      console.error('Email send error (order saved):', emailErr);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: 'Order failed. Please try again or contact hello@mapheane.art.' });
  }
}

module.exports = handler;
