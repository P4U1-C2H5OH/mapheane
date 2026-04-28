const DEFAULT_PICKUP_POINTS = [
  { id: 'studio', name: "Mapheane's Studio", address: 'Studio 4, Kingsway Arts Quarter, Maseru CBD', city: 'Maseru', hours: 'Mon-Fri 9am-5pm, Sat 9am-1pm', note: 'Collection by appointment - Mapheane will confirm your slot.', primary: true, lat: -29.3167, lng: 27.4833 },
  { id: 'pioneer-mall', name: 'Pioneer Mall Collection', address: 'Pioneer Mall, Kingsway Road, Level 1 - Customer Services', city: 'Maseru', hours: 'Mon-Sat 8am-7pm, Sun 9am-4pm', note: 'Parcels held for 5 working days.', primary: false, lat: -29.31, lng: 27.476 },
  { id: 'maseru-west', name: 'Maseru West Hub', address: 'Maseru West Shopping Centre, Main Counter', city: 'Maseru West', hours: 'Mon-Sat 8am-6pm', note: null, primary: false, lat: -29.325, lng: 27.46 },
];

const DEFAULTS = {
  studio: {
    name: 'Mapheane',
    email: 'hello@mapheane.art',
    phone: '+266 22 000 000',
    address: 'Studio 4, Kingsway Arts Quarter, Maseru CBD',
    city: 'Maseru',
    country: 'Kingdom of Lesotho',
    studioHours: 'Mon-Sat 9am-5pm SAST',
  },
  payment: {
    mpesaName: 'Mapheane Arts Studio',
    mpesaNumber: '+266 5912 3456',
    ecocashName: 'Mapheane Arts',
    ecocashNumber: '+266 5878 9012',
    wireAccountName: 'Mapheane',
    wireBankName: 'Standard Lesotho Bank',
    wireAccountNumber: '000-000-000-000',
    wireSwift: 'STANLSLM',
    wireBranch: 'Kingsway, Maseru, Kingdom of Lesotho',
  },
  shipping: {
    maseru: '150',
    lesotho: '280',
    southAfrica: '450',
    international: '950',
    pickupPoints: DEFAULT_PICKUP_POINTS,
  },
  commission: {
    slotsTotal: '4',
    slotsTaken: '1',
    status: 'open',
    depositPct: '50',
    responseHours: '48',
  },
  email: {
    orderEmail: 'hello@mapheane.art',
    replyTo: 'hello@mapheane.art',
    orderSubject: 'New order - [REF]',
    contactSubject: '[TYPE] inquiry from [NAME]',
    newsletterFrom: 'Studio Letters <studio@mapheane.art>',
  },
};

function pickPublicStudio(value = {}) {
  return {
    name: value.name,
    email: value.email,
    phone: value.phone,
    address: value.address,
    city: value.city,
    country: value.country,
    studioHours: value.studioHours,
  };
}

function normalizePickupPoint(point, fallbackId) {
  if (!point || typeof point !== 'object') return null;
  const id = String(point.id || fallbackId || '').trim();
  const name = String(point.name || '').trim();
  const address = String(point.address || '').trim();
  const city = String(point.city || '').trim();
  const hours = String(point.hours || '').trim();
  const lat = Number(point.lat);
  const lng = Number(point.lng);
  if (!id || !name || !address || !city || !hours || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id,
    name,
    address,
    city,
    hours,
    note: point.note == null ? null : String(point.note),
    primary: Boolean(point.primary),
    lat,
    lng,
  };
}

function normalizePickupPoints(value) {
  const points = Array.isArray(value) ? value : [];
  const normalized = points
    .map((point, index) => normalizePickupPoint(point, `pickup-${index + 1}`))
    .filter(Boolean);
  return normalized.length ? normalized : DEFAULT_PICKUP_POINTS;
}

function mergeDefaults(rows) {
  const map = Object.fromEntries((rows ?? []).map(row => [row.key, row.value ?? {}]));
  const shipping = {
    ...DEFAULTS.shipping,
    ...(map.shipping ?? {}),
  };
  shipping.pickupPoints = normalizePickupPoints(shipping.pickupPoints);

  return {
    studio: {
      ...DEFAULTS.studio,
      ...pickPublicStudio(map.studio),
    },
    payment: {
      ...DEFAULTS.payment,
      ...(map.payment ?? {}),
    },
    shipping,
    commission: {
      ...DEFAULTS.commission,
      ...(map.commission ?? {}),
    },
    email: {
      ...DEFAULTS.email,
      ...(map.email ?? {}),
    },
  };
}

async function loadSettings(supabase, keys = ['studio', 'payment', 'shipping', 'commission', 'email']) {
  const { data, error } = await supabase
    .from('studio_settings')
    .select('key, value')
    .in('key', keys);
  if (error) throw error;
  return mergeDefaults(data);
}

async function loadEmailSettings(supabase) {
  const settings = await loadSettings(supabase, ['studio', 'email']);
  return {
    studioEmail: settings.email.orderEmail || settings.studio.email || DEFAULTS.email.orderEmail,
    replyTo: settings.email.replyTo || settings.studio.email || DEFAULTS.email.replyTo,
    orderSubject: settings.email.orderSubject || DEFAULTS.email.orderSubject,
    contactSubject: settings.email.contactSubject || DEFAULTS.email.contactSubject,
  };
}

module.exports = {
  DEFAULTS,
  DEFAULT_PICKUP_POINTS,
  loadSettings,
  loadEmailSettings,
  mergeDefaults,
  normalizePickupPoints,
};
