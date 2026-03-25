import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, Star, Eye, Calendar,
  Heart, Coffee, BookOpen, Crown, Zap, X, Mail
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { useCurrency } from '../context/CurrencyContext';

interface Props { onNavigate: (page: any) => void; }

interface Tier {
  id: string;
  name: string;
  price: { monthly: number; annual: number };
  currency: 'ZAR';
  tagline: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  highlighted?: boolean;
  perks: string[];
}

const TIERS: Tier[] = [
  {
    id: 'news',
    name: 'Studio News',
    price: { monthly: 0, annual: 0 },
    currency: 'ZAR',
    tagline: 'Stay connected to the studio.',
    icon: Mail,
    color: '#9E9890',
    perks: [
      'Monthly studio newsletter',
      'Exhibition announcements',
      'New work notifications (48h after launch)',
      'Public event invitations',
    ],
  },
  {
    id: 'circle',
    name: "Studio Circle",
    price: { monthly: 320, annual: 3200 },
    currency: 'ZAR',
    tagline: 'Behind the scenes, before anyone else.',
    icon: Eye,
    color: '#7C8B6F',
    perks: [
      'New work 48-hour early access',
      'Monthly process video — studio notes',
      'Member-only journal posts',
      'Priority workshop booking window',
      'Annual signed A5 print',
    ],
  },
  {
    id: 'collector',
    name: "Collector's Circle",
    price: { monthly: 800, annual: 8000 },
    currency: 'ZAR',
    tagline: "The collector's inner circle.",
    icon: Star,
    color: '#A0522D',
    highlighted: true,
    perks: [
      'Everything in Studio Circle',
      'Commission first-refusal rights',
      'Quarterly edition print (signed + numbered)',
      'Virtual studio visit — 30 min, quarterly',
      'Personalised studio correspondence',
      'Pre-fair buying window at art fairs',
    ],
  },
  {
    id: 'patron',
    name: 'Founding Patron',
    price: { monthly: 2000, annual: 20000 },
    currency: 'ZAR',
    tagline: 'For collectors who believe in the work deeply.',
    icon: Crown,
    color: '#2D2A26',
    perks: [
      'Everything in Collector\'s Circle',
      'Annual original small work (framed)',
      'Name in all exhibition programmes',
      'Advance notice of all series launches',
      'Private in-person studio visit (once yearly)',
      'Direct studio WhatsApp access',
      'Invitation to exclusive collector dinners',
    ],
  },
];

const FAQS = [
  {
    q: 'When does my membership start?',
    a: 'Your membership activates immediately on payment confirmation. You\'ll receive a welcome message from Mapheane personally within 48 hours.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Monthly memberships can be cancelled before the next billing date. Annual memberships are non-refundable but can be paused.',
  },
  {
    q: 'How do I receive my annual print?',
    a: 'Prints are shipped annually in December, signed and numbered by Mapheane. Shipping is included for South Africa and Lesotho; international shipping is additional.',
  },
  {
    q: 'What does "first-refusal rights" on commissions mean?',
    a: 'Collector\'s Circle members are notified when new commission slots open, before the public announcement. You have 72 hours to claim a slot.',
  },
  {
    q: 'Is my membership fee deductible against artwork purchases?',
    a: 'No — membership fees are separate from artwork pricing. However, Collector\'s Circle members receive personalised pricing on direct studio purchases.',
  },
];

function TierCard({ tier, billing, onJoin }: { tier: Tier; billing: 'monthly' | 'annual'; onJoin: () => void }) {
  const Icon  = tier.icon;
  const price = billing === 'annual' ? Math.round(tier.price.annual / 12) : tier.price.monthly;
  const free  = price === 0;
  const { fromZAR } = useCurrency();

  return (
    <motion.div
      whileHover={!tier.highlighted ? { y: -4 } : {}}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col border ${
        tier.highlighted
          ? 'border-terracotta shadow-card-hover'
          : 'border-charcoal/10 hover:border-charcoal/20 hover:shadow-card'
      } bg-background transition-all duration-400`}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terracotta text-background text-[10px] font-sans uppercase tracking-[0.2em] px-3 py-1 whitespace-nowrap">
          Most popular
        </div>
      )}

      {/* Top accent */}
      <div className="h-0.5 w-full" style={{ background: tier.color }} />

      <div className="p-6 flex flex-col flex-1">
        {/* Icon + name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 flex items-center justify-center" style={{ background: `${tier.color}15` }}>
            <Icon className="w-4 h-4" style={{ color: tier.color }} />
          </div>
          <div>
            <p className="font-sans font-500 text-charcoal text-sm">{tier.name}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-1">
          {free ? (
            <p className="font-serif text-4xl text-charcoal" style={{ letterSpacing: '-0.02em' }}>Free</p>
          ) : (
            <div className="flex items-baseline gap-1">
              <p className="font-serif text-4xl text-charcoal" style={{ letterSpacing: '-0.02em', color: tier.color }}>
                {fromZAR(price)}
              </p>
              <span className="text-sm text-muted">/mo</span>
            </div>
          )}
        </div>
        {!free && billing === 'annual' && (
          <p className="text-xs text-sage mb-1">{fromZAR(tier.price.annual)} billed annually — 2 months free</p>
        )}
        <p className="text-sm text-muted mb-6 leading-relaxed">{tier.tagline}</p>

        {/* Perks */}
        <ul className="space-y-3 flex-1 mb-7">
          {tier.perks.map(perk => (
            <li key={perk} className="flex items-start gap-3">
              <div className="w-4 h-4 flex-shrink-0 mt-0.5 flex items-center justify-center">
                <Check className="w-3.5 h-3.5" style={{ color: tier.color }} />
              </div>
              <span className="text-sm text-charcoal/75 leading-relaxed">{perk}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onJoin}
          className={`w-full flex items-center justify-center gap-2 py-3.5 text-xs font-sans uppercase tracking-[0.2em] transition-all duration-400 ${
            tier.highlighted
              ? 'bg-terracotta text-background hover:bg-terracottaDark shadow-button hover:shadow-button-hover'
              : free
              ? 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'
              : 'border border-charcoal/15 text-muted hover:border-charcoal/30 hover:text-charcoal'
          }`}
        >
          {free ? 'Subscribe — free' : 'Join now'}
          {!free && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </motion.div>
  );
}

function JoinModal({ tier, onClose }: { tier: Tier; onClose: () => void }) {
  const [email,   setEmail]   = useState('');
  const [name,    setName]    = useState('');
  const [done,    setDone]    = useState(false);
  const [sending, setSending] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          type: 'General',
          message: `Collector's Circle interest — ${tier.name} tier. Please send membership details and payment instructions.`,
          trap: '',
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setDone(true);
    } catch {
      setError('Something went wrong. Please email hello@mapheane.art directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-ink/55 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-x-4 bottom-6 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-[80] bg-background shadow-modal overflow-hidden"
      >
        <div className="h-0.5" style={{ background: tier.color }} />
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-charcoal hover:rotate-90 transition-all duration-300">
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="text-center py-4">
                <div className="w-12 h-12 bg-sage/12 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-sage" />
                </div>
                <p className="font-serif italic text-xl text-charcoal mb-2">Welcome to {tier.name}</p>
                <p className="text-sm text-muted leading-relaxed">
                  You'll receive a personal welcome from Mapheane within 48 hours, along with membership details and payment instructions.
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-label uppercase tracking-[0.25em] mb-1" style={{ color: tier.color }}>Join</p>
                <h3 className="font-serif italic text-2xl text-charcoal mb-5">{tier.name}</h3>
                <form onSubmit={submit} className="space-y-5" noValidate>
                  <div className="group">
                    <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">
                      Name
                    </label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                      placeholder="Your full name"
                      className="w-full bg-transparent border-b border-charcoal/18 py-2 text-charcoal font-serif text-lg focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/25 placeholder:italic" />
                  </div>
                  <div className="group">
                    <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">
                      Email <span className="text-terracotta">*</span>
                    </label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="your@email.com"
                      className="w-full bg-transparent border-b border-charcoal/18 py-2 text-charcoal font-serif text-lg focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/25 placeholder:italic" />
                  </div>
                  <div className="bg-parchment/50 border border-charcoal/8 p-4 text-xs text-muted leading-relaxed">
                    Payment details will be sent to you via email. Membership activates on receipt of first payment. Cancel anytime.
                  </div>
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button type="submit" disabled={sending || !email || !name}
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-xs font-sans uppercase tracking-[0.2em] text-background transition-colors disabled:opacity-50"
                    style={{ background: tier.color }}>
                    {sending
                      ? <div className="w-3.5 h-3.5 border border-white/50 border-t-white rounded-full animate-spin" />
                      : <>Submit interest <ArrowRight className="w-3.5 h-3.5" /></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

export function CollectorCirclePage({ onNavigate }: Props) {
  useSEO({ title: "Collector's Circle", description: "Join Mapheane's collector membership — early access, process content, and direct studio connection." });

  const [billing,    setBilling]    = useState<'monthly' | 'annual'>('annual');
  const [openFAQ,    setOpenFAQ]    = useState<number | null>(null);
  const [joiningTier, setJoiningTier] = useState<Tier | null>(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-background min-h-screen pt-28 pb-24"
      >
        {/* Back */}
        <div className="px-5 sm:px-8 md:px-12 mb-10">
          <button onClick={() => onNavigate('home')}
            className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Home
          </button>
        </div>

        {/* Hero */}
        <div className="px-5 sm:px-8 md:px-12 max-w-6xl mx-auto mb-14 text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">
            Membership
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl italic text-charcoal mb-5 mx-auto max-w-3xl"
            style={{ letterSpacing: '-0.02em', lineHeight: 1.0 }}
          >
            The Collector's Circle
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-muted leading-relaxed max-w-lg mx-auto text-sm sm:text-base mb-8"
          >
            An inner studio community for collectors, patrons, and those who believe in the work deeply.
            Closer than social media, more personal than a gallery.
          </motion.p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-0 border border-charcoal/12 bg-background">
            {(['monthly', 'annual'] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className={`px-5 py-2.5 text-xs font-sans uppercase tracking-widest transition-all duration-200 capitalize ${
                  billing === b ? 'bg-charcoal text-background' : 'text-muted hover:text-charcoal'
                }`}>
                {b}
                {b === 'annual' && (
                  <span className="ml-1.5 text-[10px] text-sage normal-case not-italic tracking-normal">2 months free</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tier cards */}
        <div className="px-5 sm:px-8 md:px-12 max-w-6xl mx-auto mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {TIERS.map(tier => (
              <TierCard key={tier.id} tier={tier} billing={billing}
                onJoin={() => setJoiningTier(tier)} />
            ))}
          </div>
        </div>

        {/* What you're joining */}
        <div className="px-5 sm:px-8 md:px-12 max-w-5xl mx-auto mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-4">The studio</span>
              <h2 className="font-serif text-3xl md:text-4xl italic text-charcoal mb-5" style={{ letterSpacing: '-0.01em' }}>
                Why a collector circle?
              </h2>
              <div className="space-y-4 text-sm text-muted leading-relaxed">
                <p>
                  The most meaningful collector relationships in art don't start at fairs — they start in the studio. Long before a work reaches a gallery wall, it passes through a process of doubt, revision, and discovery that most people never see.
                </p>
                <p>
                  The Collector's Circle is a small, deliberate community of people who want to be inside that process. Not just to buy work, but to understand it — and to be the first to do so.
                </p>
                <p>
                  Membership directly supports independent studio practice in Lesotho and helps sustain a creative life outside the gallery system.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Eye,      label: '48h early access', sub: 'Before public listing' },
                { icon: BookOpen, label: 'Process content',  sub: 'Studio video notes'    },
                { icon: Calendar, label: 'Studio visits',    sub: 'Virtual, quarterly'    },
                { icon: Heart,    label: 'Annual print',     sub: 'Signed + numbered'     },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-parchment/50 border border-charcoal/8 p-5">
                  <div className="w-8 h-8 bg-terracotta/10 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-terracotta" />
                  </div>
                  <p className="font-sans font-500 text-sm text-charcoal mb-0.5">{label}</p>
                  <p className="text-xs text-muted">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="px-5 sm:px-8 md:px-12 max-w-3xl mx-auto mb-20">
          <h2 className="font-serif text-2xl md:text-3xl italic text-charcoal mb-8" style={{ letterSpacing: '-0.01em' }}>
            Frequently asked
          </h2>
          <div className="space-y-0">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-t border-charcoal/8 last:border-b">
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                >
                  <p className={`text-sm sm:text-base transition-colors ${openFAQ === i ? 'text-terracotta' : 'text-charcoal group-hover:text-terracotta'}`}>
                    {faq.q}
                  </p>
                  <span className={`text-xl flex-shrink-0 text-muted transition-transform duration-300 ${openFAQ === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <AnimatePresence>
                  {openFAQ === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-muted leading-relaxed pb-5 pr-8">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* CTA strip */}
        <div className="px-5 sm:px-8 md:px-12 max-w-6xl mx-auto">
          <div className="bg-charcoal py-14 px-8 md:px-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
            <div className="relative z-10">
              <p className="font-serif italic text-3xl md:text-4xl text-background mb-4" style={{ letterSpacing: '-0.01em' }}>
                Ready to get closer?
              </p>
              <p className="text-background/55 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                Start free with Studio News, or join the Collector's Circle to unlock early access, quarterly prints, and direct studio connection.
              </p>
              <button onClick={() => setJoiningTier(TIERS[2])}
                className="inline-flex items-center gap-3 bg-terracotta text-background px-8 py-4 text-xs font-sans uppercase tracking-[0.25em] hover:bg-terracottaDark transition-colors shadow-button hover:shadow-button-hover">
                Join the Circle <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Join modal */}
      <AnimatePresence>
        {joiningTier && (
          <JoinModal tier={joiningTier} onClose={() => setJoiningTier(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
