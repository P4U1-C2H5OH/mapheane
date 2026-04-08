import { useSEO } from '../hooks/useSEO';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, CheckCircle, Clock, MessageSquare,
  Palette, Package, Star, ChevronDown, ChevronUp
} from 'lucide-react';
import { CommissionModal } from '../components/CommissionModal';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { STATIC_IMAGES } from '../lib/staticImages';

interface CommissionPageProps {
  onNavigate: (page: any) => void;
}

const STATUS: 'open' | 'waitlist' | 'closed' = 'open';
const SLOTS_TOTAL = 4;
const SLOTS_TAKEN = 1;

// Quarterly availability map — update this each quarter
// slot: null = available, 'taken' = confirmed, 'hold' = tentative hold
const QUARTERLY_SLOTS: { quarter: string; slots: (null | 'taken' | 'hold')[] }[] = [
  { quarter: 'Q1 2026 (Jan–Mar)', slots: ['taken', 'taken', null, null] },
  { quarter: 'Q2 2026 (Apr–Jun)', slots: [null, null, null, null] },
  { quarter: 'Q3 2026 (Jul–Sep)', slots: [null, null, null, null] },
  { quarter: 'Q4 2026 (Oct–Dec)', slots: [null, null, null, null] },
];

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Inquiry',
    description: 'Submit a brief describing your vision — subject, mood, medium preference, size, and budget range. No commitment required at this stage.',
    duration: 'Same day',
    icon: MessageSquare,
  },
  {
    number: '02',
    title: 'Consultation',
    description: 'Mapheane reviews your inquiry and responds personally within 48 hours with questions, initial ideas, and a detailed quote tailored to your vision.',
    duration: '24–48 hrs',
    icon: MessageSquare,
  },
  {
    number: '03',
    title: 'Agreement & Deposit',
    description: 'Upon acceptance, a commission contract is signed and a 50% first payment secures your slot. For sculptures, a 33/33/33 milestone structure applies.',
    duration: 'Week 1',
    icon: CheckCircle,
  },
  {
    number: '04',
    title: 'Creation',
    description: 'Mapheane works in her Maseru studio. Progress photos are shared at key milestones. You have two rounds of feedback built into the process.',
    duration: '4–14 weeks',
    icon: Palette,
  },
  {
    number: '05',
    title: 'Approval & Final Payment',
    description: 'Final photography of the completed work is shared for approval. The remaining 50% is due before the piece ships.',
    duration: 'Week of completion',
    icon: Star,
  },
  {
    number: '06',
    title: 'Delivery',
    description: 'Your work is professionally packed, insured, and shipped via DHL Express. Internationally tracked with a Certificate of Authenticity.',
    duration: '1–2 weeks shipping',
    icon: Package,
  },
];

const PRICING = [
  {
    medium: 'Charcoal & Graphite Drawing',
    range: 'R3,000 – R18,000',
    note: 'Works on paper · 50/50 payment',
    sub: 'A3 to A0 formats. Detailed figurative studies, portraiture, landscape.',
  },
  {
    medium: 'Mixed Media Painting',
    range: 'R18,000 – R80,000',
    note: 'Resin canvas · 50/50 payment',
    sub: 'Custom dimensions. The richest and most complex commissions Mapheane accepts.',
  },
  {
    medium: 'Glazed Stoneware Sculpture',
    range: 'R10,000 – R55,000',
    note: 'Quote on request · 33/33/33',
    sub: 'Functional and purely sculptural works. Kiln-fired, glazed to specification.',
  },
];

const COMMISSION_GALLERY_IMAGES = [
  'https://res.cloudinary.com/doy7pcli0/image/upload/v1775626142/Professional_Artwork_3_g217hs.png',
  'https://res.cloudinary.com/doy7pcli0/image/upload/v1775626060/Professional_Portrait_Photography_ahiow0.jpg',
  'https://res.cloudinary.com/doy7pcli0/image/upload/v1775626734/Professional_Art_Photography_wpjdao.jpg',
  'https://res.cloudinary.com/doy7pcli0/image/upload/v1775626818/Image_5_-_Abstract_Female_Busts_uqzsdv.png',
  'https://res.cloudinary.com/doy7pcli0/image/upload/v1775626811/Image_4_-_Purple_Figs_uaeyjn.png',
  'https://res.cloudinary.com/doy7pcli0/image/upload/v1775626765/Image_1_-_Professional_Portrait_fjvxtp.png',
] as const;

const FAQS = [
  {
    q: 'Can I commission a portrait?',
    a: 'Yes — portraiture in charcoal/graphite or mixed media is a strong suit. Mapheane will ask for 5–8 high-quality reference photographs from different angles and lighting conditions.',
  },
  {
    q: 'Do you retain rights to the commissioned work?',
    a: 'The client receives the physical artwork. Mapheane retains all copyright, reproduction rights, and the right to photograph and publish the work in her portfolio. If you require exclusive reproduction rights, this can be negotiated at an additional fee.',
  },
  {
    q: 'What if I do not like the final result?',
    a: 'Two rounds of feedback are included at key stages before completion. If the work diverges significantly from the agreed brief despite this, Mapheane will address it. The commission contract protects both parties clearly.',
  },
  {
    q: 'Can I visit the studio during creation?',
    a: 'Studio visits in Maseru are warmly welcomed by arrangement. International clients receive curated progress photo updates at each milestone. A virtual studio tour via video call can also be arranged.',
  },
  {
    q: 'What is the cancellation policy?',
    a: 'All payments made to date are non-refundable upon cancellation. This protects the time and materials already invested. If Mapheane is unable to complete the work, she will refund all payments in full.',
  },
  {
    q: 'How do you handle international shipping?',
    a: 'Artworks ship via DHL Express with full insurance at declared value. Import duties and customs fees are the responsibility of the buyer. Mapheane provides all necessary customs documentation.',
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

export function CommissionPage({ onNavigate }: CommissionPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.1);
  const { ref: processRef, isVisible: processVisible } = useScrollReveal(0.1);

  useSEO({ title: 'Commissions', description: 'Commission an original work — paintings, drawings, and sculpture' });
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const statusConfig = {
    open:     { label: 'Accepting Commissions',   color: 'text-sage',       dot: 'bg-sage'       },
    waitlist: { label: 'Waitlist Open',            color: 'text-clay',       dot: 'bg-clay'       },
    closed:   { label: 'Commissions Closed',       color: 'text-muted',      dot: 'bg-muted'      },
  }[STATUS];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-background min-h-screen w-full overflow-hidden"
      >
        {/* ─── Hero ──────────────────────────────────────── */}
        <section className="relative w-full pt-36 pb-24 px-6 md:px-12 overflow-hidden">
          {/* Large ambient text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="font-serif text-[22vw] leading-none text-charcoal/[0.03] italic">
              Commission
            </span>
          </div>

          <div className="relative z-10 container mx-auto max-w-6xl">
            <button
              onClick={() => onNavigate('home')}
              className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-14"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <div ref={heroRef} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
              <div>
                <motion.span
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.7 }}
                  className="text-label uppercase tracking-[0.3em] text-terracotta block mb-6"
                >
                  Bespoke Artworks
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="font-serif text-5xl md:text-7xl text-charcoal mb-8"
                  style={{ lineHeight: '1.0', letterSpacing: '-0.02em' }}
                >
                  A work made<br />
                  <em className="italic text-terracotta">only for you.</em>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-muted text-body-lg leading-relaxed max-w-prose mb-10"
                >
                  Every commission begins with a conversation. Whether you have a precise vision or simply a feeling — a mood, a memory, a space that needs a soul — Mapheane works with you to bring it into the world.
                </motion.p>

                {/* Status indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mb-10"
                >
                  {/* Status pill */}
                  <div className="flex items-center gap-2.5 mb-6">
                    <span className={`w-2 h-2 rounded-full ${statusConfig.dot} ${STATUS === 'open' ? 'animate-pulse-soft' : ''}`} />
                    <span className={`text-xs font-sans uppercase tracking-[0.2em] ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Quarterly calendar */}
                  <div className="space-y-3 max-w-sm">
                    {QUARTERLY_SLOTS.map(({ quarter, slots }) => (
                      <div key={quarter}>
                        <p className="text-label uppercase tracking-widest text-muted/60 mb-1.5">{quarter}</p>
                        <div className="flex items-center gap-2">
                          {slots.map((slot, i) => (
                            <div
                              key={i}
                              title={slot === 'taken' ? 'Confirmed' : slot === 'hold' ? 'On hold' : 'Available'}
                              className={`h-2 flex-1 rounded-sm transition-colors duration-300 ${
                                slot === 'taken' ? 'bg-terracotta' :
                                slot === 'hold'  ? 'bg-gold/60' :
                                'bg-charcoal/10 hover:bg-charcoal/20'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted ml-1 flex-shrink-0">
                            {slots.filter(s => s === null).length} open
                          </span>
                        </div>
                      </div>
                    ))}
                    {/* Legend */}
                    <div className="flex items-center gap-5 pt-1">
                      {[
                        { color: 'bg-terracotta',  label: 'Taken' },
                        { color: 'bg-gold/60',      label: 'On hold' },
                        { color: 'bg-charcoal/10',  label: 'Available' },
                      ].map(l => (
                        <div key={l.label} className="flex items-center gap-1.5">
                          <div className={`w-3 h-1.5 rounded-sm ${l.color}`} />
                          <span className="text-label text-muted/50">{l.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-3 bg-terracotta text-white px-8 py-4 text-xs font-sans uppercase tracking-[0.25em] hover:bg-terracottaDark transition-colors duration-400 shadow-button hover:shadow-button-hover"
                >
                  Begin an Inquiry
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Hero image */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative aspect-[3/4] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-terracotta/8 to-transparent z-10 pointer-events-none" />
                <img
                  src={STATIC_IMAGES.heroSecondary}
                  alt="Mapheane in studio"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <p className="font-serif italic text-sm text-white/80 bg-ink/40 backdrop-blur-sm px-4 py-3">
                    "I begin not with the technique, but with the feeling you bring me."
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Pricing tiers ─────────────────────────────── */}
        <section className="py-20 px-6 md:px-12 bg-parchment/40 border-y border-charcoal/5">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-14">
              <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Mediums & Starting Prices</span>
              <h2 className="font-serif text-4xl md:text-5xl text-charcoal" style={{ letterSpacing: '-0.015em' }}>
                What can be commissioned
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRICING.map((tier, i) => (
                <motion.div
                  key={tier.medium}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="bg-background p-7 border border-charcoal/6 hover:border-terracotta/30 hover:shadow-card-hover transition-all duration-500 group"
                >
                  <div className="w-8 h-px bg-terracotta/40 mb-5 group-hover:w-14 transition-all duration-500" />
                  <h3 className="font-serif italic text-xl text-charcoal mb-2">{tier.medium}</h3>
                  <p className="text-xs font-sans uppercase tracking-widest text-muted mb-4">{tier.note}</p>
                  <p className="font-serif text-2xl text-terracotta mb-3">{tier.range}</p>
                  <p className="text-sm text-muted leading-relaxed">{tier.sub}</p>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-xs text-muted/60 mt-8 font-sans">
              Prices in ZAR · International clients: ~R18 per €1 · All prices exclude shipping & customs
            </p>
          </div>
        </section>

        {/* ─── Process steps ─────────────────────────────── */}
        <section className="py-24 px-6 md:px-12">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">How It Works</span>
              <h2 className="font-serif text-4xl md:text-5xl text-charcoal" style={{ letterSpacing: '-0.015em' }}>
                The commission journey
              </h2>
            </div>

            <div ref={processRef} className="relative">
              {/* Vertical line */}
              <div className="absolute left-[1.875rem] md:left-1/2 top-0 bottom-0 w-px bg-charcoal/8 hidden sm:block" />

              <div className="space-y-0">
                {PROCESS_STEPS.map((step, i) => {
                  const isLeft = i % 2 === 0;
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.number}
                      initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-6 py-10 ${
                        isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'
                      }`}
                    >
                      {/* Content card */}
                      <div className={`flex-1 ${isLeft ? 'sm:text-right sm:pr-10' : 'sm:text-left sm:pl-10'}`}>
                        <div className="flex items-center gap-3 mb-3 sm:justify-end flex-row-reverse sm:flex-row">
                          <span className="text-label uppercase tracking-[0.3em] text-muted">{step.duration}</span>
                          <Clock className="w-3 h-3 text-muted" />
                        </div>
                        <h3 className="font-serif text-2xl italic text-charcoal mb-2">{step.title}</h3>
                        <p className="text-sm text-muted leading-relaxed max-w-sm ml-auto">{step.description}</p>
                      </div>

                      {/* Node */}
                      <div className="relative z-10 flex-shrink-0 w-[3.75rem] h-[3.75rem] bg-background border-2 border-charcoal/12 flex flex-col items-center justify-center hover:border-terracotta hover:bg-terracotta/4 transition-all duration-400 shadow-card">
                        <span className="text-label text-terracotta/60">{step.number}</span>
                        <Icon className="w-4 h-4 text-charcoal/40 mt-0.5" />
                      </div>

                      {/* Right side spacer */}
                      <div className="flex-1 hidden sm:block" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Gallery of past commissions ───────────────── */}
        <section className="py-20 px-6 md:px-12 bg-charcoal/[0.02] border-t border-charcoal/5">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-14">
              <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Past Commissions</span>
              <h2 className="font-serif text-4xl md:text-5xl text-charcoal" style={{ letterSpacing: '-0.015em' }}>
                Work made for others
              </h2>
              <p className="text-muted mt-4 max-w-md mx-auto">Commissions span private homes in Johannesburg, Maseru, Paris, and Brussels — each a deeply personal collaboration.</p>
            </div>

            {/* Grid — use dedicated commission images instead of the single placeholder */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { title: 'Family Portrait Study',     medium: 'Charcoal on Paper',           dims: '60×80cm' },
                { title: 'Corporate Collection I',    medium: 'Mixed Media on Resin Canvas',  dims: '120×150cm' },
                { title: 'Anniversary Piece',         medium: 'Glazed Stoneware',             dims: '40×40×45cm' },
                { title: 'Private Residence, Maseru', medium: 'Mixed Media on Resin Canvas',  dims: '97×130cm' },
                { title: 'Memorial Sculpture',        medium: 'Glazed Stoneware',             dims: '30×30×55cm' },
                { title: 'Interior Commission',       medium: 'Graphite on Paper',            dims: '50×70cm' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="group relative overflow-hidden bg-parchment aspect-[3/4]"
                >
                  <img
                    src={COMMISSION_GALLERY_IMAGES[i]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-luxury"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-luxury">
                    <p className="font-serif italic text-white text-sm leading-tight">{item.title}</p>
                    <p className="text-white/60 text-xs mt-1">{item.medium} · {item.dims}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ──────────────────────────────── */}
        <section className="py-20 px-6 md:px-12">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  quote: "The process felt like a true collaboration. Mapheane understood not just what I described, but what I meant. The work now holds a place of honour in our home.",
                  name: 'Tsepiso M.',
                  location: 'Maseru, Lesotho',
                },
                {
                  quote: "I commissioned a charcoal portrait as a gift. The detail, the emotion — it left my mother speechless. Worth every Rand and every week of the wait.",
                  name: 'Nomvula K.',
                  location: 'Johannesburg, South Africa',
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.7 }}
                  className="bg-parchment/40 p-8 border border-charcoal/5"
                >
                  <p className="font-serif italic text-lg text-charcoal/80 leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-px bg-terracotta/40" />
                    <div>
                      <p className="text-sm font-sans font-500 text-charcoal">{t.name}</p>
                      <p className="text-xs text-muted uppercase tracking-widest">{t.location}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ───────────────────────────────────────── */}
        <section className="py-20 px-6 md:px-12 border-t border-charcoal/5">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center mb-12">
              <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Questions</span>
              <h2 className="font-serif text-4xl italic text-charcoal" style={{ letterSpacing: '-0.015em' }}>
                What you might be wondering
              </h2>
            </div>
            <div>
              {FAQS.map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─────────────────────────────────── */}
        <section className="py-24 px-6 md:px-12 bg-charcoal relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative z-10 container mx-auto max-w-3xl text-center">
            <span className="text-label uppercase tracking-[0.3em] text-terracotta/70 block mb-6">
              {statusConfig.label}
            </span>
            <h2 className="font-serif text-4xl md:text-6xl italic text-background mb-6"
              style={{ letterSpacing: '-0.02em', lineHeight: '1.05' }}>
              Your vision deserves<br />a singular work.
            </h2>
            <p className="text-background/50 mb-10 max-w-md mx-auto leading-relaxed">
              A commission from Mapheane is a piece that will exist nowhere else in the world. Begin the conversation — there is no pressure, only possibility.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-3 bg-terracotta text-white px-10 py-4 text-xs font-sans uppercase tracking-[0.25em] hover:bg-terracottaLight transition-colors duration-400 shadow-button hover:shadow-button-hover"
            >
              Begin an Inquiry
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

      </motion.div>

      {/* Commission Modal */}
      {modalOpen && (
        <CommissionModal
          onClose={() => setModalOpen(false)}
          onNavigateCommission={() => {}}
        />
      )}
    </>
  );
}
