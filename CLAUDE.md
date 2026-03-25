# CLAUDE.md — Mapheane Digital Studio Platform

This is the primary instruction file for Claude Code. Read this entire file before touching any code. For vision and market research that informs decisions, see VISION.md and RESEARCH.md.

---

## The artist

**Mapheane** — contemporary fine artist, **Maseru, Kingdom of Lesotho**. Mixed media painting (resin canvas), charcoal/graphite drawing, glazed stoneware sculpture. Basotho cultural roots: litema wall painting, seanamarena blankets, highland earth and clay. This is not a portfolio site — it is a complete studio operating system.

---

## Tech stack

```
React 18.3        TypeScript 5.5    Tailwind CSS 3.4
Framer Motion 11  Lucide React      Vite 5.2
```

**No routing library.** Navigation is a single `PageName` union type in `src/App.tsx` with a `go()` function. New page = add to union, import, add conditional render in `<AnimatePresence>` block.

```bash
npm install && npm run dev    # http://localhost:5173
npm run build                 # /dist — deploy to Vercel/Netlify
```

---

## Project structure

```
src/
├── App.tsx                         # Root. All 23 pages routed here. PageName union.
├── index.tsx
├── index.css                       # Grain overlay, ambient gradients, utilities
│
├── context/
│   ├── AuthContext.tsx              # Mock auth (localStorage key: mapheane-user)
│   ├── CartContext.tsx              # Cart, localStorage persisted
│   ├── CurrencyContext.tsx          # ZAR/EUR/USD/GBP, localStorage persisted
│   ├── LanguageContext.tsx          # EN/Sesotho translations
│   ├── ToastContext.tsx             # Global notifications
│   └── WishlistContext.tsx         # Wishlist, localStorage persisted
│
├── hooks/
│   ├── useExitIntent.ts             # Exit-intent trigger for newsletter modal
│   ├── useSEO.ts                    # Meta, OG, Twitter Card, JSON-LD
│   └── useScrollReveal.ts           # IntersectionObserver scroll animation
│
├── components/
│   ├── Navigation.tsx               # Fixed nav, ⌘K search, currency/language, overlay menu
│   ├── Footer.tsx                   # Newsletter, sitemap, legal links
│   ├── HeroSection.tsx
│   ├── AboutSection.tsx
│   ├── GallerySection.tsx           # Home gallery grid, QuickView
│   ├── MarqueeSection.tsx
│   ├── ServicesSection.tsx          # Artist Moments home teaser
│   ├── EventsSection.tsx
│   ├── ContactSection.tsx           # Contact form with inquiry types
│   ├── CartIcon.tsx
│   ├── CookieBanner.tsx             # GDPR, localStorage consent
│   ├── CurrencySwitcher.tsx         # ZAR/EUR/USD/GBP dropdown
│   ├── LazyImage.tsx                # IntersectionObserver lazy load, shimmer
│   ├── LanguageToggle.tsx           # EN/ST toggle
│   ├── LightboxModal.tsx            # Full-screen viewer, keyboard nav
│   ├── NewsletterModal.tsx          # Exit-intent + timed trigger
│   ├── PickupMap.tsx                # Leaflet map, 6 Lesotho pickup points
│   ├── QuickViewModal.tsx           # Gallery card overlay
│   ├── ScrollToTop.tsx              # SVG progress ring
│   ├── SearchOverlay.tsx            # Live search, keyboard nav ↑↓ Enter Esc
│   ├── CommissionModal.tsx          # Commission inquiry form
│   └── admin/
│       ├── AdminSettings.tsx        # Studio, payment, shipping, commission, email, security
│       ├── CollectorCRM.tsx         # Art-specific profiles, LTV, segmentation
│       ├── CommandCenter.tsx        # KPI cards, sparklines, action queue
│       ├── CommissionPipeline.tsx   # 9-stage Kanban tracker
│       ├── DashboardOverview.tsx    # Re-exports CommandCenter (legacy compat)
│       ├── EventsManager.tsx        # Full CRUD + highlights/ticket/hours/contact
│       ├── GalleryManager.tsx       # Full CRUD form, image preview, crop
│       ├── GalleryReadiness.tsx     # Score ring, interactive checklist, gallery targets
│       ├── ImageUpload.tsx          # Base64 image upload component
│       ├── MarketingHub.tsx         # Campaigns, luxury promotions, segments
│       ├── MessagesManager.tsx      # Inbox, reply templates, CRM linking
│       ├── MomentsManager.tsx       # Journal CRUD, MomentMedia[] output
│       ├── OrdersManager.tsx        # M-Pesa/EcoCash verification pipeline
│       ├── RevenueAnalytics.tsx     # Charts, LTV, seasonality, projections
│       └── WorkshopsManager.tsx     # Booking list, waitlists, create form
│
├── pages/  (22 public + 1 admin)
│   ├── AboutPage.tsx               useSEO
│   ├── AdminDashboard.tsx          13 admin modules, dark sidebar
│   ├── ArtworkPage.tsx             useSEO Product schema, useCurrency
│   ├── AuthPage.tsx                login/signup/reset, social buttons
│   ├── CartPage.tsx                useCurrency, LazyImage, save-for-later
│   ├── CheckoutPage.tsx            Delivery/Pickup, M-Pesa/EcoCash, PickupMap, useCurrency
│   ├── CollectorCirclePage.tsx     4 membership tiers, billing toggle, FAQ
│   ├── CommissionPage.tsx          useSEO, slot indicator, timeline, FAQ
│   ├── ContactPage.tsx             Standalone contact, inquiry types
│   ├── EventDetailPage.tsx         useSEO, ICS download, handleShare wired
│   ├── EventsPage.tsx              Filters, upcoming/past sections
│   ├── GalleryPage.tsx             useSEO, useCurrency, QuickView, filters
│   ├── MomentDetailPage.tsx        handleShare wired, media lightbox
│   ├── MomentsPage.tsx             Type filter, sorted by date
│   ├── NotFoundPage.tsx            Ghost 404, mountain quote
│   ├── OrderTrackingPage.tsx       Reference lookup, timeline, DHL tracking
│   ├── PressKitPage.tsx            CV, exhibitions, press, media download
│   ├── PrivacyPage.tsx             Lesotho jurisdiction, GDPR-aligned
│   ├── ShopPage.tsx                useSEO, useCurrency, edition progress bars
│   ├── TermsPage.tsx               All commerce types covered
│   ├── WishlistPage.tsx            useCurrency, animated grid
│   └── WorkshopsPage.tsx           useSEO, booking modal, retreats
│
├── data/
│   ├── artworks.ts                 9 artworks — prices in EUR
│   ├── events.ts                   5 events — full Event interface
│   └── moments.ts                  8 journal entries — MomentMedia[] interface
│
└── hooks/
    ├── useSEO.ts
    ├── useExitIntent.ts
    └── useScrollReveal.ts
```

---

## PageName union (23 routes)

```typescript
export type PageName =
  | 'home' | 'about' | 'artwork' | 'gallery'
  | 'cart' | 'checkout' | 'wishlist' | 'track-order'
  | 'moments' | 'moment-detail'
  | 'events' | 'event-detail'
  | 'commission' | 'workshops' | 'shop'
  | 'circle' | 'presskit' | 'contact'
  | 'auth' | 'admin'
  | 'privacy' | 'terms' | '404';
```

**Adding a new page:**
1. Create `src/pages/NewPage.tsx` — motion.div with opacity fade, scroll-to-top in useEffect, `onNavigate: (page: any) => void`
2. Add name to `PageName` union in `App.tsx`
3. Import it in `App.tsx`
4. Add `{page === 'new-page' && <NewPage key="new-page" onNavigate={go} />}` in `<AnimatePresence>`
5. Add to `Footer.tsx` sitemap if public-facing
6. Add to `Navigation.tsx` `menuLinks` array if it needs nav access

---

## Design system rules — non-negotiable

### Colour tokens
```
background      #FAF7F2   primary page bg
cream           #F5F0EB   section alternation
parchment       #EDE8E0   cards, filter panels
terracotta      #A0522D   PRIMARY ACCENT — CTAs, links on hover
terracottaLight #C4784F   hover states
terracottaDark  #7A3E20   active/pressed
charcoal        #2D2A26   primary text
ink             #1A1815   deepest tone — modal backdrops, admin sidebar
muted           #9E9890   body copy, captions
sage            #7C8B6F   success, pickup (free), confirmed
gold            #B8A088   decorative only — overlay menu hover
parchment       #EDE8E0   cards, admin panel backgrounds
```

Never use `warmWhite` — it is not in the design system.

### Typography
- `font-serif` → Playfair Display — headings, display, pull quotes
- `font-sans` → DM Sans — navigation, body, labels, buttons, data
- Heading letter-spacing: `-0.02em` large, `-0.01em` medium
- DM Sans: max weight 500. Never 600 or 700.
- Labels: `text-label uppercase tracking-[0.2em] text-muted`

### Animation
- Standard easing: `[0.25, 0.46, 0.45, 0.94]` (ease-luxury)
- Page transitions: duration 0.5s
- Hover states: minimum duration-300, prefer duration-400
- Image hover zoom: `group-hover:scale-[1.03]` max, duration-700
- No bouncy springs on UI elements

### Artwork images
- Always `draggable={false}`
- Always `LazyImage` component (not raw `<img>`)
- Wrapper: `className="artwork-container"` (applies right-click protection)
- Shadow: `shadow-artwork` → `shadow-artwork-hover` on hover

---

## Currency system

All artwork prices in the codebase are stored in **EUR**. The `useCurrency` hook handles all display formatting.

```typescript
const { format, fromZAR, currency } = useCurrency();

// EUR-priced items (artworks, prints):
format(artwork.price)             // "R18,000" | "€1,000" | "$1,090"

// ZAR-native prices (shipping zones, workshop fees):
fromZAR(150)                      // "R150" | "€8" | "$9"
```

User's currency preference is persisted to `localStorage` key `mapheane_currency`. It survives page refresh. **Never hardcode currency symbols or conversion multipliers** — always call `format()` or `fromZAR()`.

**Exception:** The M-Pesa/EcoCash payment amount shown in CheckoutPage is always displayed in ZAR with a "ZAR" label because those payment rails are ZAR-denominated.

---

## Authentication (mock)

`AuthContext.tsx` is fully simulated. Key facts:
- `localStorage` key: `mapheane-user` (not `aria-user`)
- Admin login: email must include "admin" or be `hello@mapheane.art`
- Artist login: email must include "artist" or be exactly `hello@mapheane.art`
- Real auth: replace with Supabase Auth (see BACKEND_INTEGRATION.md)

---

## Admin system (13 modules)

```typescript
export type AdminView =
  | 'command' | 'analytics' | 'collectors' | 'commissions'
  | 'gallery' | 'moments' | 'events' | 'workshops'
  | 'orders' | 'messages' | 'marketing' | 'readiness' | 'settings';
```

Admin sidebar is dark (`#1A1815`). Content panels use `bg-background` (#FAF7F2). Same Playfair/DM Sans type split as public site. All currency displays use `useCurrency`.

---

## Data interfaces — critical shapes

### Artwork (artworks.ts)
```typescript
interface Artwork {
  id: number;
  title: string;
  dimensions: string;
  technique: string;
  medium: 'Painting' | 'Drawing' | 'Clay Model';
  status: 'Available' | 'Sold';
  cropPosition: string;   // CSS object-position
  offsetClass: string;    // Tailwind margin for staggered grid
  price: number;          // EUR — multiply by 18 for ZAR approximation
  description: string;
  images: string[];       // [0] is hero
  year?: number;
}
```

### MomentMedia (moments.ts) — admin must write, public reads
```typescript
interface MomentMedia {
  type: 'image' | 'video' | 'gallery';
  url: string;
  thumbnail?: string;
  caption?: string;
  alt: string;
}
```
MomentsManager wraps ImageUpload output into this shape. Never store raw `string[]` as `media`.

### Event (events.ts) — admin must write all fields
```typescript
interface Event {
  highlights: string[];        // Shown as bullet list on EventDetailPage
  ticketInfo?: { price: string; required: boolean; url?: string };
  contact?: { email?: string; phone?: string; website?: string };
  schedule: {
    startDate: string;
    endDate: string;
    openingReception?: string;
    hours: Record<string, string>;  // e.g. "Tue–Sat": "11am–7pm"
  };
}
```

---

## What still needs real implementation

| Feature | Current state | Integration |
|---------|--------------|------------|
| Auth | Mock `setTimeout` | Supabase Auth |
| Contact form | Simulated | Resend API |
| Commission inquiry | Simulated | Resend API |
| Workshop booking | Simulated | Resend API |
| Newsletter | Simulated | Resend Audiences |
| Order submission | Simulated | Supabase + Cloudinary |
| Proof of payment | Base64 in state | Cloudinary / Supabase Storage |
| Payment verification | Manual (by design for M-Pesa/EcoCash) | Future webhook |
| Admin data persistence | In-memory | Supabase tables |
| Images | `/artportfolio.jpg` placeholder | Cloudinary |
| Membership billing | Interest capture only | Stripe/Memberful |

Full implementation guides with code samples: see **BACKEND_INTEGRATION.md**

---

## Artist identity — keep consistent

| Field | Value |
|-------|-------|
| Name | Mapheane |
| Location | Maseru, Kingdom of Lesotho |
| Email | hello@mapheane.art |
| Phone | +266 22 000 000 (placeholder) |
| Instagram | @mapheane_art |
| Facebook | facebook.com/mapheane |
| Currency | ZAR primary, EUR secondary |
| Studio hours | Mon–Sat 9am–5pm SAST (UTC+2) |

---

## Code style rules

- No `any` types except `onNavigate: (page: any) => void` (intentional flexibility)
- Named exports only — no default exports on components
- Tailwind only — no inline styles except: dynamic values (percentages, progress), `objectPosition` for artwork images, admin sidebar brand colours
- Framer Motion: `motion.div` with variants for page entry; `whileInView` + `viewport={{ once: true }}` for scroll animations
- Forms: controlled inputs, validate on submit, clear errors on change
- No `warmWhite` in any className — use `bg-cream` or `bg-parchment/40`
