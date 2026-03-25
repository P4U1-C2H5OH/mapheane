# Content Guide — Mapheane Platform

How to update all content without touching component code. Every data-driven section has a dedicated data file or constant — find it here.

---

## Artworks — `src/data/artworks.ts`

Prices are stored in **EUR**. The UI converts to the visitor's chosen currency automatically.

```ts
interface Artwork {
  id: number;           // unique integer — increment from the highest existing id
  title: string;        // artwork title
  dimensions: string;   // e.g. '97cm × 130cm' or '45cm × 30cm × 25cm'
  technique: string;    // e.g. 'Mixed media on resin canvas'
  medium: 'Painting' | 'Drawing' | 'Clay Model';
  status: 'Available' | 'Sold';
  cropPosition: string; // CSS object-position e.g. '50% 30%' — adjust to frame the work
  offsetClass: string;  // staggered grid: 'mt-0' | 'mt-12 md:mt-32' | 'mt-6 md:mt-16'
  price: number;        // in EUR — R18 per €1 approximation used for ZAR display
  description: string;  // 2–4 sentences
  images: string[];     // [0] is hero image, rest are gallery views
  year?: number;
}
```

### Adding an artwork

```ts
{
  id: 10,
  title: 'Titre',
  dimensions: '80cm × 100cm',
  technique: 'Mixed media on resin canvas',
  medium: 'Painting',
  status: 'Available',
  cropPosition: '50% 40%',
  offsetClass: 'mt-0',                  // rotate: mt-0 → mt-12 md:mt-32 → mt-6 md:mt-16
  price: 3800,                          // EUR
  year: 2025,
  description: 'Description here.',
  images: ['https://res.cloudinary.com/...'],
},
```

### Marking as sold
Change `status: 'Available'` → `status: 'Sold'`. The sold badge and "Commission Similar" CTA appear automatically.

### Gallery grid stagger
Three offset classes rotate through each row: `'mt-0'` → `'mt-12 md:mt-32'` → `'mt-6 md:mt-16'`.

---

## Events — `src/data/events.ts`

Full interface — the `EventsManager` admin writes all these fields:

```ts
interface Event {
  id: number;
  title: string;
  subtitle?: string;
  type: 'exhibition' | 'workshop' | 'talk' | 'fair' | 'private';
  status: 'upcoming' | 'ongoing' | 'past';
  description: string;       // multi-paragraph, shown on detail page
  theme: string;             // concept/theme — shown in dedicated block
  featured: boolean;         // appears on home page
  images: string[];          // [0] is hero
  artworks?: number[];       // IDs of artworks being shown — linked to artworks.ts
  tags: string[];

  highlights: string[];      // bullet list shown on EventDetailPage — edit via EventsManager

  location: {
    venue: string;
    address: string;
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };

  schedule: {
    startDate: string;         // ISO date
    endDate: string;
    openingReception?: string; // ISO datetime — shown on detail page
    hours: Record<string, string>; // e.g. { "Tue–Sat": "11am–7pm", "Sun": "2pm–6pm" }
  };

  ticketInfo?: {
    price: string;             // e.g. "Free" or "R150"
    required: boolean;
    url?: string;              // link to Eventbrite / external RSVP
  };

  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}
```

**Admin-to-public guarantee:** All fields now have matching form fields in `EventsManager`. Create events in admin — they display correctly on the public event page.

---

## Artist Moments — `src/data/moments.ts`

```ts
interface MomentMedia {
  type: 'image' | 'video' | 'gallery';
  url: string;
  thumbnail?: string;
  caption?: string;    // shown below image on detail page
  alt: string;         // required for accessibility
}

interface ArtistMoment {
  id: number;
  title: string;
  date: string;        // ISO date
  type: 'studio' | 'exhibition' | 'process' | 'travel' | 'inspiration' | 'personal';
  location?: string;
  excerpt: string;     // 1–2 sentences — shown in journal cards
  content: string;     // full article text — paragraphs separated by \n\n
  media: MomentMedia[];   // array of images/videos — NOT plain string[]
  tags: string[];
  featured?: boolean;
  mood?: string;       // e.g. 'Reflective' — shown as badge on detail page
}
```

**Important:** `media` is `MomentMedia[]`, not `string[]`. When adding moments manually to the data file, use the full object shape. The `MomentsManager` admin now writes the correct shape automatically.

```ts
// Correct:
media: [
  { type: 'image', url: '/path.jpg', alt: 'Studio morning light', caption: 'First light through the new windows.' }
]

// Wrong — will break MomentDetailPage:
media: ['/path.jpg']
```

---

## Commission page — `src/pages/CommissionPage.tsx`

Update these constants at the top of the file to reflect current availability:

```ts
const STATUS: 'open' | 'waitlist' | 'closed' = 'open';  // controls the CTA and slot indicator
const SLOTS_TOTAL = 4;
const SLOTS_TAKEN = 1;
```

Update `PRICING` array when price ranges change:

```ts
const PRICING = [
  { medium: 'Charcoal & Graphite Drawing', range: 'R3,000 – R18,000', note: '...', sub: '...' },
  { medium: 'Mixed Media Painting',        range: 'R18,000 – R80,000', note: '...', sub: '...' },
  { medium: 'Glazed Stoneware Sculpture',  range: 'R10,000 – R55,000', note: '...', sub: '...' },
];
```

These will also be configurable via Admin Settings once the backend is wired.

---

## Checkout — shipping zones and payment details

### Delivery zones — `src/pages/CheckoutPage.tsx`

```ts
const DELIVERY_ZONES = [
  { id: 'maseru',        label: 'Maseru (city delivery)',     price: 150,  eta: '1–2 working days' },
  { id: 'lesotho',       label: 'Other Lesotho districts',    price: 280,  eta: '3–5 working days' },
  { id: 'southafrica',   label: 'South Africa',               price: 450,  eta: '3–5 working days' },
  { id: 'international', label: 'International (DHL Express)', price: 950, eta: '5–10 working days' },
];
```

All prices in ZAR. Displayed in the visitor's chosen currency via `fromZAR()`.

### Payment numbers — `src/pages/CheckoutPage.tsx`

**Update these with real numbers before launch:**

```ts
const PAYMENT_METHODS = [
  {
    id: 'mpesa',
    details: {
      accountName: 'Mapheane Arts Studio',  // ← update if account name changes
      number: '+266 5912 3456',             // ← UPDATE WITH REAL M-PESA NUMBER
    }
  },
  {
    id: 'ecocash',
    details: {
      accountName: 'Mapheane Arts',
      number: '+266 5878 9012',             // ← UPDATE WITH REAL ECOCASH NUMBER
    }
  }
];
```

These numbers are shown to customers on the checkout page and in order confirmation emails. Also configurable in Admin → Settings → Payment Numbers once the backend is wired.

### Pickup points — `src/pages/CheckoutPage.tsx`

`PICKUP_POINTS` array — update hours and notes when locations change. Coordinates (`lat`, `lng`) drive the Leaflet map.

---

## Print editions — `src/pages/ShopPage.tsx`

```ts
{
  id: 'edition-id',
  artworkId: 1,          // must match an id in artworks.ts
  title: 'Artwork Title',
  type: 'Limited' | 'Open' | 'Artist Proof',
  size: '60 × 80 cm',
  paper: 'Hahnemühle German Etching 310gsm',
  editionSize: 25,       // omit for Open editions
  editionSold: 8,        // update as editions sell — drives the progress bar
  price: { zar: 4500, eur: 250 },
  image: '/path.jpg',
  available: true,
  description: 'Short description.',
},
```

**Note:** `editionSold` is currently hardcoded. Once Supabase is connected, this will update automatically from orders.

---

## Workshops — `src/pages/WorkshopsPage.tsx`

```ts
// Update pricing:
price: { local: 'R1,400', intl: '$80 USD' },

// Update retreat availability:
{
  available: true,
  nextDate: 'June 2025',  // ← update each season
}
```

---

## Collector Circle — `src/pages/CollectorCirclePage.tsx`

Membership tier prices and perks are in the `TIERS` array at the top of the file. Update `price.monthly` and `price.annual` fields and edit the `perks` array.

---

## Press Kit page — `src/pages/PressKitPage.tsx`

Update these arrays at the top of the file:

```ts
const EXHIBITIONS = [
  { year: '2025', title: '...', venue: '...', type: 'Solo' | 'Group' },
];

const PRESS = [
  { title: '...', outlet: '...', year: '2025', type: 'Feature' | 'Profile' | 'Interview' | 'Listing', url: '...' },
];

const COLLECTIONS = [
  { collector: 'Private collection', location: 'London, United Kingdom' },
];
```

These same arrays are used in `AboutPage.tsx` — keep them in sync.

---

## Global identity fields

If contact details, social handles, or studio address change:

| Detail | Files to update |
|--------|----------------|
| Email address | `ContactPage.tsx`, `Navigation.tsx` (overlay footer), `Footer.tsx`, `PressKitPage.tsx`, `PrivacyPage.tsx`, `TermsPage.tsx`, `OrderTrackingPage.tsx`, Admin Settings |
| Phone number | `ContactPage.tsx`, Admin Settings |
| Studio address | `Footer.tsx`, `CheckoutPage.tsx` (Studio pickup point), `AboutPage.tsx` |
| Instagram handle | `ContactPage.tsx`, `Footer.tsx` |
| Facebook URL | `ContactPage.tsx`, `Footer.tsx` |
| Payment numbers | `CheckoutPage.tsx` → `PAYMENT_METHODS`, Admin Settings → Payment Numbers |
| Commission slots | `CommissionPage.tsx` → `SLOTS_TOTAL`, `SLOTS_TAKEN`, Admin Settings → Commission |
| Shipping rates | `CheckoutPage.tsx` → `DELIVERY_ZONES`, Admin Settings → Shipping Rates |

---

## Admin Settings (currently frontend-only)

The Admin → Settings page (`AdminSettings.tsx`) has form fields for all the values above. Currently it saves to React state only. Once Supabase is connected, saving in admin will update the database and all public pages will read from there — you won't need to edit source files for operational details.
