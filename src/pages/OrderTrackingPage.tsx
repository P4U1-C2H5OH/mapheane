import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Package, Truck, CheckCircle,
  Clock, AlertCircle, MapPin, Mail, ArrowRight, X
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { formatZar } from '../lib/pricing';

interface Props {
  onNavigate: (page: any) => void;
  onViewCertificate?: (ref: string) => void;
}

type OrderStatus = 'pending' | 'verified' | 'dispatched' | 'delivered' | 'cancelled';

interface TrackResult {
  ref:        string;
  status:     OrderStatus;
  customer:   string;
  items:      { title: string; medium: string }[];
  total:      number;
  fulfilment: 'delivery' | 'pickup';
  pickupPoint?: string;
  tracking?:   string;
  timeline:    { status: OrderStatus; label: string; date: string; done: boolean }[];
  estimatedDelivery?: string;
}


const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; Icon: any }> = {
  pending:    { label: 'Awaiting verification', color: '#A0522D', bg: 'rgba(160,82,45,0.08)',  Icon: Clock       },
  verified:   { label: 'Payment verified',      color: '#7C8B6F', bg: 'rgba(124,139,111,0.08)', Icon: CheckCircle },
  dispatched: { label: 'On its way',            color: '#C4956A', bg: 'rgba(196,149,106,0.08)', Icon: Truck       },
  delivered:  { label: 'Delivered',             color: '#2D2A26', bg: 'rgba(45,42,38,0.06)',   Icon: Package     },
  cancelled:  { label: 'Cancelled',             color: '#9E9890', bg: 'rgba(158,152,144,0.08)', Icon: X           },
};

export function OrderTrackingPage({ onNavigate, onViewCertificate }: Props) {
  useSEO({ title: 'Track Your Order', description: 'Track the status of your Mapheane order using your order reference number.' });

  const [ref,     setRef]     = useState('');
  const [result,  setResult]  = useState<TrackResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = ref.trim().toUpperCase();
    if (!normalized) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const res = await fetch(`/api/track?ref=${encodeURIComponent(normalized)}`);
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) throw new Error('Lookup failed');
      setResult(await res.json());
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const PIPELINE: OrderStatus[] = ['pending', 'verified', 'dispatched', 'delivered'];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen pt-28 pb-24 bg-background"
    >
      <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-3xl">

        <button onClick={() => onNavigate('home')}
          className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-10">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Home
        </button>

        <div className="mb-10">
          <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Orders</span>
          <h1 className="font-serif text-4xl sm:text-5xl italic text-charcoal" style={{ letterSpacing: '-0.015em', lineHeight: 1.05 }}>
            Track your order
          </h1>
          <p className="text-muted text-sm mt-3 leading-relaxed">
            Enter the order reference from your confirmation email (e.g. MAP-X4R2TY).
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleTrack} className="flex gap-3 mb-10">
          <div className="flex-1 relative group">
            <input
              value={ref}
              onChange={e => { setRef(e.target.value); setNotFound(false); }}
              placeholder="MAP-XXXXXX"
              className="w-full bg-transparent border-b-2 border-charcoal/18 py-3 text-charcoal font-serif text-2xl focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/20 placeholder:italic uppercase tracking-widest"
              style={{ letterSpacing: '0.1em' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !ref.trim()}
            className="flex items-center gap-2 bg-terracotta text-background px-6 py-3 text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracottaDark transition-colors disabled:opacity-50 shadow-button flex-shrink-0"
          >
            {loading
              ? <div className="w-4 h-4 border border-white/50 border-t-white rounded-full animate-spin" />
              : <><Search className="w-3.5 h-3.5" /> Track</>}
          </button>
        </form>

        {/* Not found */}
        <AnimatePresence>
          {notFound && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-3 bg-terracotta/6 border border-terracotta/20 p-5 mb-8">
              <AlertCircle className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-sans font-500 text-charcoal mb-1">Order not found</p>
                <p className="text-xs text-muted leading-relaxed">
                  Check your reference and try again. References are case-insensitive and look like MAP-X4R2TY.
                  If you still can't find it, email{' '}
                  <a href="mailto:hello@mapheane.art" className="text-terracotta hover:text-terracottaDark transition-colors">
                    hello@mapheane.art
                  </a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              {/* Status banner */}
              {(() => {
                const cfg = STATUS_CONFIG[result.status];
                const Icon = cfg.Icon;
                return (
                  <div className="flex items-center gap-4 p-5 border border-charcoal/8"
                    style={{ background: cfg.bg }}>
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                      style={{ background: `${cfg.color}20` }}>
                      <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-500 text-charcoal">{cfg.label}</p>
                      <p className="text-xs text-muted">Ref: {result.ref}</p>
                    </div>
                    {result.estimatedDelivery && (
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="text-xs text-muted mb-0.5">Estimated</p>
                        <p className="text-sm text-charcoal font-sans">{result.estimatedDelivery}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Timeline */}
              <div className="bg-background border border-charcoal/8 p-5 sm:p-6">
                <p className="font-serif italic text-lg text-charcoal mb-6">Order progress</p>
                <div className="space-y-0">
                  {result.timeline.map((step, i) => {
                    const isLast    = i === result.timeline.length - 1;
                    const isCurrent = step.status === result.status;
                    const cfg       = STATUS_CONFIG[step.status];
                    const Icon      = cfg.Icon;
                    return (
                      <div key={step.status} className="flex gap-4">
                        {/* Line + dot */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                            step.done
                              ? 'bg-sage text-background'
                              : isCurrent
                              ? 'border-2 border-terracotta text-terracotta'
                              : 'border border-charcoal/15 text-muted/30'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {!isLast && (
                            <div className={`w-px flex-1 my-1 ${step.done ? 'bg-sage/40' : 'bg-charcoal/8'}`} style={{ minHeight: 24 }} />
                          )}
                        </div>
                        {/* Content */}
                        <div className={`flex-1 pb-5 ${isLast ? '' : ''}`}>
                          <div className="flex items-baseline justify-between gap-3 mb-0.5">
                            <p className={`text-sm font-sans ${step.done || isCurrent ? 'text-charcoal font-500' : 'text-muted'}`}>
                              {step.label}
                            </p>
                            <p className="text-xs text-muted flex-shrink-0">{step.date}</p>
                          </div>
                          {isCurrent && result.tracking && step.status === 'dispatched' && (
                            <p className="text-xs text-terracotta">{result.tracking}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order details */}
              <div className="bg-background border border-charcoal/8 p-5 sm:p-6">
                <p className="font-serif italic text-lg text-charcoal mb-5">Order details</p>
                <div className="space-y-4">
                  {result.items.map(item => (
                    <div key={item.title} className="flex items-start gap-3 pb-4 border-b border-charcoal/6 last:border-0 last:pb-0">
                      <div className="w-12 h-14 bg-parchment flex-shrink-0 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-b from-parchment to-charcoal/10" />
                      </div>
                      <div>
                        <p className="font-serif italic text-charcoal">{item.title}</p>
                        <p className="text-xs text-muted mt-0.5">{item.medium}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2">
                    <span className="text-muted text-sm">Total paid</span>
                    <span className="font-serif text-lg text-charcoal">{formatZar(result.total)}</span>
                  </div>
                </div>
              </div>

              {/* Fulfilment */}
              <div className="bg-background border border-charcoal/8 p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  {result.fulfilment === 'pickup'
                    ? <Package className="w-4 h-4 text-sage" />
                    : <Truck className="w-4 h-4 text-terracotta" />}
                  <p className="text-sm font-sans font-500 text-charcoal capitalize">
                    {result.fulfilment === 'pickup' ? 'Pickup — Free' : 'Delivery'}
                  </p>
                </div>
                {result.pickupPoint && <p className="text-sm text-muted">{result.pickupPoint}</p>}
                {result.estimatedDelivery && (
                  <p className="text-sm text-muted">{result.estimatedDelivery}</p>
                )}
              </div>

              {/* Certificate CTA — delivered orders only */}
              {result.status === 'delivered' && onViewCertificate && (
                <div className="flex items-center justify-between p-4 bg-parchment/50 border border-charcoal/8 mt-2">
                  <div>
                    <p className="text-xs font-sans uppercase tracking-widest text-charcoal mb-0.5">Certificate of Authenticity</p>
                    <p className="text-xs text-muted">Available for this order</p>
                  </div>
                  <button
                    onClick={() => onViewCertificate(result.ref)}
                    className="flex items-center gap-2 px-4 py-2 bg-charcoal text-background text-xs font-sans uppercase tracking-widest hover:bg-terracotta transition-colors duration-400 flex-shrink-0"
                  >
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Help CTA */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pt-2">
                <p className="text-xs text-muted leading-relaxed">
                  Questions? Email{' '}
                  <a href="mailto:hello@mapheane.art" className="text-terracotta hover:text-terracottaDark transition-colors">
                    hello@mapheane.art
                  </a>{' '}
                  with your order reference.
                </p>
                <button onClick={() => onNavigate('contact')}
                  className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-muted hover:text-terracotta transition-colors border-b border-charcoal/15 pb-px hover:border-terracotta/40 flex-shrink-0">
                  Contact studio <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help text — shown when no search yet */}
        {!result && !notFound && !loading && (
          <div className="mt-12 pt-10 border-t border-charcoal/8">
            <p className="text-label uppercase tracking-[0.25em] text-muted mb-4">Can't find your reference?</p>
            <div className="space-y-3 text-sm text-muted leading-relaxed">
              <p>Your order reference was sent in your confirmation email from hello@mapheane.art.</p>
              <p>It looks like <span className="font-sans font-500 text-charcoal tracking-widest">MAP-XXXXXX</span> (6 characters after the dash).</p>
              <a href="mailto:hello@mapheane.art" className="inline-flex items-center gap-2 text-terracotta hover:text-terracottaDark transition-colors mt-2">
                <Mail className="w-3.5 h-3.5" /> Contact us directly
              </a>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
