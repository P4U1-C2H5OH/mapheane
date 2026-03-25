import { useSEO } from '../hooks/useSEO';
import { useCurrency } from '../context/CurrencyContext';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus, ShoppingBag, Check, Heart, ZoomIn, Share2, Bell, BellRing } from 'lucide-react';
import { artworks } from '../data/artworks';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { LightboxModal } from '../components/LightboxModal';
import { CommissionModal } from '../components/CommissionModal';

interface ArtworkPageProps {
  artworkId: number;
  onNavigate: (page: any) => void;
}

export function ArtworkPage({ artworkId, onNavigate }: ArtworkPageProps) {
  const artwork = artworks.find(a => a.id === artworkId);
  useSEO({
    title: artwork?.title,
    description: artwork?.description,
    image: artwork?.images[0],
    type: 'product',
    price: artwork?.price,
    medium: artwork?.technique,
    year: artwork?.year,
  });
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { cartAdded, wishlisted } = useToast();

  const [selectedSize, setSelectedSize] = useState<'Original' | 'Large Print' | 'Medium Print'>('Original');
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySent, setNotifySent] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); setActiveImg(0); }, [artworkId]);

  if (!artwork) return null;

  const liked = isWishlisted(artwork.id);

  const getPrice = () => {
    if (selectedSize === 'Original')    return artwork.price;
    if (selectedSize === 'Large Print') return 450;
    return 250;
  };

  // ZAR approximation (R18 per €1)
  const { format: formatPrice, currency } = useCurrency();

  const handleAddToCart = () => {
    if (selectedSize === 'Original' && artwork.status === 'Available') {
      for (let i = 0; i < quantity; i++) addToCart(artwork);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
      cartAdded(
        `"${artwork.title}" added`,
        `${artwork.dimensions}`,
        { label: 'View Cart', onClick: () => onNavigate('cart') }
      );
    }
  };

  const handleWishlist = () => {
    const adding = !liked;
    toggleWishlist(artwork.id);
    if (adding) wishlisted(`"${artwork.title}" saved`);
  };

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    // Store intent locally — backend will pick this up when wired
    const key = `notify_${artwork.id}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]') as string[];
    if (!existing.includes(notifyEmail)) {
      localStorage.setItem(key, JSON.stringify([...existing, notifyEmail]));
    }
    setNotifySent(true);
    setNotifyEmail('');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: artwork.title, text: artwork.description, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const SIZES = [
    { id: 'Original'    as const, label: 'Original Work', eur: artwork.price, disabled: artwork.status === 'Sold' },
    { id: 'Large Print' as const, label: 'Large Edition Print', eur: 450, disabled: false },
    { id: 'Medium Print'as const, label: 'Medium Edition Print', eur: 250, disabled: false },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-background min-h-screen w-full pt-28 pb-24 px-6 md:px-12"
      >
        <div className="container mx-auto max-w-7xl">

          {/* Back */}
          <button
            onClick={() => onNavigate('gallery')}
            className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-12"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Gallery
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

            {/* ─── Left: Images ─────────────────────────── */}
            <div className="lg:col-span-7 space-y-4">

              {/* Main image */}
              <div
                className="relative w-full aspect-[4/5] overflow-hidden bg-parchment cursor-zoom-in group shadow-artwork"
                onClick={() => setLightboxOpen(true)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-ink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                {/* Zoom hint */}
                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-background/80 backdrop-blur-sm px-3 py-2 flex items-center gap-2">
                    <ZoomIn className="w-3.5 h-3.5 text-charcoal" />
                    <span className="text-label uppercase tracking-widest text-charcoal">Zoom</span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    src={artwork.images[activeImg]}
                    alt={artwork.title}
                    draggable={false}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-luxury group-hover:scale-[1.02]"
                    style={{ objectPosition: activeImg === 0 ? artwork.cropPosition : 'center' }}
                  />
                </AnimatePresence>

                {artwork.status === 'Sold' && (
                  <div className="absolute bottom-4 left-4 bg-charcoal/80 text-background text-label uppercase tracking-widest px-3 py-1.5">
                    Sold
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {artwork.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {artwork.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`relative w-20 h-20 flex-shrink-0 overflow-hidden border-2 transition-all duration-300 ${
                        activeImg === idx ? 'border-terracotta' : 'border-transparent hover:border-charcoal/20'
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} draggable={false}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: idx === 0 ? artwork.cropPosition : 'center' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Artist video — if available */}
              {artwork.video && (
                <div className="border-t border-charcoal/6 pt-5">
                  <p className="text-label uppercase tracking-[0.2em] text-muted mb-3">Artist on this work</p>
                  {artwork.video.includes('youtube.com') || artwork.video.includes('youtu.be') ? (
                    <div className="relative w-full aspect-video bg-charcoal/5">
                      <iframe
                        src={artwork.video.replace('watch?v=', 'embed/')}
                        title={`${artwork.title} — artist statement`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  ) : (
                    <video
                      src={artwork.video}
                      controls
                      playsInline
                      className="w-full aspect-video bg-charcoal/5 object-contain"
                      aria-label={`${artwork.title} — artist statement`}
                    />
                  )}
                </div>
              )}

              {/* Provenance note */}
              <div className="border-t border-charcoal/6 pt-5 flex items-start gap-3">
                <div className="w-px h-10 bg-terracotta/30 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted leading-relaxed">
                  Every original work ships with a hand-signed Certificate of Authenticity, professional packing, and DHL Express international tracking. Import duties are the buyer's responsibility.
                </p>
              </div>
            </div>

            {/* ─── Right: Details + Purchase ─────────────── */}
            <div className="lg:col-span-5 flex flex-col">

              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-label uppercase tracking-[0.25em] text-terracotta">
                    {artwork.medium} · {artwork.year}
                  </span>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleWishlist}
                      className="w-8 h-8 flex items-center justify-center border border-charcoal/12 hover:border-terracotta transition-all duration-300"
                      aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-terracotta text-terracotta' : 'text-muted'}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="w-8 h-8 flex items-center justify-center border border-charcoal/12 hover:border-charcoal/30 transition-all duration-300"
                      aria-label="Share"
                    >
                      <Share2 className="w-3.5 h-3.5 text-muted" />
                    </button>
                  </div>
                </div>

                <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-3" style={{ letterSpacing: '-0.015em', lineHeight: '1.1' }}>
                  {artwork.title}
                </h1>
                <p className="text-sm text-muted mb-5">{artwork.technique}</p>

                {/* Price block */}
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="font-serif text-3xl text-charcoal">{formatPrice(getPrice())}</span>
                  <span className="text-sm text-muted">ZAR</span>
                </div>
                <p className="text-xs text-muted/60">≈ €{getPrice().toLocaleString()} · {artwork.dimensions}</p>
              </div>

              <div className="w-12 h-px bg-terracotta/30 mb-8" />

              {/* Description */}
              <p className="text-sm text-charcoal/70 leading-relaxed mb-6">{artwork.description}</p>

              {/* Artist statement — longer note if present */}
              {artwork.statement && (
                <div className="border-l-2 border-terracotta/20 pl-5 mb-8">
                  <p className="text-label uppercase tracking-widest text-muted mb-2">Artist's Note</p>
                  <p className="font-serif italic text-base text-charcoal/70 leading-relaxed">{artwork.statement}</p>
                </div>
              )}

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-6 mb-10">
                {[
                  { label: 'Dimensions',  value: artwork.dimensions },
                  { label: 'Medium',      value: artwork.medium     },
                  { label: 'Technique',   value: artwork.technique  },
                  { label: 'Year',        value: String(artwork.year || 2024) },
                ].map(spec => (
                  <div key={spec.label}>
                    <p className="text-label uppercase tracking-widest text-muted mb-1">{spec.label}</p>
                    <p className="text-sm text-charcoal font-sans">{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* Purchase panel */}
              <div className="bg-parchment/40 p-6 border border-charcoal/6 space-y-6">

                {/* Format selector */}
                <div>
                  <p className="text-label uppercase tracking-widest text-muted mb-3">Format</p>
                  <div className="space-y-2">
                    {SIZES.map(size => (
                      <button
                        key={size.id}
                        onClick={() => !size.disabled && setSelectedSize(size.id)}
                        disabled={size.disabled}
                        className={`w-full flex items-center justify-between px-4 py-3 border transition-all duration-300 ${
                          selectedSize === size.id
                            ? 'border-terracotta bg-terracotta/5 text-charcoal'
                            : size.disabled
                            ? 'border-charcoal/8 text-muted/40 cursor-not-allowed opacity-60'
                            : 'border-charcoal/10 hover:border-charcoal/25 text-charcoal/75'
                        }`}
                      >
                        <span className="font-serif text-sm">{size.label}</span>
                        <span className="text-xs text-muted font-sans">
                          {size.disabled ? 'Sold' : formatPrice(size.eur)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity — only for originals */}
                {selectedSize === 'Original' && artwork.status === 'Available' && (
                  <div>
                    <p className="text-label uppercase tracking-widest text-muted mb-3">Quantity</p>
                    <div className="inline-flex items-center border border-charcoal/15">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-charcoal/5 transition-colors">
                        <Minus className="w-3.5 h-3.5 text-charcoal" />
                      </button>
                      <span className="w-10 text-center font-serif text-lg text-charcoal">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-2 hover:bg-charcoal/5 transition-colors">
                        <Plus className="w-3.5 h-3.5 text-charcoal" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Add to cart or Notify me */}
                {selectedSize === 'Original' && artwork.status === 'Sold' ? (
                  <div className="space-y-3">
                    <div className="text-center py-2">
                      <span className="text-label uppercase tracking-[0.2em] text-muted">This work has found a home</span>
                    </div>
                    {notifySent ? (
                      <div className="flex items-center justify-center gap-2 py-3 bg-sage/10 border border-sage/30">
                        <BellRing className="w-4 h-4 text-sage" />
                        <span className="text-xs font-sans uppercase tracking-widest text-sage">We'll let you know</span>
                      </div>
                    ) : notifyOpen ? (
                      <form onSubmit={handleNotify} className="space-y-2">
                        <input
                          type="email"
                          value={notifyEmail}
                          onChange={e => setNotifyEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className="w-full px-4 py-3 border border-charcoal/15 bg-background text-sm font-sans text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-terracotta transition-colors"
                        />
                        <button
                          type="submit"
                          className="w-full flex items-center justify-center gap-2 py-3 bg-charcoal text-background text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracotta transition-colors duration-300"
                        >
                          <Bell className="w-3.5 h-3.5" /> Notify Me
                        </button>
                        <button type="button" onClick={() => setNotifyOpen(false)} className="w-full text-xs text-muted/60 hover:text-muted py-1">
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setNotifyOpen(true)}
                        className="w-full flex items-center justify-center gap-3 py-4 border border-charcoal/20 text-xs font-sans uppercase tracking-[0.2em] text-charcoal hover:border-terracotta hover:text-terracotta transition-all duration-300"
                      >
                        <Bell className="w-4 h-4" /> Notify me if available
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                    className="w-full flex items-center justify-center gap-3 py-4 text-xs font-sans uppercase tracking-[0.2em] transition-all duration-400 disabled:cursor-not-allowed shadow-button hover:shadow-button-hover"
                    style={{
                      backgroundColor: addedToCart ? '#7C8B6F' : '#A0522D',
                      color: 'white',
                    }}
                  >
                    {addedToCart ? (
                      <><Check className="w-4 h-4" /> Added</>
                    ) : (
                      <><ShoppingBag className="w-4 h-4" /> Acquire — {formatPrice(getPrice() * quantity)}</>
                    )}
                  </button>
                )}

                {/* Commission similar */}
                <button
                  onClick={() => setCommissionOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-charcoal/15 text-xs font-sans uppercase tracking-widest text-muted hover:border-terracotta hover:text-terracotta transition-all duration-300"
                >
                  Commission a Similar Work
                </button>

                <p className="text-center text-xs text-muted/50 font-sans">
                  Free worldwide shipping · Certificate of Authenticity included
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lightbox */}
      {lightboxOpen && (
        <LightboxModal
          images={artwork.images}
          artworkTitle={artwork.title}
          initialIndex={activeImg}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Commission modal */}
      {commissionOpen && (
        <CommissionModal
          prefillArtwork={artwork}
          onClose={() => setCommissionOpen(false)}
          onNavigateCommission={() => { setCommissionOpen(false); onNavigate('commission'); }}
        />
      )}
    </>
  );
}
