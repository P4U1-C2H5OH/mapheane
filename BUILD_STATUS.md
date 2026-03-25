# Build Status — Mapheane Digital Studio Platform

Current as of: Phase C complete. UI is production-ready. Backend wiring is next.

---

## ✅ Phase 1 — Foundations

- Design token system (full luxury Tailwind config: colours, spacing, easing, shadows)
- Global CSS: grain overlay, ambient gradients, editorial utilities, artwork protection
- `ToastContext`, `WishlistContext`, `CartContext`, `AuthContext`
- `Navigation` — scroll progress bar, overlay menu, wishlist badge
- `Footer` — newsletter, sitemap, dark editorial
- `HeroSection`, `MarqueeSection`, `AboutSection`, `GallerySection`, `EventsSection`, `ContactSection`
- `ScrollToTop` — SVG progress ring
- `App.tsx` — all contexts, full `PageName` union

---

## ✅ Phase 2 — Commerce & modals

- `LightboxModal` — full-screen, keyboard nav, zoom, drag-swipe
- `QuickViewModal` — gallery overlay with cart/wishlist/commission
- `CommissionModal` — 2-step inquiry form
- `CommissionPage` — slots, ZAR pricing tiers, timeline, testimonials, FAQ
- `GallerySection` — Quick View + Full Page hover, wishlist hearts
- `ArtworkPage` — lightbox, commission modal, wishlist, share, ZAR pricing, COA language

---

## ✅ Phase 3 — Revenue pages

- `WorkshopsPage` — 4 workshops + 2 retreats, booking modal, testimonials
- `ShopPage` — 6 print editions, limited/open filter, edition progress bars
- `AboutPage` — biography, cultural context, exhibition CV, press, collections

---

## ✅ Phase 4 — Full platform

- `ContactSection`, `WishlistPage`, `NotFoundPage`, `PrivacyPage`, `TermsPage`
- `GalleryPage` — filters, ZAR pricing, QuickView, empty state
- `CheckoutPage` — Delivery/Pickup, 4 delivery zones (ZAR), 6 pickup points, M-Pesa + EcoCash, proof upload
- `MomentsPage` + `MomentDetailPage` — journal with type filter, lightbox
- `EventsPage` + `EventDetailPage` — filters, ICS download, RSVP, calendar links
- `AuthPage` — login/signup
- `AdminDashboard` — 12 modules (first version)

---

## ✅ Phase 5 — Admin system

- `CommandCenter` — KPI cards, sparklines, action queue, portfolio snapshot
- `CollectorCRM` — art-specific profiles, LTV formula, segmentation, detail panel
- `CommissionPipeline` — 9-stage tracker, advance workflow, deposit tracking
- `RevenueAnalytics` — bar charts, channel breakdown, LTV, seasonal, projections
- `MarketingHub` — campaigns, luxury promotions, segments, compose modal
- `GalleryReadiness` — score ring (weighted), interactive checklist, gallery fit scores
- `WorkshopsManager` — bookings, capacity bars, waitlist, participant email
- `OrdersManager` — M-Pesa/EcoCash verification pipeline
- `MessagesManager` — inbox, type filters, reply templates, CRM linking
- `GalleryManager` — first version

---

## ✅ Phase 6 — UI completion

- `CurrencyContext` — ZAR/EUR/USD/GBP, `format()`, `fromZAR()`, **localStorage persisted**
- `LanguageContext` — EN/Sesotho translations
- `useSEO` — title, OG, Twitter Card, JSON-LD Product + WebSite schema
- `useExitIntent` — mouseleave + idle scroll fallback
- `SearchOverlay` — live search artworks/moments/events, keyboard nav (↑↓ Enter Esc)
- `NewsletterModal` — exit-intent triggered, success state
- `CookieBanner` — GDPR, localStorage consent
- `CurrencySwitcher` — flags, accessible listbox
- `LanguageToggle` — EN/ST pill
- `LazyImage` — IntersectionObserver, shimmer skeleton, blur-up reveal
- `PickupMap` — Leaflet, 6 Lesotho points, selection sync, fallback list
- `CollectorCirclePage` — 4 membership tiers, billing toggle, FAQ accordion, join modal
- `PressKitPage` — CV, exhibitions, press, media download, statement
- `ContactPage` — standalone contact, inquiry types, studio hours, quick CTAs
- `CartPage` — rebuilt: currency, LazyImage, save-for-later, trust signals, Circle upsell
- `OrderTrackingPage` — reference lookup, stage timeline, DHL tracking
- `AuthPage` — rebuilt: 3 modes (login/signup/reset), social buttons, show/hide password
- `GalleryManager` — rebuilt: full CRUD form, image preview, crop position, status toggle
- `Navigation` — search button (⌘K), CurrencySwitcher, LanguageToggle, mobile toggles
- `App.tsx` — 23 pages, all providers, search overlay, newsletter modal, cookie banner
- `index.html` — full meta, OG, Twitter Card, font preloads
- `public/robots.txt`, `public/sitemap.xml`, `public/manifest.json`

---

## ✅ Phase A — Reported bugs fixed

- **Nav overlay broken links** — Portfolio (`#gallery` fallback) and all menu items now navigate directly via page key
- **Currency persistence** — `CurrencyContext` localStorage persisted; choice survives refresh
- **CheckoutPage hardcoded ZAR** — all prices now use `fmt()`/`fromZAR()`; M-Pesa/EcoCash amount stays ZAR (correct)
- **AuthContext stale branding** — localStorage key `aria-user` → `mapheane-user`; mock artist name fixed
- **`warmWhite` CSS** — replaced with valid tokens in `ServicesSection` + `EventDetailPage`
- **Narrow `onNavigate` types** — EventsPage, EventDetailPage, MomentsPage, MomentDetailPage all widened to `(page: any) => void`

---

## ✅ Phase B — Admin → public data mismatches fixed

- **EventsManager** — injected all missing form fields: `highlights`, `ticketInfo`, `contact.{email,phone,website}`, `openingReception`, `hours` editor. Public `EventDetailPage` renders all of these.
- **MomentsManager** — `ImageUpload` previously wrote raw `string[]` to `media`. Now wraps each URL in `MomentMedia {type, url, alt, caption}`. Public `MomentDetailPage` reads `media[0].url`, `.caption`, `.alt` — now in sync.

---

## ✅ Phase C — Dead UX wired

- **WorkshopsManager** — "New Workshop" button was dead. Now toggles a full create form (all fields, saves to local state)
- **Share buttons** — `EventDetailPage` and `MomentDetailPage` share icons now call `navigator.share` with clipboard fallback
- **Admin Settings** — replaced "coming soon" placeholder with real accordion settings: studio details, M-Pesa/EcoCash payment numbers, shipping rates (all 4 ZAR zones), commission slot control, email preferences, security

---

## 🔲 Phase D — Backend (every simulation becomes real)

### Priority 1: Must do before launch
- [ ] Replace `AuthContext.tsx` mock with Supabase Auth (see BACKEND_INTEGRATION.md §1)
- [ ] Wire contact/commission/workshop forms to Resend (§2)
- [ ] Wire checkout to Supabase + Cloudinary proof upload (§3)
- [ ] Wire newsletter to Resend Audiences (§4)
- [ ] Replace `/artportfolio.jpg` with real Cloudinary image URLs in `src/data/artworks.ts`

### Priority 2: Shortly after launch
- [ ] Connect `GalleryManager`, `EventsManager`, `MomentsManager`, `MessagesManager`, `OrdersManager` to Supabase tables (§6)
- [ ] Wire `AdminSettings` values to Supabase (shipping rates, payment numbers, commission slots)
- [ ] Enable Supabase Row Level Security on all tables (§ Security checklist)

### Priority 3: Growth phase
- [ ] `CollectorCirclePage` tier join → Stripe or Memberful billing
- [ ] Account/Profile page (requires auth to be real first)
- [ ] M-Pesa/EcoCash webhook when Vodacom/Econet API available
- [ ] Artist CV downloadable PDF (press kit automation)
- [ ] Bilingual copy expansion (more strings in `LanguageContext`)

---

## Decommissioned docs (legacy — do not use as source of truth)

```
ADMIN_DASHBOARD_DOCS.md      → superseded by CLAUDE.md
ARTIST_MOMENTS_FEATURE.md    → superseded by CONTENT_GUIDE.md
ARTIST_MOMENTS_SUMMARY.md    → superseded by CONTENT_GUIDE.md
AUTHENTICATION_DOCS.md       → superseded by BACKEND_INTEGRATION.md
AUTHENTICATION_SYSTEM.md     → superseded by BACKEND_INTEGRATION.md
CHANGES_SUMMARY.md           → superseded by this file
COMPLETE_PLATFORM_SUMMARY.md → superseded by CLAUDE.md
ECOMMERCE_FEATURES.md        → superseded by CLAUDE.md + BACKEND_INTEGRATION.md
EVENTS_SYSTEM_DOCS.md        → superseded by CONTENT_GUIDE.md
```
