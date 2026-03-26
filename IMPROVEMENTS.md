# Improvements & Technical Debt Register

This document tracks improvements noticed during implementation. Revisit when planning future increments.

---

## Security

### S1 — Payment details hardcoded in client bundle
**Current:** M-Pesa number, EcoCash number, SWIFT/account number are hardcoded in `CheckoutPage.tsx` — visible to anyone who inspects the JS bundle.
**Risk:** Low for current placeholder values. Medium once real banking details are in place.
**Fix:** Load payment details from `studio_settings` table in Supabase (the table already exists). CheckoutPage fetches on mount, falls back to constants if DB is unavailable.
**Files:** `src/pages/CheckoutPage.tsx`, `PAYMENT_METHODS` constant → dynamic

---

### S2 — Order reference generated client-side
**Current:** `MAP-` + 6 random alphanumeric chars generated in `useState` initialiser.
**Risk:** Low — collision space is ~2.1 billion. However, the ref is shown before proof upload, which is necessary for M-Pesa payment note.
**Fix:** Consider a two-step approach: (1) client generates provisional ref for display, (2) server replaces it with a cryptographically secure ref on submission and returns it in the response.
**Blocker:** M-Pesa flow requires ref before submission. Needs design consideration.

---

### S3 — Wire orders need visual distinction in OrdersManager
**Current:** Wire orders appear as `pending` with payment method showing `WIRE`. Admin must remember not to verify immediately — funds take 2–5 business days to clear.
**Fix:** Add `pending_wire` as a distinct status in the pipeline, OR add a visible badge/warning on the order detail panel when `payment === 'wire'`.
**Files:** `src/components/admin/OrdersManager.tsx`

---

### S4 — Supabase service key used in track API
**Current:** `api/track.js` uses `SUPABASE_SERVICE_KEY` (bypasses RLS) to look up orders.
**Risk:** If the endpoint is abused, it can enumerate orders. Rate limiting is in place (20/hr per IP) but REF format is predictable (`MAP-XXXXXX`).
**Fix:** Either tighten the rate limit further, or require email verification alongside the ref (customer must supply the email they used to order).

---

### S5 — No CSRF protection on API routes
**Current:** API routes rely on CORS `ALLOWED_ORIGIN` for protection. This covers browser-based attacks but not server-to-server forged requests.
**Risk:** Low for current endpoints (contact/order forms don't modify authenticated state). Higher risk when admin actions are exposed as API routes.
**Fix:** Add a signed token (e.g. HMAC of timestamp + secret) required on all mutation endpoints. Evaluate when admin API routes are built.

---

## Performance

### P1 — Bundle size ~1.1MB (gzipped ~277KB)
**Current:** Vite build warning — single chunk exceeds 500KB. All 23 pages + all components in one bundle.
**Impact:** Slower first load, especially on mobile in Lesotho/SA.
**Fix:** Code-split by page using `React.lazy` + `Suspense`. Start with heaviest pages: AdminDashboard, CheckoutPage, GalleryPage.

---

### P2 — All artwork images served from public folder
**Current:** Images are static files in `/public`. No compression, no responsive sizes, no CDN.
**Fix:** Move to Cloudinary (already configured). Use Cloudinary's auto-format and auto-quality transforms. Implement `srcset` for responsive delivery.

---

## UX / Feature gaps

### U1 — Wire order confirmation email should include bank details
**Current:** Wire confirmation email (sent via `api/notify.js` on `verified`) doesn't repeat the bank details.
**Fix:** When `paymentMethod === 'wire'`, the order confirmation email should include the full bank details so the customer has a paper trail.
**Files:** `api/orders.js` (order received email), `api/notify.js`

---

### U2 — AdminSettings payment details not reflected in CheckoutPage
**Current:** If admin updates M-Pesa number in Settings, the checkout still shows the old hardcoded number.
**Dependency:** Blocked by S1 — same fix resolves both.

---

### U3 — Pending wire indicator in admin
**Current:** Wire and M-Pesa pending orders look identical in OrdersManager.
**Fix:** Add `payment === 'wire'` badge to order cards and detail panel. Show "Awaiting wire transfer — allow 2–5 business days" on the detail panel.

---

### U4 — Commission slots on CommissionPage not live
**Current:** `CommissionPage.tsx` shows hardcoded slot availability (e.g. "2 of 4 slots open").
**Fix:** Load `commission` key from `studio_settings` table (the save is already wired via Increment B). CommissionPage and CommissionModal should read live values.

---

## Data / Backend

### D1 — Moments count on ServicesSection is live, moments data is not
**Current:** `useMoments()` fetches from DB. When DB is empty, static placeholder images are shown. Good.
**Next:** Once admin uploads moments via MomentsManager, they will appear automatically. No code change needed.

---

### D2 — Artworks in GalleryPage still use static data
**Current:** `useArtworks()` hook falls back to `artworks.ts` when DB is empty. Good for now.
**Next:** When admin uploads artworks via GalleryManager, live data takes over. Verify the hook's fallback logic handles partial DB population correctly.

---
### D3 — MarketingHub Wishlist and Newsletter segment counts not in DB
**Current:** `Wishlist Savers` and `Newsletter Only` segments show 0 — wishlist is localStorage only, newsletter subscribers are in Resend Audiences (not Supabase).
**Fix options:**
- Wishlist: add a `wishlist_items` table seeded when users save works (requires auth-aware wishlist).
- Newsletter: query Resend Audiences API (`/v1/audiences/{id}/contacts`) from a server function.
**Priority:** Low — these segments are useful for email dispatch, not for counting.

---

### D5 — Certificate only covers first item in multi-item orders
**Current:** `api/certificate.js` uses `cart_items[0]` only. An order with two originals produces a certificate for the first artwork only.
**Impact:** Low for now — original artworks are one-of-a-kind and most carts contain a single original. Prints (editions) are more likely to be multi-item.
**Fix:** When `cart_items.length > 1`, either (a) generate a separate certificate per item and return an array, or (b) add an `itemIndex` query param (`?ref=MAP-XXXXXX&item=1`) so each artwork gets its own URL. Option (b) is simpler and keeps the certificate page unchanged.
**Also:** `api/certificate.js` and `api/track.js` share the `trackLimit` rate limit bucket (20/hr per IP). Give certificate its own named limit when the shared bucket becomes a problem.
**Files:** `api/certificate.js`, `api/_lib/ratelimit.js`

---

### D4 — track.js maps cart_items incorrectly
**Current:** `api/track.js` line 73 maps items as `{ title: i.title }` but cart items have shape `{ artwork: {...}, edition, quantity }`. So `i.title` is undefined.
**Fix:** Change to `{ title: i.artwork?.title ?? '—', medium: i.artwork?.technique ?? '' }`.
**Files:** `api/track.js`

---

### U5 — Certificate only accessible via OrderTrackingPage
**Current:** Users must look up their order first, then click "View Certificate". No direct link in confirmation email.
**Fix:** Include a certificate link in the order confirmed/delivered notification email (Increment A). Link format: `/certificate?ref=MAP-XXXXXX` — the SPA rewrite handles it.

---

### U6 — Facebook OAuth incomplete
**Current:** Facebook sign-in button exists but Facebook app setup was not completed (stopped at use case selection).
**Fix:** Complete Facebook Developer Console setup — add Facebook Login product, set redirect URI to Supabase callback, enable Supabase Facebook provider with App ID + Secret. Requires Facebook App Review before non-test users can sign in.

---

*Last updated: 2026-03-26*
