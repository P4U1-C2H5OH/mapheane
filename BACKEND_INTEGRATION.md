# Backend Integration Guide

Every feature that currently runs on simulations, and exactly what it needs to become production-ready. Implementation code is included — paste and adapt.

---

## Recommended stack

| Service | Purpose | Why |
|---------|---------|-----|
| **Supabase** | Database + Auth + Storage | Single platform, generous free tier, real-time subscriptions, works from Africa without VPN |
| **Resend** | Transactional email | Modern API, excellent DX, 3,000 emails/month free, Lesotho `.ls` domain works |
| **Cloudinary** | Image hosting + transforms | Free tier is sufficient, auto-WebP, focal-point cropping via URL |
| **Vercel** | Deployment + API routes | Instant deploys, free tier, Edge Functions for serverless endpoints |

Alternative: Firebase (Auth + Firestore + Storage) if you prefer Google's ecosystem.

---

## Environment variables

Create `.env.local` in the project root (never commit to git — it's in `.gitignore`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RESEND_API_KEY=re_your_key
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=unsigned-preset-name
```

All `VITE_` prefixed vars are exposed in the browser bundle. Server-side secrets (Resend key) go in Vercel Environment Variables, not in the `.env.local` file that ships to the browser.

---

## 1. Authentication

**File:** `src/context/AuthContext.tsx`  
**Current:** mock `setTimeout` — localStorage key is `mapheane-user`

```bash
npm install @supabase/supabase-js
```

```tsx
// src/lib/supabase.ts — create this file
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// In AuthContext.tsx, replace login():
const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  // data.user now has id, email, user_metadata
};

// Replace signup():
const signup = async (name: string, email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name } }
  });
  if (error) throw new Error(error.message);
};

// Replace logout():
const logout = async () => {
  await supabase.auth.signOut();
  setUser(null);
};
```

### Social login (buttons already in AuthPage.tsx)
```tsx
// Google:
await supabase.auth.signInWithOAuth({ provider: 'google' });
// Facebook:
await supabase.auth.signInWithOAuth({ provider: 'facebook' });
```

### Admin role check
Add a `profiles` table in Supabase with a `role` column. Set RLS so users can only read their own profile.
```sql
create table profiles (
  id   uuid references auth.users primary key,
  name text,
  role text default 'user'  -- 'admin' | 'user'
);
```

---

## 2. Contact form, Commission inquiry, Workshop booking

**Files:** `ContactPage.tsx`, `ContactSection.tsx`, `CommissionModal.tsx`, `WorkshopsPage.tsx`  
**Current:** `await new Promise(r => setTimeout(r, 1000))`

### Vercel API route

```ts
// api/contact.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, email, type, message } = req.body;

  await resend.emails.send({
    from:    'Studio <noreply@mapheane.art>',
    to:      'hello@mapheane.art',
    replyTo: email,
    subject: `[${type}] Inquiry from ${name}`,
    html:    `<p><strong>${name}</strong> · ${email}</p><p>${message}</p>`,
  });

  // Also save to Supabase messages table:
  await supabase.from('messages').insert({ name, email, type, message });

  res.status(200).json({ ok: true });
}
```

```tsx
// In the form component, replace the setTimeout:
const res = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(form),
});
if (!res.ok) throw new Error('Send failed');
```

---

## 3. Newsletter signup

**Files:** `Footer.tsx`, `NewsletterModal.tsx`  
**Current:** simulated

```ts
// api/newsletter.ts
export default async function handler(req: any, res: any) {
  const { email, name } = req.body;
  await fetch(`https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, first_name: name, unsubscribed: false }),
  });
  res.status(200).json({ ok: true });
}
```

---

## 4. Checkout — order submission

**File:** `src/pages/CheckoutPage.tsx`  
**Function to replace:** `handlePaymentSubmit`

### Step 1: Upload proof of payment to Cloudinary

```tsx
const uploadProof = async (dataUrl: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', dataUrl);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'payment-proofs');
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
    { method: 'POST', body: formData }
  );
  const data = await res.json();
  return data.secure_url;
};
```

### Step 2: Supabase orders table

```sql
create table orders (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  reference      text unique not null,
  status         text default 'pending',  -- pending|verified|dispatched|delivered
  customer       jsonb not null,   -- {name, email, phone}
  fulfilment     jsonb not null,   -- {method, zone?, pickupPoint?}
  cart_items     jsonb not null,   -- [{artwork, quantity}]
  subtotal_eur   numeric,
  shipping_zar   numeric,
  total_eur      numeric,
  payment_method text,
  proof_url      text
);
```

### Step 3: Wire it up

```tsx
const handlePaymentSubmit = async (ev: React.FormEvent) => {
  ev.preventDefault();
  setSubmitting(true);
  try {
    const proofUrl = proofFile ? await uploadProof(proofFile.dataUrl) : null;
    const { error } = await supabase.from('orders').insert({
      reference:      orderRef,
      customer:       { name: contactForm.name, email: contactForm.email, phone: contactForm.phone },
      fulfilment:     { method: fulfilment, zone: deliveryZone, pickupPoint },
      cart_items:     cartItems,
      subtotal_eur:   subtotalEUR,
      shipping_zar:   shippingCost,
      total_eur:      totalEUR,
      payment_method: paymentMethod,
      proof_url:      proofUrl,
    });
    if (error) throw error;
    await fetch('/api/order-confirm', {
      method: 'POST',
      body: JSON.stringify({ email: contactForm.email, name: contactForm.name, orderRef, totalEUR }),
    });
    setStep('confirmation');
    clearCart();
  } catch {
    error('Submission failed — please try again or email hello@mapheane.art');
  } finally {
    setSubmitting(false);
  }
};
```

---

## 5. Image hosting

**Current state:** All artwork images use `/artportfolio.jpg` placeholder.

### Setup Cloudinary

1. Create a free Cloudinary account at cloudinary.com
2. Settings → Upload → Add upload preset → Set to "Unsigned"
3. Add `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` to `.env.local`

### Update artworks.ts

```ts
images: [
  'https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto,w_1600/mapheane/work-title-full.jpg',
  'https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto,w_1600/mapheane/work-title-detail.jpg',
],
```

Recommended URL transforms:
- Hero image: `f_auto,q_auto,w_1600`
- Gallery card: `f_auto,q_auto,w_800`
- Thumbnail / admin: `f_auto,q_auto,w_400`

---

## 6. Admin dashboard persistence

**Files:** `src/components/admin/*.tsx`  
All managers currently work in-memory (local React state, seeded from static data files).

### Supabase tables needed

```sql
-- Mirrors Artwork interface in artworks.ts
create table artworks (
  id            serial primary key,
  title         text not null,
  dimensions    text,
  technique     text,
  medium        text,   -- 'Painting'|'Drawing'|'Clay Model'
  status        text default 'Available',
  crop_position text default '50% 50%',
  offset_class  text default 'mt-0',
  price_eur     numeric not null,
  description   text,
  images        text[],  -- array of Cloudinary URLs
  year          int,
  created_at    timestamptz default now()
);

-- Mirrors Event interface
create table events (/* see events.ts for full interface */);

-- Mirrors ArtistMoment interface
create table moments (/* see moments.ts — media is jsonb: MomentMedia[] */);

-- Messages from contact/commission forms
create table messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text, email text, type text, message text,
  read       boolean default false,
  crm_linked uuid  -- references collectors(id) if linked
);

-- Collector CRM
create table collectors (
  id         uuid primary key default gen_random_uuid(),
  name       text, email text, phone text,
  country    text, city text,
  tier       text default 'Standard',
  notes      text,
  created_at timestamptz default now()
);
```

### Replacing static imports in managers

```tsx
// Before (static):
import { artworks as initialArtworks } from '../../data/artworks';
const [artworks, setArtworks] = useState(initialArtworks);

// After (Supabase):
const [artworks, setArtworks] = useState<Artwork[]>([]);
useEffect(() => {
  supabase.from('artworks').select('*').order('id').then(({ data }) => {
    if (data) setArtworks(data);
  });
}, []);

// Save:
const handleSave = async (data: Partial<Artwork>) => {
  if (data.id) {
    await supabase.from('artworks').update(data).eq('id', data.id);
  } else {
    await supabase.from('artworks').insert(data);
  }
  // Re-fetch or optimistic update
};
```

---

## 7. Admin Settings persistence

**File:** `src/components/admin/AdminSettings.tsx`  
**Current:** saves to React state only, resets on page refresh

```sql
create table studio_settings (
  key   text primary key,
  value text
);
-- Seed with defaults:
insert into studio_settings values
  ('mpesa_number', '+266 5912 3456'),
  ('ecocash_number', '+266 5878 9012'),
  ('shipping_maseru', '150'),
  -- etc.
```

```tsx
// Load on mount:
const { data } = await supabase.from('studio_settings').select('*');
const settings = Object.fromEntries(data.map(r => [r.key, r.value]));

// Save section:
await supabase.from('studio_settings').upsert(
  Object.entries(values).map(([key, value]) => ({ key, value }))
);
```

Then each page that reads payment numbers or shipping rates fetches from Supabase instead of hardcoded constants.

---

## 8. Collector Circle membership billing

**File:** `src/pages/CollectorCirclePage.tsx`  
**Current:** interest capture only (email + name form)

Options:
- **Stripe Billing** — most flexible, requires Stripe Atlas if no SA/EU entity (~$500 setup)
- **Memberful** — designed for creators, handles billing, member portal, integrates with Mailchimp

```tsx
// Stripe checkout session (replace the join modal submit):
const res = await fetch('/api/create-checkout', {
  method: 'POST',
  body: JSON.stringify({ tier: tier.id, billing }),
});
const { url } = await res.json();
window.location.href = url;  // redirect to Stripe hosted checkout
```

---

## 9. Order tracking

**File:** `src/pages/OrderTrackingPage.tsx`  
**Current:** seeded with two mock orders

```tsx
// Replace mock lookup with Supabase query:
const handleTrack = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('reference', ref.toUpperCase())
    .single();
  setLoading(false);
  if (error || !data) { setNotFound(true); return; }
  setResult(mapOrderToTrackResult(data));
};
```

---

## 10. M-Pesa / EcoCash (future)

Vodacom Lesotho (M-Pesa) and EcoCash (Econet) do not currently have publicly available REST webhook APIs for Lesotho developers. Until they do, order verification remains manual via the admin OrdersManager.

When APIs become available:
1. Subscribe to payment webhook for the studio M-Pesa/EcoCash number
2. On webhook: match `amount` + `reference` to a pending order
3. Auto-set `status: 'verified'`, send confirmation email to buyer
4. No manual review needed

Watch: Vodacom Business API Portal, Econet Developer Portal.

---

## Security checklist before going live

- [ ] Supabase Row Level Security enabled on all tables
- [ ] Admin routes check `role === 'admin'` in RLS policy
- [ ] `.env.local` is in `.gitignore` (it is by default in this project)
- [ ] Cloudinary upload preset restricts to image types: jpg, png, pdf only
- [ ] Vercel API routes validate request method and required fields
- [ ] Rate limiting on contact/commission endpoints (Upstash Redis + Vercel middleware)
- [ ] HTTPS enforced (automatic on Vercel/Netlify)
- [ ] Supabase Storage bucket for proof uploads: private bucket, signed URLs for admin access only
