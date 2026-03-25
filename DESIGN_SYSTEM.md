# Design System — Mapheane Digital Studio Platform

Reference for all design decisions. These rules are non-negotiable — the aesthetic is deliberate and must stay internally consistent.

---

## Aesthetic philosophy

Three layers working together, applied with restraint:

1. **Editorial / magazine luxury** — dramatic type scale, extreme negative space, Hauser & Wirth-level restraint. The studio equivalent of a beautiful catalogue.
2. **Gallery-white tension** — artwork is always the hero. The UI never competes with the image.
3. **Raw / atelier tactile** — 2.5% grain overlay, warm ambient gradients at the page level, photography showing process and materials.

None of these layers dominates. They whisper together.

---

## Colour palette

All tokens are in `tailwind.config.js`. Use tokens always — never raw hex in JSX (except `objectPosition` on artwork images).

```
background      #FAF7F2   Warm off-white. Primary page background.
cream           #F5F0EB   Slightly warmer. Section alternation.
parchment       #EDE8E0   Cards, filter panels, form backgrounds, admin content areas.
terracotta      #A0522D   PRIMARY ACCENT. CTAs, hover states, section overlines.
terracottaLight #C4784F   Hover / focus states.
terracottaDark  #7A3E20   Active / pressed states.
charcoal        #2D2A26   Primary text. Headings.
charcoalLight   #4A4640   Secondary dark elements.
ink             #1A1815   Deepest tone. Modal backdrops. Admin sidebar.
muted           #9E9890   Body copy. Captions. Disabled labels.
mutedLight      #BAB5AC   Placeholder text. Subtle borders.
sage            #7C8B6F   SUCCESS. Pickup (free). Confirmed states. Available badges.
sageDark        #5C6852   Sage hover.
gold            #B8A088   DECORATIVE ONLY. Overlay menu hover. Never on white bg.
clay            #C4956A   Warm accent. Use sparingly.
stone           #D4CBC1   Very subtle borders and dividers.
```

**Hard rules:**
- `warmWhite` does not exist in this system. Do not use it. Use `bg-cream` or `bg-parchment/40`.
- If a design need can't be met with these tokens, the design needs rethinking, not a new colour.
- The admin sidebar uses `bg-ink` (#1A1815) — this is the one place you hardcode the hex, because Tailwind's JIT won't generate it from the config in the admin component.

---

## Typography

Fonts load from Google Fonts in `index.html` (preconnect + stylesheet link).

```
font-serif  →  Playfair Display   Headings, display text, pull quotes, italic labels
font-sans   →  DM Sans            Navigation, body, labels, buttons, data, metadata
```

### Type scale

| Class | Size | Leading | Tracking | Use |
|-------|------|---------|----------|-----|
| `display-2xl` | clamp(4rem → 9rem) | 0.92 | −0.025em | Hero headlines |
| `display-xl`  | clamp(3rem → 7rem) | 0.95 | −0.02em  | Page titles |
| `display-lg`  | clamp(2.25rem → 4.5rem) | 1.0 | −0.015em | Section headings |
| `display-md`  | clamp(1.75rem → 3rem) | 1.05 | −0.01em  | Sub-headings |
| `display-sm`  | clamp(1.25rem → 2rem) | 1.1 | −0.005em | Card titles |
| `body-lg`     | 1.125rem | 1.7 | 0.005em | Lead paragraphs |
| (default body)| 1rem | 1.7 | 0.01em | Body copy |
| `caption`     | 0.8125rem | 1.5 | 0.1em | Image captions |
| `text-label`  | 0.6875rem | 1.4 | 0.2em | Tags, badges, nav labels |

### Typography rules
- Playfair: regular (400) or italic (400i). Never bold on display text.
- DM Sans: 400 regular or 500 medium. **Never 600 or 700** — too heavy against the UI.
- Section overlines: `text-label uppercase tracking-[0.3em] text-terracotta block mb-4`
- Inline labels: `text-label uppercase tracking-widest text-muted`

---

## Spacing

```
py-section    clamp(6rem → 12rem)   Between major page sections
py-block      clamp(3rem → 6rem)    Between content blocks within sections
container     mx-auto px-5 sm:px-8 md:px-12
max-w-7xl                           Full-width layouts
max-w-6xl                           Commerce pages (gallery, shop)
max-w-5xl                           Content-heavy pages (about, press)
max-w-3xl                           Reading pages (privacy, terms, FAQ)
max-w-reading  65ch                 Prose columns
```

Never reduce section padding below `py-20`. Breathing room is the luxury signal.

---

## Animation

### Easing curves
```
ease-luxury      cubic-bezier(0.25, 0.46, 0.45, 0.94)   Standard smooth — default
ease-dramatic    cubic-bezier(0.77, 0, 0.175, 1)         Reveal effects, overlay open
ease-spring      cubic-bezier(0.34, 1.56, 0.64, 1)       Toasts + confirmation icons ONLY
ease-out-expo    cubic-bezier(0.19, 1, 0.22, 1)          Large element reveals
```

### Durations
- Hover states: `duration-300` minimum, prefer `duration-400`
- Page transitions: `duration-500`
- Scroll reveals: `duration-1000`
- Image hover zoom: `duration-700`
- Modal entrance: `duration-450`

### Rules
- No bouncy springs on UI elements — `ease-spring` is only for toast + confirmation icons
- Image hover scale: `group-hover:scale-[1.03]` max, never `scale-[1.05]` or above
- Page transitions: fade + subtle `translateY(10px → 0)`, never slide-in from side

### Page entry pattern (Framer Motion)
```tsx
const pv = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1,  y: 0  },
  exit:    { opacity: 0,  y: -6 },
};
const pt = { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const };

<motion.div key="page-name" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
```

### Scroll reveal pattern
```tsx
const { ref, isVisible } = useScrollReveal(0.1);
<div ref={ref} className={`transition-all duration-1000 ease-luxury ${
  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
}`}>
```

---

## Component patterns

### Section overline + heading
```tsx
<span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">
  Overline
</span>
<h2 className="font-serif text-display-lg text-charcoal" style={{ letterSpacing: '-0.015em' }}>
  Section Heading
</h2>
```

### Editorial divider
```tsx
<div className="w-12 h-px bg-terracotta/30 mb-8" />
```

### Primary CTA button (sharp corners — never rounded)
```tsx
<button className="inline-flex items-center gap-3 bg-terracotta text-white px-8 py-4 text-xs font-sans uppercase tracking-[0.25em] hover:bg-terracottaDark transition-colors duration-400 shadow-button hover:shadow-button-hover">
  Label <ArrowRight className="w-4 h-4" />
</button>
```

### Ghost / text CTA
```tsx
<button className="text-xs font-sans uppercase tracking-[0.2em] text-charcoal border-b border-charcoal/20 pb-px hover:border-terracotta hover:text-terracotta transition-all duration-300">
  Label
</button>
```

### Editorial input (forms)
```tsx
<div className="group">
  <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">
    Label
  </label>
  <input className="w-full bg-transparent border-b border-charcoal/18 py-2 text-charcoal font-serif text-xl focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/25 placeholder:italic" />
</div>
```

### Artwork image — always use LazyImage
```tsx
import { LazyImage } from '../components/LazyImage';

// Inside an overflow-hidden container:
<LazyImage
  src={artwork.images[0]}
  alt={artwork.title}
  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-luxury"
  objectPosition={artwork.cropPosition}
  draggable={false}
/>
```

**Never use a raw `<img>` for artwork images.** `LazyImage` provides the shimmer skeleton, IntersectionObserver lazy loading, and opacity fade-in.

### Page with back button
```tsx
<button onClick={() => onNavigate('home')}
  className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-10">
  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Home
</button>
```

### Dark section (footer, CTA strips)
```tsx
<section className="bg-charcoal relative overflow-hidden">
  {/* Grain overlay */}
  <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
  <div className="relative z-10">
    {/* Content — text-background/80 primary, text-background/50 secondary */}
  </div>
</section>
```

---

## Currency display

Always use `useCurrency` — never hardcode `* 18` or `R ${...}`.

```tsx
const { format, fromZAR, currency } = useCurrency();

// Artwork prices (stored in EUR):
format(artwork.price)           // "R18,000" | "€1,000" | "$1,090" | "£860"

// ZAR-native prices (shipping, workshop fees):
fromZAR(150)                    // "R150" | "€8" | "$9" | "£7"

// Show currency code alongside (for confirmations):
format(total, { showCode: true }) // "R18,000 ZAR"
```

**Exception:** M-Pesa and EcoCash payment amounts are always displayed in ZAR with a "ZAR" label, because those rails only settle in ZAR.

---

## Shadows

```
shadow-artwork       0 4px 24px rgba(45,42,38,0.08), 0 1px 4px rgba(45,42,38,0.04)
shadow-artwork-hover 0 16px 48px rgba(45,42,38,0.14), 0 4px 12px rgba(45,42,38,0.08)
shadow-card          0 2px 12px rgba(45,42,38,0.06)
shadow-card-hover    0 8px 32px rgba(45,42,38,0.12)
shadow-modal         0 32px 80px rgba(45,42,38,0.22)
shadow-toast         0 8px 32px rgba(45,42,38,0.18)
shadow-button        0 2px 8px rgba(160,82,45,0.25)
shadow-button-hover  0 4px 16px rgba(160,82,45,0.35)
```

---

## What to never do

| ❌ Never | ✅ Instead |
|---------|----------|
| `bg-warmWhite` | `bg-cream` or `bg-parchment/40` |
| Rounded corners on buttons | Sharp buttons are the design language |
| Gradient backgrounds on sections | Grain + ambient gradient in CSS handles atmosphere |
| DM Sans weight 600 or 700 | Max 500 |
| `scale-[1.05]` or above on image hover | `scale-[1.03]` max |
| Raw `<img>` for artworks | `<LazyImage>` always |
| Hardcoded `* 18` or `R ${price}` | `format(price)` from `useCurrency` |
| `warmWhite` class | Doesn't exist in the config |
| Emojis in the UI | None |
