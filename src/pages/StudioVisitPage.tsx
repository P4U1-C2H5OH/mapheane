import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Clock, Calendar, Users, ChevronDown, ChevronUp, Check, Plane } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface StudioVisitPageProps {
  onNavigate: (page: any) => void;
}

const VISIT_TYPES = [
  {
    id: 'private-viewing',
    title: 'Private Viewing',
    duration: '1–2 hours',
    capacity: '1–4 guests',
    description: 'A private tour of the studio and current works. See pieces in progress, understand the process, and have a genuine conversation about the work in the space where it was made.',
    includes: [
      'Guided tour of studio and current works',
      'Process discussion — materials, methods, Basotho references',
      'First access to works not yet published',
      'Tea or coffee from the studio kitchen',
    ],
    ideal: 'Collectors making a first visit, serious buyers, press visits',
    price: 'Complimentary · By appointment',
    cta: 'Request a viewing',
  },
  {
    id: 'studio-session',
    title: 'Private Studio Session',
    duration: 'Half day (4 hours)',
    capacity: '1–2 guests',
    description: 'An immersive half-day alongside Mapheane in the studio while she works. You observe, ask questions, and engage with the creative process in real time — not a workshop, but a genuine presence in the studio.',
    includes: [
      'Four hours in the working studio',
      'Mapheane works throughout — you witness the actual process',
      'Lunch at a Maseru restaurant of your choice',
      'Prints and materials to take home',
      'First-refusal on any work completed during the session',
    ],
    ideal: 'International collectors, art enthusiasts, writers and curators',
    price: 'R5,000 per session',
    cta: 'Book a studio session',
    featured: true,
  },
  {
    id: 'collector-preview',
    title: 'Collector Preview',
    duration: '2–3 hours',
    capacity: '1–6 guests',
    description: 'A private preview of new works before they are published online. Collector Circle members receive first access; this visit is the most exclusive form of early acquisition. Works may be reserved on the day.',
    includes: [
      'Preview of 3–6 new or unreleased works',
      'Direct purchase at studio pricing (no commission)',
      'Certificate of Authenticity signed in your presence',
      'Champagne or wine from the studio cellar',
    ],
    ideal: 'Existing collectors, Collector Circle members',
    price: 'Collector Circle members: complimentary · Others: by invitation',
    cta: 'Request an invitation',
  },
];

const FAQS = [
  {
    q: 'Where is the studio?',
    a: 'The studio is in Maseru, the capital of the Kingdom of Lesotho — approximately 15 minutes from Moshoeshoe I International Airport. Maseru is accessible from Johannesburg OR Tambo with a 1-hour regional flight. The studio address is shared privately upon appointment confirmation.',
  },
  {
    q: 'How do I get to Maseru from Johannesburg?',
    a: 'There are daily regional flights from OR Tambo (JNB) to Moshoeshoe I (MSU) — approximately 1 hour. Alternatively, Maseru is a 5-hour drive from Johannesburg via the Maseru Bridge border crossing. Mapheane is happy to recommend accommodation and assist with logistics for international visitors.',
  },
  {
    q: 'Can I bring a partner or colleague?',
    a: 'Yes — most visit types welcome small groups. The Private Viewing is ideal for couples or small groups of up to 4. Studio Sessions are most intimate at 1–2 guests. Please specify when booking.',
  },
  {
    q: 'What if I need to reschedule?',
    a: 'Life happens — please give 48 hours notice if you need to reschedule and we will find another time. Studio Session fees are refundable with 7 days notice, or transferable to another date.',
  },
  {
    q: 'I am a curator or journalist. Do you host press visits?',
    a: 'Yes. Press and curatorial visits are handled as Private Viewings at no cost. Please introduce yourself and your publication or institution when requesting — Mapheane will respond personally.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-charcoal/8">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between py-5 text-left gap-4"
      >
        <span className="font-serif italic text-lg text-charcoal pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-terracotta flex-shrink-0 mt-1" />
          : <ChevronDown className="w-4 h-4 text-muted flex-shrink-0 mt-1" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <p className="text-muted text-sm leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function StudioVisitPage({ onNavigate }: StudioVisitPageProps) {
  const [form, setForm] = useState({ name: '', email: '', date: '', type: 'private-viewing', guests: '1', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useSEO({
    title: 'Studio Visit — Mapheane',
    description: 'Book a private visit to Mapheane\'s studio in Maseru, Lesotho. Private viewings, studio sessions, and collector previews.',
  });
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.date)         e.date  = 'Preferred date is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    form.name,
          email:   form.email,
          type:    'Studio-Visit',
          message: `Visit type: ${form.type}\nPreferred date: ${form.date}\nGuests: ${form.guests}${form.message ? '\n\n' + form.message : ''}`,
          trap:    '',
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setSubmitError('Something went wrong. Please email hello@mapheane.art directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-background min-h-screen overflow-hidden"
    >
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative w-full pt-36 pb-24 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-serif text-[18vw] leading-none text-charcoal/[0.028] italic">Studio</span>
        </div>

        <div className="relative z-10 container mx-auto max-w-6xl">
          <button onClick={() => onNavigate('home')}
            className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-14">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.7 }}
                className="text-label uppercase tracking-[0.3em] text-terracotta block mb-6"
              >
                Maseru · Kingdom of Lesotho
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="font-serif text-5xl md:text-7xl text-charcoal mb-8"
                style={{ lineHeight: '1.0', letterSpacing: '-0.02em' }}
              >
                Come to<br />
                <em className="italic text-terracotta">the studio.</em>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-muted text-body-lg leading-relaxed max-w-md"
              >
                The work makes most sense in the space where it was made — at 1,600 metres above sea level, with the highland light and the highland silence. Come and see it there.
              </motion.p>

              {/* Location facts */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="mt-10 flex flex-col gap-3"
              >
                {[
                  { icon: MapPin,    text: 'Maseru, Lesotho · 15 min from airport' },
                  { icon: Plane,     text: '1-hour flight from Johannesburg OR Tambo' },
                  { icon: Clock,     text: 'Studio open Mon–Sat · 9am–5pm SAST' },
                  { icon: Calendar,  text: 'Visits by appointment only · 48hrs notice' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-terracotta/70 flex-shrink-0" />
                    <span className="text-sm text-charcoal/70">{text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative aspect-[4/5] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-terracotta/8 to-transparent z-10 pointer-events-none" />
              <img src="/artportfolio.jpg" alt="The studio in Maseru" draggable={false}
                className="w-full h-full object-cover" />
              <div className="absolute bottom-5 left-5 right-5 z-20">
                <p className="font-serif italic text-white/80 text-sm bg-ink/40 backdrop-blur-sm px-4 py-3">
                  "There is no substitute for standing in front of the original work."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Visit types ──────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 bg-parchment/30 border-y border-charcoal/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Ways to Visit</span>
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal" style={{ letterSpacing: '-0.015em' }}>
              Choose your experience
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VISIT_TYPES.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className={`relative p-7 border flex flex-col transition-all duration-500 ${
                  v.featured
                    ? 'border-terracotta/40 bg-background shadow-card-hover'
                    : 'border-charcoal/8 bg-background hover:border-terracotta/25 hover:shadow-card-hover'
                }`}
              >
                {v.featured && (
                  <div className="absolute -top-px left-0 right-0 h-px bg-terracotta/60" />
                )}
                {v.featured && (
                  <span className="absolute top-4 right-4 text-label uppercase tracking-widest text-terracotta">Most popular</span>
                )}

                <div className="w-8 h-px bg-terracotta/40 mb-5" />
                <h3 className="font-serif italic text-2xl text-charcoal mb-2">{v.title}</h3>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Clock className="w-3 h-3" /> {v.duration}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Users className="w-3 h-3" /> {v.capacity}
                  </div>
                </div>

                <p className="text-sm text-muted leading-relaxed mb-6">{v.description}</p>

                <ul className="space-y-2 mb-6 flex-1">
                  {v.includes.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-charcoal/70">
                      <Check className="w-3.5 h-3.5 text-sage flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="border-t border-charcoal/6 pt-4 mt-auto">
                  <p className="text-xs text-muted/60 mb-3">{v.ideal}</p>
                  <p className="font-serif text-base text-terracotta">{v.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Booking form ─────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-6">Plan Your Visit</span>
              <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-6" style={{ letterSpacing: '-0.015em', lineHeight: '1.0' }}>
                Request an appointment
              </h2>
              <p className="text-muted leading-relaxed mb-8">
                Fill in the form and Mapheane will respond personally within 24 hours with available dates and everything you need to know for your visit.
              </p>

              {/* What to expect */}
              <div className="bg-parchment/50 border border-charcoal/6 p-6 space-y-4">
                <p className="text-label uppercase tracking-widest text-muted mb-2">What happens next</p>
                {[
                  'Mapheane responds within 24 hours',
                  'A date is confirmed that works for both',
                  'You receive studio address + directions',
                  'Optional: hotel and transport recommendations',
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-label text-terracotta/60 flex-shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-sm text-charcoal/70">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                >
                  <div className="w-14 h-14 border border-sage/40 flex items-center justify-center mb-6">
                    <Check className="w-6 h-6 text-sage" />
                  </div>
                  <h3 className="font-serif italic text-3xl text-charcoal mb-3">Request received</h3>
                  <p className="text-muted max-w-xs leading-relaxed">
                    Mapheane will respond personally within 24 hours with available dates and everything you need to plan your visit.
                  </p>
                  <button
                    onClick={() => onNavigate('home')}
                    className="mt-8 text-xs font-sans uppercase tracking-[0.2em] text-terracotta hover:text-terracottaDark transition-colors"
                  >
                    Return home
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Name + email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-label uppercase tracking-widest text-muted block mb-2">Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="Your name"
                        className={`w-full px-4 py-3 border bg-background text-sm text-charcoal placeholder:text-muted/50 focus:outline-none transition-colors ${errors.name ? 'border-red-400' : 'border-charcoal/15 focus:border-terracotta'}`}
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="text-label uppercase tracking-widest text-muted block mb-2">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => set('email', e.target.value)}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-3 border bg-background text-sm text-charcoal placeholder:text-muted/50 focus:outline-none transition-colors ${errors.email ? 'border-red-400' : 'border-charcoal/15 focus:border-terracotta'}`}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Visit type */}
                  <div>
                    <label className="text-label uppercase tracking-widest text-muted block mb-2">Visit type</label>
                    <div className="space-y-2">
                      {VISIT_TYPES.map(v => (
                        <label key={v.id} className={`flex items-center justify-between px-4 py-3 border cursor-pointer transition-all duration-200 ${
                          form.type === v.id ? 'border-terracotta bg-terracotta/4' : 'border-charcoal/10 hover:border-charcoal/25'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              form.type === v.id ? 'border-terracotta' : 'border-charcoal/25'
                            }`}>
                              {form.type === v.id && <div className="w-1.5 h-1.5 rounded-full bg-terracotta" />}
                            </div>
                            <input type="radio" name="type" value={v.id} checked={form.type === v.id}
                              onChange={e => set('type', e.target.value)} className="sr-only" />
                            <span className="font-serif text-sm text-charcoal">{v.title}</span>
                          </div>
                          <span className="text-label text-muted/60">{v.duration}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date + guests */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-label uppercase tracking-widest text-muted block mb-2">Preferred date *</label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={e => set('date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border bg-background text-sm text-charcoal focus:outline-none transition-colors ${errors.date ? 'border-red-400' : 'border-charcoal/15 focus:border-terracotta'}`}
                      />
                      {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                    </div>
                    <div>
                      <label className="text-label uppercase tracking-widest text-muted block mb-2">Number of guests</label>
                      <select
                        value={form.guests}
                        onChange={e => set('guests', e.target.value)}
                        className="w-full px-4 py-3 border border-charcoal/15 bg-background text-sm text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                      >
                        {['1', '2', '3', '4', '5', '6'].map(n => (
                          <option key={n} value={n}>{n} {Number(n) === 1 ? 'guest' : 'guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-label uppercase tracking-widest text-muted block mb-2">Message (optional)</label>
                    <textarea
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                      placeholder="Any context about your visit, what you're hoping to see, or questions about getting to Maseru…"
                      rows={4}
                      className="w-full px-4 py-3 border border-charcoal/15 bg-background text-sm text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-terracotta transition-colors resize-none"
                    />
                  </div>

                  {submitError && <p className="text-xs text-red-400">{submitError}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-terracotta text-white text-xs font-sans uppercase tracking-[0.25em] hover:bg-terracottaDark transition-colors duration-400 disabled:opacity-60 shadow-button hover:shadow-button-hover"
                  >
                    {submitting ? 'Sending…' : (
                      <><Calendar className="w-4 h-4" /> Request this visit</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 border-t border-charcoal/5 bg-parchment/20">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Planning your trip</span>
            <h2 className="font-serif text-4xl italic text-charcoal" style={{ letterSpacing: '-0.015em' }}>
              Common questions
            </h2>
          </div>
          <div>
            {FAQS.map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 bg-charcoal relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
        />
        <div className="relative z-10 container mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-4xl md:text-5xl italic text-background mb-6"
            style={{ letterSpacing: '-0.02em', lineHeight: '1.05' }}>
            The work lives here.<br />Come and meet it.
          </h2>
          <p className="text-background/50 mb-10 max-w-md mx-auto leading-relaxed">
            A studio visit to Maseru is not just a purchase opportunity — it is an encounter with a practice rooted in a landscape most collectors have never seen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => window.scrollTo({ top: document.querySelector('form') ? (document.querySelector('form') as HTMLElement).offsetTop - 100 : 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-3 bg-terracotta text-white px-8 py-4 text-xs font-sans uppercase tracking-[0.25em] hover:bg-terracottaLight transition-colors duration-400"
            >
              Book a visit <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('workshops')}
              className="inline-flex items-center gap-3 border border-background/20 text-background/60 px-8 py-4 text-xs font-sans uppercase tracking-[0.25em] hover:border-background/50 hover:text-background transition-all duration-400"
            >
              View workshops instead
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
