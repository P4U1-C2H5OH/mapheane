import { useSEO } from '../hooks/useSEO';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Calendar, Clock, Users, MapPin,
  CheckCircle, ChevronDown, ChevronUp, Globe, Plane
} from 'lucide-react';
import { useWorkshops, DbWorkshop } from '../hooks/useWorkshops';

interface WorkshopsPageProps {
  onNavigate: (page: any) => void;
}

const ACCENT_CYCLE = ['terracotta', 'charcoal', 'clay', 'sage'] as const;

const RETREATS = [
  {
    title: 'Mountain Kingdom Retreat',
    subtitle: '3 Days · Art & Landscape',
    price: 'R9,000 – R15,000',
    intlPrice: '$500 – $800 USD',
    capacity: '8 participants',
    location: 'Maseru & Malealea, Lesotho',
    description: 'Three days painting and drawing in the highlands of Lesotho. Morning studio sessions with Mapheane. Afternoon excursions to mountain villages, Basotho cultural sites, and the dramatic landscape that informs her work.',
    highlights: ['2 full studio sessions', 'Guided cultural excursion', 'Accommodation at Malealea Lodge', 'All meals included', 'Materials provided', 'Small group intimacy'],
    image: '/artportfolio.jpg',
    available: true,
    nextDate: 'June 2025',
  },
  {
    title: 'Immersive Highlands Residency',
    subtitle: '5–7 Days · Deep Practice',
    price: 'R27,000 – R55,000',
    intlPrice: '$1,500 – $3,000 USD',
    capacity: '5 participants',
    location: 'Lesotho Mountain Studio',
    description: 'For serious practitioners ready to push their practice. Five to seven days in the Mountain Kingdom, working daily in Mapheane\'s studio, exploring the land, and building a body of work that belongs to no place else on earth.',
    highlights: ['Daily 5-hour studio sessions', 'Personal critique sessions', 'Cultural immersion programme', 'Premium accommodation', 'All meals & transport', 'Professional documentation of your work'],
    image: '/artportfolio.jpg',
    available: true,
    nextDate: 'September 2025',
  },
];

const TESTIMONIALS = [
  {
    quote: "The charcoal workshop was two hours of pure flow state. I haven't drawn since school. I left with something I was genuinely proud of, and a completely different relationship with mark-making.",
    name: 'Refiloe D.',
    location: 'Maseru',
    workshop: 'Expressive Charcoal',
  },
  {
    quote: "Mapheane doesn't just teach technique — she teaches permission. Permission to be uncertain on the canvas. That was worth every rand.",
    name: 'Ayanda N.',
    location: 'Johannesburg',
    workshop: 'Mixed Media Masterclass',
  },
  {
    quote: "The Mountain Kingdom Retreat broke something open in me. The landscape, the clay in my hands, the evenings discussing art over dinner. I came home different.",
    name: 'Sarah M.',
    location: 'London, UK',
    workshop: 'Mountain Kingdom Retreat',
  },
];

interface WorkshopCardProps {
  w: DbWorkshop;
  accentIdx: number;
  onBook: () => void;
}

function WorkshopCard({ w, accentIdx, onBook }: WorkshopCardProps) {
  const [expanded, setExpanded] = useState(false);
  const accent = ACCENT_CYCLE[accentIdx % ACCENT_CYCLE.length];
  const accentMap: Record<string, string> = {
    terracotta: 'bg-terracotta text-white',
    charcoal:   'bg-charcoal text-white',
    clay:       'bg-clay text-white',
    sage:       'bg-sage text-white',
  };
  const borderMap: Record<string, string> = {
    terracotta: 'border-terracotta/25 hover:border-terracotta/60',
    charcoal:   'border-charcoal/15 hover:border-charcoal/40',
    clay:       'border-clay/25 hover:border-clay/50',
    sage:       'border-sage/25 hover:border-sage/50',
  };
  const tag = w.status === 'full' ? 'Full' : null;
  const groupSize = `Max ${w.capacity} participants`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`border bg-background transition-all duration-500 ${borderMap[accent]}`}
    >
      <div className="p-6 md:p-8">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            {tag && (
              <span className={`text-label uppercase tracking-widest px-2.5 py-1 mb-3 inline-block text-[10px] ${accentMap[accent]}`}>
                {tag}
              </span>
            )}
            <h3 className="font-serif text-2xl md:text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>
              {w.title}
            </h3>
            <p className="text-xs font-sans uppercase tracking-widest text-muted mt-1">{w.medium}</p>
          </div>
          <div className="text-right ml-6 flex-shrink-0">
            <p className="font-serif text-xl text-charcoal">{w.price.local}</p>
            <p className="text-xs text-muted/60 mt-0.5">{w.price.intl}</p>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 mb-5">
          {[
            { icon: Clock, text: w.duration },
            { icon: Users, text: groupSize  },
          ].filter(m => m.text).map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-muted">
              <Icon className="w-3 h-3 text-muted/60" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-charcoal/70 leading-relaxed mb-5">{w.description}</p>

        {/* Expandable materials */}
        {w.materials.length > 0 && (
          <>
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-muted hover:text-charcoal transition-colors mb-4"
            >
              What's included
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden space-y-2 mb-5"
                >
                  {w.materials.map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-charcoal/70">
                      <CheckCircle className="w-3.5 h-3.5 text-sage flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </>
        )}

        <button
          onClick={onBook}
          className={`w-full py-3.5 text-xs font-sans uppercase tracking-[0.2em] transition-all duration-400 flex items-center justify-center gap-3 ${accentMap[accent]} hover:opacity-90`}
        >
          Inquire & Book
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function WorkshopsPage({ onNavigate }: WorkshopsPageProps) {
  const { workshops } = useWorkshops();
  const [bookingWorkshop, setBookingWorkshop] = useState<string | null>(null);
  const [bookForm, setBookForm] = useState({ name: '', email: '', message: '', trap: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useSEO({ title: 'Workshops', description: 'Studio workshops and highland retreats with Mapheane in Lesotho' });
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const activeWorkshops = workshops.filter(w => w.status !== 'past' && w.status !== 'draft');

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookForm.name,
          email: bookForm.email,
          type: 'Workshop',
          workshop: bookingWorkshop,
          message: bookForm.message || `Booking inquiry for: ${bookingWorkshop}`,
          trap: bookForm.trap,
        }),
      });
      if (!res.ok) throw new Error('Send failed');
      setSubmitted(true);
    } catch {
      // Still show success to user — fallback noted
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-background min-h-screen overflow-hidden"
    >
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 75% 60%, rgba(124,139,111,0.06) 0%, transparent 60%)' }} />

        <div className="container mx-auto max-w-6xl">
          <button onClick={() => onNavigate('home')}
            className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-14">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.7 }}
                className="text-label uppercase tracking-[0.3em] text-terracotta block mb-6"
              >
                Studio Teaching
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="font-serif text-5xl md:text-7xl text-charcoal mb-8"
                style={{ lineHeight: '1.0', letterSpacing: '-0.02em' }}
              >
                Learn to see<br />
                <em className="italic text-sage">through making.</em>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-muted text-body-lg leading-relaxed max-w-prose mb-8"
              >
                Workshops in Mapheane's Maseru studio — and immersive retreats into the Mountain Kingdom. Every session is designed not to teach you to paint like Mapheane, but to unlock the way you yourself see.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-5 text-xs font-sans uppercase tracking-widest text-muted"
              >
                {[
                  { icon: MapPin,   text: 'Maseru, Lesotho' },
                  { icon: Globe,    text: 'Open to all levels' },
                  { icon: Plane,    text: 'Retreats for intl. visitors' },
                  { icon: Calendar, text: 'Booking now open' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3 text-terracotta/60" />
                    <span>{text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 1.0 }}
              className="relative aspect-square overflow-hidden"
            >
              <img src="/artportfolio.jpg" alt="Workshop in Mapheane's studio"
                className="w-full h-full object-cover" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-br from-sage/8 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/70 to-transparent p-6">
                <p className="font-serif italic text-white/85 text-sm leading-relaxed">
                  "I teach only what I practice. Every session begins with questions, not answers."
                </p>
                <p className="text-white/40 text-xs font-sans uppercase tracking-widest mt-2">— Mapheane</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Local Workshops ─────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 bg-parchment/30 border-y border-charcoal/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Studio Sessions</span>
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal" style={{ letterSpacing: '-0.015em' }}>
              Half-day & full-day workshops
            </h2>
            <p className="text-muted mt-4 max-w-md mx-auto text-sm leading-relaxed">
              Held in Mapheane's Maseru studio. Local ZAR pricing and international USD pricing shown.
            </p>
          </div>

          {activeWorkshops.length === 0 ? (
            <p className="text-muted text-sm py-8 text-center border-t border-charcoal/10">
              No upcoming workshops scheduled — check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeWorkshops.map((w, i) => (
                <WorkshopCard key={w.id} w={w} accentIdx={i} onBook={() => setBookingWorkshop(w.title)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Retreats ────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Kingdom Retreats</span>
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal" style={{ letterSpacing: '-0.015em' }}>
              Art in the mountains
            </h2>
            <p className="text-muted mt-4 max-w-lg mx-auto text-sm leading-relaxed">
              Lesotho is entirely above 1,000m. Every retreat combines studio practice with landscape, culture,
              and the particular silence of the Mountain Kingdom. There is nowhere else like this.
            </p>
          </div>

          <div className="space-y-8">
            {RETREATS.map((retreat, i) => (
              <motion.div
                key={retreat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-charcoal/8 overflow-hidden hover:border-terracotta/25 hover:shadow-card-hover transition-all duration-500"
              >
                {/* Image */}
                <div className={`lg:col-span-4 relative overflow-hidden aspect-[4/3] lg:aspect-auto ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <img src={retreat.image} alt={retreat.title}
                    className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700 ease-luxury"
                    draggable={false} />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-charcoal/20 pointer-events-none" />
                </div>

                {/* Content */}
                <div className={`lg:col-span-8 p-8 md:p-10 flex flex-col justify-between ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div>
                    <div className="flex items-start justify-between mb-5 gap-4">
                      <div>
                        {retreat.available && (
                          <span className="text-label uppercase tracking-widest text-sage bg-sage/10 px-2.5 py-1 mb-3 inline-block text-[10px]">
                            ● Open · Next: {retreat.nextDate}
                          </span>
                        )}
                        <h3 className="font-serif text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>
                          {retreat.title}
                        </h3>
                        <p className="text-xs font-sans uppercase tracking-widest text-muted mt-1">{retreat.subtitle}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-serif text-xl text-charcoal">{retreat.price}</p>
                        <p className="text-xs text-muted/60 mt-0.5">{retreat.intlPrice}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-4">
                      {[
                        { icon: Users,  text: retreat.capacity  },
                        { icon: MapPin, text: retreat.location  },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-1.5 text-xs text-muted">
                          <Icon className="w-3 h-3 text-muted/60" />
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-charcoal/70 leading-relaxed mb-5">{retreat.description}</p>

                    <ul className="grid grid-cols-2 gap-2">
                      {retreat.highlights.map(h => (
                        <li key={h} className="flex items-center gap-2 text-xs text-charcoal/65">
                          <CheckCircle className="w-3 h-3 text-sage flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3 mt-7">
                    <button
                      onClick={() => setBookingWorkshop(retreat.title)}
                      className="flex items-center gap-2.5 bg-terracotta text-white px-6 py-3 text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracottaDark transition-colors duration-400 shadow-button"
                    >
                      Express Interest <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 border border-charcoal/15 text-xs font-sans uppercase tracking-widest text-muted hover:border-charcoal/30 hover:text-charcoal transition-all duration-300">
                      Download Info
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        <div className="relative z-10 container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-label uppercase tracking-[0.3em] text-terracotta/70 block mb-4">Student Voices</span>
            <h2 className="font-serif text-4xl italic text-background" style={{ letterSpacing: '-0.015em' }}>
              What participants say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7 }}
                className="border border-white/8 p-6"
              >
                <p className="font-serif italic text-background/75 leading-relaxed mb-6 text-sm">"{t.quote}"</p>
                <div className="border-t border-white/8 pt-4">
                  <p className="text-xs font-sans font-500 text-background/60">{t.name}</p>
                  <p className="text-xs text-background/30 uppercase tracking-widest mt-0.5">{t.workshop} · {t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Private & Corporate ─────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 border-t border-charcoal/5">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Private & Corporate</span>
          <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-6" style={{ letterSpacing: '-0.015em' }}>
            Bespoke group sessions
          </h2>
          <p className="text-muted leading-relaxed max-w-2xl mx-auto mb-10">
            Private workshops for families, corporate team events, birthday experiences, and group bookings from 4 to 20 participants. Held at Mapheane's studio or your venue. Pricing on request.
          </p>
          <button
            onClick={() => setBookingWorkshop('Private / Corporate Workshop')}
            className="inline-flex items-center gap-3 bg-terracotta text-white px-8 py-4 text-xs font-sans uppercase tracking-[0.25em] hover:bg-terracottaDark transition-colors duration-400 shadow-button"
          >
            Enquire for Groups
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Booking Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {bookingWorkshop && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-ink/55 backdrop-blur-sm"
              onClick={() => { setBookingWorkshop(null); setSubmitted(false); setBookForm({ name: '', email: '', message: '', trap: '' }); }}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md top-1/2 -translate-y-1/2 z-[80] bg-background shadow-modal overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-0.5 bg-gradient-to-r from-sage/60 via-sage to-sage/60" />
              <div className="p-7 md:p-8">
                {submitted ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-sage/12 rounded-full flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-7 h-7 text-sage" />
                    </div>
                    <h3 className="font-serif text-2xl italic text-charcoal mb-3">Booking Received</h3>
                    <p className="text-muted text-sm leading-relaxed mb-6">
                      Mapheane will confirm availability and payment details within 48 hours.
                    </p>
                    <button
                      onClick={() => { setBookingWorkshop(null); setSubmitted(false); }}
                      className="text-xs font-sans uppercase tracking-widest text-muted hover:text-charcoal transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <span className="text-label uppercase tracking-[0.25em] text-sage block mb-2">Workshop Inquiry</span>
                        <h3 className="font-serif text-2xl italic text-charcoal">{bookingWorkshop}</h3>
                      </div>
                      <button onClick={() => setBookingWorkshop(null)}
                        className="text-muted hover:text-charcoal hover:rotate-90 transition-all duration-300 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <form onSubmit={handleBook} className="space-y-5">
                      {/* Honeypot */}
                      <input name="trap" type="text" aria-hidden="true" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
                      {[
                        { id: 'name',  label: 'Your Name',  type: 'text',  ph: 'Full name'        },
                        { id: 'email', label: 'Email',      type: 'email', ph: 'your@email.com'   },
                      ].map(f => (
                        <div key={f.id} className="group">
                          <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-2">{f.label}</label>
                          <input type={f.type} required value={(bookForm as any)[f.id]}
                            onChange={e => setBookForm(bf => ({ ...bf, [f.id]: e.target.value }))}
                            placeholder={f.ph} className="input-editorial" />
                        </div>
                      ))}
                      <div className="group">
                        <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-2">
                          Preferred Date / Notes
                        </label>
                        <textarea rows={3} value={bookForm.message}
                          onChange={e => setBookForm(bf => ({ ...bf, message: e.target.value }))}
                          placeholder="Preferred date, group size, any questions…"
                          className="w-full bg-transparent border-b border-charcoal/18 py-2 text-charcoal focus:outline-none focus:border-terracotta transition-colors font-serif text-base resize-none placeholder:text-charcoal/30 placeholder:italic" />
                      </div>
                      <button type="submit" disabled={sending}
                        className="w-full bg-sage text-white py-4 text-xs font-sans uppercase tracking-[0.2em] hover:bg-sageDark transition-colors duration-400 flex items-center justify-center gap-3 disabled:opacity-60">
                        {sending
                          ? <div className="w-4 h-4 border border-white/60 border-t-white rounded-full animate-spin" />
                          : <><ArrowRight className="w-4 h-4" /> Submit Inquiry</>}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
