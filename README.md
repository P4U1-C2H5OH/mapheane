# Mapheane — Digital Studio Platform

Contemporary fine art platform for **Mapheane**, based in Maseru, Kingdom of Lesotho. This is a complete studio operating system: public commerce, collector relationships, and studio management in one codebase.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # /dist — deploy to Vercel or Netlify
npm run preview    # preview production build locally
```

## Stack

React 18.3 · TypeScript 5.5 · Tailwind CSS 3.4 · Framer Motion 11 · Lucide React · Vite 5.2

No routing library. Navigation is a `PageName` union in `App.tsx`.

---

## Documentation index

| File | Read when |
|------|-----------|
| **[CLAUDE.md](./CLAUDE.md)** | Working on the codebase — complete instructions, file map, data interfaces, design rules |
| **[VISION.md](./VISION.md)** | Understanding what we're building and why — the artist, the goal, the market opportunity |
| **[RESEARCH.md](./RESEARCH.md)** | The market data and strategic thinking behind every major decision |
| **[BUILD_STATUS.md](./BUILD_STATUS.md)** | Exactly what is done and what remains — start here to know next steps |
| **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** | All tokens, typography, animation rules, component patterns |
| **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** | Every simulated feature and its real implementation (Supabase, Resend, Cloudinary) |
| **[CONTENT_GUIDE.md](./CONTENT_GUIDE.md)** | How to update artworks, events, moments, pricing, and copy without touching components |

---

## What's been built

**22 public pages** across the full studio business: gallery, artworks, about, commissions, workshops, print shop, artist journal, events, collector circle membership, press/CV, contact, checkout (M-Pesa/EcoCash + proof upload), order tracking, wishlist, auth, privacy, terms.

**13 admin modules**: Command centre, revenue analytics, collector CRM, commission pipeline, gallery manager (full CRUD), moments manager, events manager (full CRUD with highlights/tickets/hours/contact), workshops manager, orders manager, messages inbox, marketing hub, gallery readiness score, studio settings.

**Full design system**: Warm luxury palette derived from Lesotho highland earth. Playfair Display + DM Sans. Paper grain atmosphere. Currency switcher (ZAR/EUR/USD/GBP with localStorage persistence). EN/Sesotho language toggle. Live search overlay. GDPR cookie consent.

---

## What still needs real backend

Authentication, email (contact/commission/booking/newsletter), order persistence, proof-of-payment upload, admin data persistence, real artwork images. All detailed in **BACKEND_INTEGRATION.md** with implementation code ready to paste.

---

*Maseru, Kingdom of Lesotho · hello@mapheane.art*
