import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, X, ShoppingBag, ArrowRight, Heart,
  Shield, Truck, RefreshCw, Tag
} from 'lucide-react';
import { useCart, cartItemKey } from '../context/CartContext';
import { useWishlist }          from '../context/WishlistContext';
import { useCurrency }  from '../context/CurrencyContext';
import { useToast }     from '../context/ToastContext';
import { useSEO }       from '../hooks/useSEO';
import { LazyImage }    from '../components/LazyImage';

interface CartPageProps {
  onNavigate: (page: any) => void;
}

const TRUST_SIGNALS = [
  { icon: Shield,    text: 'Secure payment',      sub: 'M-Pesa · EcoCash' },
  { icon: Truck,     text: 'Insured shipping',     sub: 'DHL tracked delivery' },
  { icon: RefreshCw, text: 'Certificate of auth.', sub: 'Signed by Mapheane'   },
];

export function CartPage({ onNavigate }: CartPageProps) {
  useSEO({ title: 'Cart', description: 'Your cart — Mapheane original artworks and print editions.' });

  const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart();
  const { toggleWishlist, isWishlisted }  = useWishlist();
  const { format: fmt, currency }         = useCurrency();
  const { wishlisted, success }           = useToast();
  const [removingKey, setRemovingKey] = useState<string | null>(null);

  const subtotal    = getCartTotal();
  const shippingMsg = 'Calculated at checkout';

  const handleRemove = (artworkId: string, editionId?: string) => {
    const key = `${artworkId}::${editionId ?? 'original'}`;
    setRemovingKey(key);
    setTimeout(() => { removeFromCart(artworkId, editionId); setRemovingKey(null); }, 350);
  };

  const handleSaveForLater = (artworkId: string, title: string, editionId?: string) => {
    toggleWishlist(artworkId);
    removeFromCart(artworkId, editionId);
    wishlisted(`"${title}" moved to wishlist`);
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen pt-32 pb-24 px-5 sm:px-8 md:px-12 flex items-center justify-center"
      >
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-parchment flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-9 h-9 text-muted stroke-[1]" />
          </div>
          <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Empty</span>
          <h1 className="font-serif text-4xl italic text-charcoal mb-4" style={{ letterSpacing: '-0.01em' }}>
            Your cart is empty
          </h1>
          <p className="text-muted text-sm leading-relaxed mb-10">
            Browse the gallery to find something for your collection.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('gallery')}
              className="flex items-center justify-center gap-2 bg-terracotta text-background px-8 py-3.5 text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracottaDark transition-colors shadow-button"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Explore Gallery
            </button>
            <button
              onClick={() => onNavigate('wishlist')}
              className="flex items-center justify-center gap-2 border border-charcoal/15 text-muted px-8 py-3.5 text-xs font-sans uppercase tracking-widest hover:border-charcoal/30 hover:text-charcoal transition-all"
            >
              <Heart className="w-3.5 h-3.5" /> Saved Works
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Cart with items ───────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen pt-28 pb-24 bg-background"
    >
      <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <button
            onClick={() => onNavigate('gallery')}
            className="group flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Continue shopping
          </button>
          <h1 className="font-serif text-4xl md:text-5xl italic text-charcoal" style={{ letterSpacing: '-0.015em' }}>
            Cart
            <span className="text-lg text-muted ml-3 not-italic">({cartItems.length})</span>
          </h1>
          <button
            onClick={() => { clearCart(); success('Cart cleared'); }}
            className="text-xs font-sans uppercase tracking-widest text-muted hover:text-charcoal transition-colors hidden sm:block border-b border-charcoal/15 pb-px hover:border-charcoal/40"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── Cart items ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-0">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, idx) => {
                const itemKey = cartItemKey(item);
                const itemPrice = (item.edition?.price.eur ?? item.artwork.price) * item.quantity;
                return (
                <motion.div
                  key={itemKey}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: removingKey === itemKey ? 0 : 1, y: 0 }}
                  exit={{ opacity: 0, x: -24, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`flex gap-4 sm:gap-6 py-6 ${idx > 0 ? 'border-t border-charcoal/8' : ''}`}
                >
                  {/* Image */}
                  <button
                    onClick={() => onNavigate('artwork')}
                    className="flex-shrink-0 w-24 h-28 sm:w-32 sm:h-40 overflow-hidden bg-parchment group"
                    aria-label={`View ${item.artwork.title}`}
                  >
                    <LazyImage
                      src={item.artwork.images[0]}
                      alt={item.artwork.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      objectPosition={item.artwork.cropPosition}
                    />
                  </button>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                    <div>
                      <button
                        onClick={() => onNavigate('artwork')}
                        className="font-serif text-xl sm:text-2xl italic text-charcoal hover:text-terracotta transition-colors text-left leading-tight"
                        style={{ letterSpacing: '-0.01em' }}
                      >
                        {item.artwork.title}
                      </button>
                      <p className="text-xs font-sans uppercase tracking-widest text-muted mt-1">{item.artwork.technique}</p>
                      <p className="text-xs text-muted/60 mt-0.5">
                        {item.edition ? item.edition.size : item.artwork.dimensions}
                      </p>
                    </div>

                    {/* Provenance / edition note */}
                    <div className="bg-parchment/50 border border-charcoal/6 px-3 py-2 inline-flex items-center gap-2">
                      <Tag className="w-3 h-3 text-muted flex-shrink-0" />
                      <p className="text-xs text-muted">
                        {item.edition
                          ? `${item.edition.type} Edition · ${item.edition.paper || item.edition.size}`
                          : 'Original — includes Certificate of Authenticity'}
                      </p>
                    </div>

                    {/* Price + actions */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="font-serif text-xl text-charcoal">{fmt(itemPrice)}</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleSaveForLater(item.artwork.id, item.artwork.title, item.edition?.id)}
                          className="text-xs font-sans text-muted hover:text-terracotta transition-colors flex items-center gap-1.5"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isWishlisted(item.artwork.id) ? 'fill-terracotta text-terracotta' : ''}`} />
                          <span className="hidden sm:inline">Save for later</span>
                        </button>
                        <button
                          onClick={() => handleRemove(item.artwork.id, item.edition?.id)}
                          className="text-xs font-sans text-muted hover:text-red-400 transition-colors flex items-center gap-1.5"
                          aria-label="Remove from cart"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Upsell: Collector's Circle */}
            <div className="mt-8 border-t border-charcoal/8 pt-8">
              <div className="bg-terracotta/5 border border-terracotta/15 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-sans font-500 text-sm text-charcoal mb-1">
                    Join the Collector's Circle
                  </p>
                  <p className="text-xs text-muted leading-relaxed">
                    Members get 48-hour early access to new works and quarterly signed prints from R320/month.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('circle')}
                  className="text-xs font-sans uppercase tracking-widest text-terracotta hover:text-terracottaDark transition-colors border-b border-terracotta/30 pb-px flex-shrink-0"
                >
                  Learn more →
                </button>
              </div>
            </div>
          </div>

          {/* ── Order summary ──────────────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <div className="bg-parchment/30 border border-charcoal/8 p-6 sm:p-7 lg:sticky lg:top-28">
              <p className="font-serif italic text-xl text-charcoal mb-6">Order Summary</p>

              {/* Line items */}
              <div className="space-y-3 mb-5 pb-5 border-b border-charcoal/8">
                {cartItems.map(item => {
                  const linePrice = (item.edition?.price.eur ?? item.artwork.price) * item.quantity;
                  return (
                    <div key={cartItemKey(item)} className="flex items-start justify-between gap-3 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-charcoal/80 truncate">{item.artwork.title}</p>
                        {item.edition && (
                          <p className="text-xs text-muted truncate">{item.edition.title || item.edition.size}</p>
                        )}
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted">× {item.quantity}</p>
                        )}
                      </div>
                      <p className="text-charcoal flex-shrink-0">{fmt(linePrice)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-charcoal">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Shipping</span>
                  <span className="text-muted">{shippingMsg}</span>
                </div>
                {currency.code !== 'ZAR' && (
                  <p className="text-xs text-muted/60">
                    Charged in ZAR · rate shown is approximate
                  </p>
                )}
              </div>

              <div className="flex justify-between items-baseline mb-7 pt-4 border-t border-charcoal/8">
                <span className="font-serif text-lg text-charcoal">Total</span>
                <div className="text-right">
                  <p className="font-serif text-3xl text-terracotta" style={{ letterSpacing: '-0.01em' }}>
                    {fmt(subtotal)}
                  </p>
                  {currency.code !== 'ZAR' && (
                    <p className="text-xs text-muted/60 mt-0.5">+ shipping at checkout</p>
                  )}
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => onNavigate('checkout')}
                className="w-full flex items-center justify-center gap-3 bg-terracotta text-background py-4 text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracottaDark transition-colors duration-400 shadow-button hover:shadow-button-hover mb-4"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              {/* Continue shopping */}
              <button
                onClick={() => onNavigate('gallery')}
                className="w-full flex items-center justify-center gap-2 border border-charcoal/12 text-muted py-3 text-xs font-sans uppercase tracking-widest hover:border-charcoal/25 hover:text-charcoal transition-all duration-300"
              >
                Continue browsing
              </button>

              {/* Trust signals */}
              <div className="mt-7 pt-6 border-t border-charcoal/8 space-y-3">
                {TRUST_SIGNALS.map(ts => {
                  const Icon = ts.icon;
                  return (
                    <div key={ts.text} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-charcoal/5 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-muted" />
                      </div>
                      <div>
                        <p className="text-xs font-sans font-500 text-charcoal">{ts.text}</p>
                        <p className="text-xs text-muted/60">{ts.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
