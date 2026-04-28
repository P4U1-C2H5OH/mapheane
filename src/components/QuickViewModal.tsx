import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, ArrowRight, ZoomIn } from 'lucide-react';
import { Artwork } from '../data/artworks';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { LightboxModal } from './LightboxModal';
import { eurToZar, formatZar } from '../lib/pricing';

interface QuickViewModalProps {
  artwork: Artwork;
  onClose: () => void;
  onViewFull: (id: string) => void;
  onCommission?: (artwork: Artwork) => void;
}

export function QuickViewModal({ artwork, onClose, onViewFull, onCommission }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { cartAdded, wishlisted } = useToast();
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const wishlisting = isWishlisted(artwork.id);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Keyboard close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleAddToCart = async () => {
    if (artwork.status !== 'Available') return;
    setAdding(true);
    addToCart(artwork);
    await new Promise(r => setTimeout(r, 600));
    setAdding(false);
    cartAdded(
      `"${artwork.title}" added`,
      `${artwork.dimensions} · ${artwork.technique}`,
      { label: 'View Cart', onClick: () => {} }
    );
  };

  const handleWishlist = () => {
    const added = !wishlisting;
    toggleWishlist(artwork.id);
    if (added) {
      wishlisted(`"${artwork.title}" saved to wishlist`);
    }
  };

  const priceDisplay = new Intl.NumberFormat('en-ZA', {
    style: 'currency', currency: 'ZAR', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(eurToZar(artwork.price));

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="qv-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[70] bg-ink/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          key="qv-panel"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl top-1/2 -translate-y-1/2 z-[80] bg-background shadow-modal overflow-hidden"
          style={{ maxHeight: '90vh' }}
        >
          {/* Top terracotta rule */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-terracotta/50 to-transparent" />

          <div className="flex flex-col md:flex-row overflow-y-auto md:overflow-hidden" style={{ maxHeight: 'calc(90vh - 1px)' }}>

            {/* ─── Image pane ─────────────────────────── */}
            <div className="md:w-5/12 flex-shrink-0 relative">
              {/* Main image */}
              <div
                className="relative aspect-[4/5] md:aspect-auto md:h-full overflow-hidden group cursor-zoom-in bg-parchment"
                onClick={() => setLightboxOpen(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={artwork.images[activeImg]}
                    alt={artwork.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-luxury"
                    draggable={false}
                  />
                </AnimatePresence>

                {/* Zoom hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-background/80 backdrop-blur-sm px-3 py-2 flex items-center gap-2">
                    <ZoomIn className="w-3.5 h-3.5 text-charcoal" />
                    <span className="text-label uppercase tracking-widest text-charcoal">Zoom</span>
                  </div>
                </div>

                {/* Status badge */}
                {artwork.status === 'Sold' && (
                  <div className="absolute top-3 left-3 bg-charcoal text-background text-label uppercase tracking-widest px-3 py-1.5">
                    Sold
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {artwork.images.length > 1 && (
                <div className="absolute bottom-3 left-3 flex gap-1.5">
                  {artwork.images.map((src, i) => (
                    <button
                      key={i}
                      onClick={e => { e.stopPropagation(); setActiveImg(i); }}
                      className={`w-8 h-8 overflow-hidden border transition-all duration-200 ${
                        i === activeImg ? 'border-terracotta' : 'border-background/40'
                      }`}
                    >
                      <img src={src} alt="" draggable={false} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Info pane ──────────────────────────── */}
            <div className="md:w-7/12 flex flex-col p-6 md:p-8 overflow-y-auto">

              {/* Close */}
              <button
                onClick={onClose}
                className="self-end w-7 h-7 flex items-center justify-center text-muted hover:text-charcoal hover:rotate-90 transition-all duration-400 mb-4"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Medium tag */}
              <span className="text-label uppercase tracking-[0.25em] text-terracotta mb-3 block">
                {artwork.medium} · {artwork.year}
              </span>

              {/* Title */}
              <h2 className="font-serif text-3xl md:text-4xl italic text-charcoal leading-tight mb-2" style={{ letterSpacing: '-0.01em' }}>
                {artwork.title}
              </h2>

              {/* Technique */}
              <p className="text-sm text-muted mb-4">{artwork.technique}</p>

              {/* Divider */}
              <div className="w-10 h-px bg-terracotta/30 mb-5" />

              {/* Price + dimensions */}
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="font-serif text-2xl text-charcoal">{formatZar(eurToZar(artwork.price))}</span>
                  <span className="text-xs text-muted ml-2">ZAR</span>
                </div>
                <span className="text-xs text-muted font-sans uppercase tracking-widest">{artwork.dimensions}</span>
              </div>
              <p className="text-xs text-muted/60 mb-6 font-sans">≈ €{artwork.price.toFixed(2)} · Original work</p>

              {/* Description */}
              <p className="text-sm text-charcoal/70 leading-relaxed mb-8 flex-1">
                {artwork.description}
              </p>

              {/* Actions */}
              <div className="space-y-3">
                {/* Add to cart */}
                {artwork.status === 'Available' ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="w-full flex items-center justify-center gap-3 bg-terracotta text-white py-3.5 px-6 text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracottaDark transition-colors duration-400 disabled:opacity-60"
                  >
                    {adding ? (
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Acquire Original
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center gap-3 bg-charcoal/8 text-muted py-3.5 px-6 text-xs font-sans uppercase tracking-[0.2em]">
                    Sold — Inquire for Commissions
                  </div>
                )}

                {/* Wishlist + Commission row */}
                <div className="flex gap-2">
                  <button
                    onClick={handleWishlist}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 border text-xs font-sans uppercase tracking-widest transition-all duration-300 ${
                      wishlisting
                        ? 'border-terracotta bg-terracotta/6 text-terracotta'
                        : 'border-charcoal/15 text-muted hover:border-charcoal/30 hover:text-charcoal'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${wishlisting ? 'fill-terracotta' : ''}`} />
                    {wishlisting ? 'Saved' : 'Save'}
                  </button>

                  {onCommission && (
                    <button
                      onClick={() => { onClose(); onCommission(artwork); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-charcoal/15 text-muted hover:border-charcoal/30 hover:text-charcoal text-xs font-sans uppercase tracking-widest transition-all duration-300"
                    >
                      Commission Similar
                    </button>
                  )}
                </div>

                {/* View full page */}
                <button
                  onClick={() => { onClose(); onViewFull(artwork.id); }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-sans uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-colors duration-300 pt-1"
                >
                  Full Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Lightbox from within quick view */}
      {lightboxOpen && (
        <LightboxModal
          images={artwork.images}
          artworkTitle={artwork.title}
          initialIndex={activeImg}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
